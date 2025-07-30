import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import SuccessNode from '../nodes/SuccessNode.js';

// 스킬 우선순위 로직에 필요한 노드들
import CanUseSkillBySlotNode from '../nodes/CanUseSkillBySlotNode.js';
import FindTargetBySkillTypeNode from '../nodes/FindTargetBySkillTypeNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
// ✨ FindPathToSkillRangeNode 대신 FindKitingPositionNode를 공격 이동에도 사용합니다.
import FindKitingPositionNode from '../nodes/FindKitingPositionNode.js';

// 기존 Ranged AI의 핵심 로직 노드들
import IsTargetTooCloseNode from '../nodes/IsTargetTooCloseNode.js';
import FindMeleeStrategicTargetNode from '../nodes/FindMeleeStrategicTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';
// ✨ HasNotMovedNode를 import합니다.
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';
import MBTIActionNode from '../nodes/MBTIActionNode.js';
import IsHealthBelowThresholdNode from '../nodes/IsHealthBelowThresholdNode.js';
import FleeNode from '../nodes/FleeNode.js';
import FindNearestAllyInDangerNode from '../nodes/FindNearestAllyInDangerNode.js';
import FindPathToAllyNode from '../nodes/FindPathToAllyNode.js';

/**
 * 원거리 유닛(거너)을 위한 행동 트리를 재구성합니다.
 *
 * 행동 우선순위:
 * 1. (생존) 가장 가까운 적이 너무 가까우면, 먼저 안전한 위치로 이동(카이팅)합니다.
 *    - 이동 후, 그 자리에서 사용할 수 있는 가장 우선순위 높은 스킬을 사용합니다.
 * 2. (공격) 위협적이지 않다면, 1~4순위 스킬을 순서대로 확인하여 가장 먼저 사용 가능한 스킬을 사용합니다.
 *    - ✨ [변경] 이때, 이동이 필요하다면 단순 접근이 아닌 '안전한 공격 위치'를 탐색합니다.
 * 3. (이동) 사용할 스킬이 없다면, 다음 턴을 위해 전략적으로 유리한 위치로 이동만 합니다.
 */
function createRangedAI(engines = {}) {

    // J 성향: 계획적 이동 후 공격
    const plannedAttack = new SequenceNode([
        new MBTIActionNode('J'),
        new HasNotMovedNode(),
        new FindKitingPositionNode(engines),
        new MoveToTargetNode(engines),
        new IsSkillInRangeNode(engines),
        new UseSkillNode(engines)
    ]);

    // P 성향: 즉흥적 제자리 공격
    const impulsiveAttack = new SequenceNode([
        new MBTIActionNode('P'),
        new IsSkillInRangeNode(engines),
        new UseSkillNode(engines)
    ]);

    // 스킬 하나를 실행하는 공통 로직 (MBTI 행동 포함)
    const executeSkillBranch = new SelectorNode([
        impulsiveAttack,
        plannedAttack,
        new SequenceNode([
            new HasNotMovedNode(),
            new FindKitingPositionNode(engines),
            new MoveToTargetNode(engines),
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ])
    ]);

    // 체력 낮을 때 도주 또는 발악
    const survivalBehavior = new SequenceNode([
        new IsHealthBelowThresholdNode(0.35),
        new SelectorNode([
            new SequenceNode([
                new MBTIActionNode('I'),
                new FleeNode(engines),
                new MoveToTargetNode(engines)
            ]),
            new SequenceNode([
                new MBTIActionNode('E'),
                new FindTargetBySkillTypeNode(engines),
                new UseSkillNode(engines)
            ]),
            new SuccessNode()
        ])
    ]);

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
    
    // 사용 가능한 가장 높은 우선순위의 스킬을 찾아 실행하는 로직
    const findAndUseBestSkillSequence = new SelectorNode([
        // 1순위 스킬
        new SequenceNode([
            new CanUseSkillBySlotNode(0),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        // 2순위 스킬
        new SequenceNode([
            new CanUseSkillBySlotNode(1),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        // 3순위 스킬
        new SequenceNode([
            new CanUseSkillBySlotNode(2),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        // 4순위 스킬 (보통 일반 공격)
        new SequenceNode([
            new CanUseSkillBySlotNode(3),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        // ✨ 우선순위 5 ~ 8 스킬
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
    ]);

    const rootNode = new SelectorNode([
        survivalBehavior,
        allyCareBehavior,

        // 최우선 순위 1: 생존 - 적이 너무 가까우면 카이팅부터 실행
        new SequenceNode([
            new HasNotMovedNode(),
            new IsTargetTooCloseNode({ ...engines, dangerZone: 2 }),
            new FindKitingPositionNode(engines),
            new MoveToTargetNode(engines),
            new SelectorNode([
                findAndUseBestSkillSequence,
                new SuccessNode()
            ])
        ]),

        // 우선순위 2: 공격 - 위협적이지 않다면 스킬 사용 시도
        findAndUseBestSkillSequence,

        // 우선순위 3: 이동 - 공격할 스킬이 없다면 이동만 실행
        new SequenceNode([
            new HasNotMovedNode(),
            new FindMeleeStrategicTargetNode(engines),
            new FindPathToTargetNode(engines),
            new MoveToTargetNode(engines)
        ]),

        // 최후의 보루: 아무것도 할 수 없을 때 성공으로 턴 종료
        new SuccessNode(),
    ]);

    return new BehaviorTree(rootNode);
}

export { createRangedAI };
