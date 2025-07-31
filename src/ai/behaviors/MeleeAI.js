import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import { NodeState } from '../nodes/Node.js';

import FindBestSkillByScoreNode from '../nodes/FindBestSkillByScoreNode.js';
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

function createMeleeAI(engines = {}) {
    // --- 공통 사용 브랜치 ---
    const executeSkillBranch = new SelectorNode([
        new SequenceNode([
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ]),
        new SequenceNode([
            new HasNotMovedNode(),
            new FindPathToSkillRangeNode(engines),
            new MoveToTargetNode(engines),
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ])
    ]);

    // --- 기본 행동 (최후의 보루) ---
    const basicActionBranch = new SelectorNode([
        // 1. 사용 가능한 스킬이 있으면 공격
        new SequenceNode([
            new FindBestSkillByScoreNode(engines),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        // 2. 스킬 사용이 불가능하면 이동이라도 함
        new SequenceNode([
            new HasNotMovedNode(),
            new FindMeleeStrategicTargetNode(engines),
            new FindPathToTargetNode(engines),
            new MoveToTargetNode(engines)
        ])
    ]);

    // --- MBTI 기반 특수 행동들 ---
    const survivalBehavior = new SequenceNode([
        new IsHealthBelowThresholdNode(0.35),
        {
            async evaluate(unit) {
                debugMBTIManager.logDecisionStart('생존 본능', unit);
                return NodeState.SUCCESS;
            }
        },
        new SelectorNode([
            new SequenceNode([
                new MBTIActionNode('I', engines),
                {
                    async evaluate() {
                        debugMBTIManager.logAction('후퇴');
                        return NodeState.SUCCESS;
                    }
                },
                new FleeNode(engines),
                new MoveToTargetNode(engines)
            ]),
            new SequenceNode([
                new MBTIActionNode('E', engines),
                {
                    async evaluate() {
                        debugMBTIManager.logAction('최후의 발악');
                        return NodeState.SUCCESS;
                    }
                },
                new FindBestSkillByScoreNode(engines),
                new FindTargetBySkillTypeNode(engines),
                new UseSkillNode(engines)
            ])
        ]),
        { async evaluate() { debugMBTIManager.logDecisionEnd(); return NodeState.SUCCESS; } }
    ]);

    const allyCareBehavior = new SequenceNode([
        new FindNearestAllyInDangerNode(),
        new MBTIActionNode('F', engines),
        {
            async evaluate(unit) {
                debugMBTIManager.logDecisionStart('아군 보호', unit);
                return NodeState.SUCCESS;
            }
        },
        new HasNotMovedNode(),
        new FindPathToAllyNode(engines),
        new MoveToTargetNode(engines),
        { async evaluate() { debugMBTIManager.logDecisionEnd(); return NodeState.SUCCESS; } }
    ]);

    // --- 최종 행동 트리 구성 ---
    const rootNode = new SelectorNode([
        // 1순위: 특수한 상황 판단 및 행동 (생존, 아군보호 등)
        survivalBehavior,
        allyCareBehavior,
        // ... 다른 MBTI 기반 고차원적 행동들 ...

        // 2순위: 위 특수 행동들이 실행되지 않았다면, 반드시 기본 행동을 수행
        basicActionBranch
    ]);

    return new BehaviorTree(rootNode);
}

export { createMeleeAI };
