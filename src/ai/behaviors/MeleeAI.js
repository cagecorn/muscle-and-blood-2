import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import SuccessNode from '../nodes/SuccessNode.js';
import { NodeState } from '../nodes/Node.js';

// 신규 노드 및 재사용 노드 import
import CanUseSkillBySlotNode from '../nodes/CanUseSkillBySlotNode.js';
import FindTargetBySkillTypeNode from '../nodes/FindTargetBySkillTypeNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
import FindPathToSkillRangeNode from '../nodes/FindPathToSkillRangeNode.js';
import FindMeleeStrategicTargetNode from '../nodes/FindMeleeStrategicTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';
import MBTIActionNode from '../nodes/MBTIActionNode.js';
import IsHealthBelowThresholdNode from '../nodes/IsHealthBelowThresholdNode.js';
import FleeNode from '../nodes/FleeNode.js';
import FindNearestAllyInDangerNode from '../nodes/FindNearestAllyInDangerNode.js';
import FindPathToAllyNode from '../nodes/FindPathToAllyNode.js';
import { debugMBTIManager } from '../../game/debug/DebugMBTIManager.js';

/**
 * 근접 유닛(전사)을 위한 행동 트리를 재구성합니다.
 *
 * 행동 우선순위:
 * 1. 스킬 사용: 1~4순위 스킬을 순서대로 확인하여 사용 가능한 스킬이 있다면, 이동해서라도 사용합니다.
 * 2. 이동만 하기: 사용할 스킬이 없다면, 전략적 목표를 향해 이동하고 턴을 마칩니다.
 */
function createMeleeAI(engines = {}) {

    // 스킬 하나를 실행하는 공통 로직 (이동 포함)
    const executeSkillBranch = new SelectorNode([
        // A. 제자리에서 즉시 사용
        new SequenceNode([
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ]),
        // B. 이동 후 사용
        new SequenceNode([
            // ✨ 이동하기 전에 아직 움직이지 않았는지 확인합니다.
            new HasNotMovedNode(),
            new FindPathToSkillRangeNode(engines),
            new MoveToTargetNode(engines),
            new IsSkillInRangeNode(engines), // 이동 후 사거리 재확인
            new UseSkillNode(engines)
        ])
    ]);

    // MBTI 기반 이동 결정
    const mbtiBasedMovement = new SequenceNode([
        {
            async evaluate(unit) {
                debugMBTIManager.logDecisionStart('이동 방식 결정', unit);
                return NodeState.SUCCESS;
            }
        },
        new SelectorNode([
            new SequenceNode([
                new MBTIActionNode('E'),
                { async evaluate() { debugMBTIManager.logAction('적극적 이동'); return NodeState.SUCCESS; } },
                new FindMeleeStrategicTargetNode(engines),
                new FindPathToTargetNode(engines),
                new MoveToTargetNode(engines)
            ]),
            new SequenceNode([
                new MBTIActionNode('I'),
                { async evaluate() { debugMBTIManager.logAction('신중한 대기'); return NodeState.SUCCESS; } },
                new SuccessNode()
            ])
        ]),
        { async evaluate() { debugMBTIManager.logDecisionEnd(); return NodeState.SUCCESS; } }
    ]);

    // 체력이 낮을 때 생존 본능
    const survivalBehavior = new SequenceNode([
        new IsHealthBelowThresholdNode(0.35),
        {
            async evaluate(unit) {
                debugMBTIManager.logDecisionStart('생존 본능 발동', unit);
                return NodeState.SUCCESS;
            }
        },
        new SelectorNode([
            new SequenceNode([
                new MBTIActionNode('I'),
                { async evaluate() { debugMBTIManager.logAction('후퇴 선택'); return NodeState.SUCCESS; } },
                new FleeNode(engines),
                new MoveToTargetNode(engines)
            ]),
            new SequenceNode([
                new MBTIActionNode('E'),
                { async evaluate() { debugMBTIManager.logAction('최후의 발악 선택'); return NodeState.SUCCESS; } },
                new FindTargetBySkillTypeNode(engines),
                new UseSkillNode(engines)
            ])
        ]),
        { async evaluate() { debugMBTIManager.logDecisionEnd(); return NodeState.SUCCESS; } }
    ]);

    // 위험한 아군을 돌보는 로직
    const allyCareBehavior = new SequenceNode([
        new FindNearestAllyInDangerNode(),
        new SelectorNode([
            new SequenceNode([
                new MBTIActionNode('F'),
                new HasNotMovedNode(),
                new FindPathToAllyNode(engines),
                new MoveToTargetNode(engines)
            ]),
            new SuccessNode()
        ])
    ]);

    const rootNode = new SelectorNode([
        // 최우선: 생존 본능
        survivalBehavior,

        // 두번째: 아군 돌보기 또는 무시
        allyCareBehavior,

        // 우선순위 1: 1번 슬롯 스킬 사용 시도
        new SequenceNode([
            new CanUseSkillBySlotNode(0),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        // 우선순위 2: 2번 슬롯 스킬 사용 시도
        new SequenceNode([
            new CanUseSkillBySlotNode(1),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        // 우선순위 3: 3번 슬롯 스킬 사용 시도
        new SequenceNode([
            new CanUseSkillBySlotNode(2),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        // 우선순위 4: 4번 슬롯 스킬 사용 시도 (보통 일반 공격)
        new SequenceNode([
            new CanUseSkillBySlotNode(3),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        // ✨ 우선순위 5 ~ 8: 특수 스킬 슬롯 체크
        new SequenceNode([
            new CanUseSkillBySlotNode(4),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        new SequenceNode([
            new CanUseSkillBySlotNode(5),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        new SequenceNode([
            new CanUseSkillBySlotNode(6),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        new SequenceNode([
            new CanUseSkillBySlotNode(7),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),

        // 우선순위 6: 사용할 스킬이 없을 경우 MBTI 기반 이동만 실행
        new SequenceNode([
            new HasNotMovedNode(),
            mbtiBasedMovement
        ]),

        // 최후의 보루: 아무것도 할 수 없을 때 성공으로 턴 종료
        new SuccessNode(),
    ]);

    return new BehaviorTree(rootNode);
}

export { createMeleeAI };
