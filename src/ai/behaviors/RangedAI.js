import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import SuccessNode from '../nodes/SuccessNode.js';
import { NodeState } from '../nodes/Node.js';

import CanUseSkillBySlotNode from '../nodes/CanUseSkillBySlotNode.js';
import FindTargetBySkillTypeNode from '../nodes/FindTargetBySkillTypeNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
import FindKitingPositionNode from '../nodes/FindKitingPositionNode.js';
import IsTargetTooCloseNode from '../nodes/IsTargetTooCloseNode.js';
import FindMeleeStrategicTargetNode from '../nodes/FindMeleeStrategicTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';
import MBTIActionNode from '../nodes/MBTIActionNode.js';
import IsHealthBelowThresholdNode from '../nodes/IsHealthBelowThresholdNode.js';
import FleeNode from '../nodes/FleeNode.js';
import FindNearestAllyInDangerNode from '../nodes/FindNearestAllyInDangerNode.js';
import FindPathToAllyNode from '../nodes/FindPathToAllyNode.js';
import JustRecoveredFromStunNode from '../nodes/JustRecoveredFromStunNode.js';
import SetTargetToStunnerNode from '../nodes/SetTargetToStunnerNode.js';
import FindSafeRepositionNode from '../nodes/FindSafeRepositionNode.js';
import { debugMBTIManager } from '../../game/debug/DebugMBTIManager.js';

function createRangedAI(engines = {}) {
    const executeSkillBranch = new SelectorNode([
        new SequenceNode([
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ]),
        new SequenceNode([
            new HasNotMovedNode(),
            new FindKitingPositionNode(engines),
            new MoveToTargetNode(engines),
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ])
    ]);

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
                new CanUseSkillBySlotNode(3),
                new FindTargetBySkillTypeNode(engines),
                executeSkillBranch
            ]),
            new SuccessNode()
        ]),
        { async evaluate() { debugMBTIManager.logDecisionEnd(); return NodeState.SUCCESS; } }
    ]);

    const postStunRecoveryBehavior = new SequenceNode([
        new JustRecoveredFromStunNode(),
        {
            async evaluate(unit) {
                debugMBTIManager.logDecisionStart('기절 회복 후 반응', unit);
                return NodeState.SUCCESS;
            }
        },
        new SelectorNode([
            new SequenceNode([
                new MBTIActionNode('P'),
                { async evaluate() { debugMBTIManager.logAction('즉각 반격 선택 (P)'); return NodeState.SUCCESS; } },
                new CanUseSkillBySlotNode(3),
                new FindTargetBySkillTypeNode(engines),
                executeSkillBranch
            ]),
            new SequenceNode([
                new MBTIActionNode('J'),
                { async evaluate() { debugMBTIManager.logAction('위치 정비 선택 (J)'); return NodeState.SUCCESS; } },
                new HasNotMovedNode(),
                new FindSafeRepositionNode(engines),
                new MoveToTargetNode(engines)
            ]),
            new SuccessNode()
        ]),
        { async evaluate() { debugMBTIManager.logDecisionEnd(); return NodeState.SUCCESS; } }
    ]);

    const allyCareBehavior = new SequenceNode([
        new FindNearestAllyInDangerNode(),
        {
            async evaluate(unit) {
                debugMBTIManager.logDecisionStart('아군 보호 판단', unit);
                return NodeState.SUCCESS;
            }
        },
        new SelectorNode([
            new SequenceNode([
                new MBTIActionNode('F'),
                { async evaluate() { debugMBTIManager.logAction('아군 지원 위치로 이동'); return NodeState.SUCCESS; } },
                new HasNotMovedNode(),
                new FindPathToAllyNode(engines),
                new MoveToTargetNode(engines)
            ]),
            new SuccessNode()
        ]),
        { async evaluate() { debugMBTIManager.logDecisionEnd(); return NodeState.SUCCESS; } }
    ]);

    const attackSequence = new SelectorNode([
        new SequenceNode([ new CanUseSkillBySlotNode(0), new FindTargetBySkillTypeNode(engines), executeSkillBranch ]),
        new SequenceNode([ new CanUseSkillBySlotNode(1), new FindTargetBySkillTypeNode(engines), executeSkillBranch ]),
        new SequenceNode([ new CanUseSkillBySlotNode(2), new FindTargetBySkillTypeNode(engines), executeSkillBranch ]),
        new SequenceNode([ new CanUseSkillBySlotNode(3), new FindTargetBySkillTypeNode(engines), executeSkillBranch ]),
        new SequenceNode([ new CanUseSkillBySlotNode(4), new FindTargetBySkillTypeNode(engines), executeSkillBranch ]),
        new SequenceNode([ new CanUseSkillBySlotNode(5), new FindTargetBySkillTypeNode(engines), executeSkillBranch ]),
        new SequenceNode([ new CanUseSkillBySlotNode(6), new FindTargetBySkillTypeNode(engines), executeSkillBranch ]),
        new SequenceNode([ new CanUseSkillBySlotNode(7), new FindTargetBySkillTypeNode(engines), executeSkillBranch ])
    ]);

    const kitingBehavior = new SequenceNode([
        new HasNotMovedNode(),
        new IsTargetTooCloseNode({ ...engines, dangerZone: 2 }),
        new FindKitingPositionNode(engines),
        new MoveToTargetNode(engines),
        new SelectorNode([
            attackSequence,
            new SuccessNode()
        ])
    ]);

    const rootNode = new SelectorNode([
        survivalBehavior,
        postStunRecoveryBehavior,
        allyCareBehavior,
        kitingBehavior,
        attackSequence,
        new SequenceNode([
            new HasNotMovedNode(),
            new FindMeleeStrategicTargetNode(engines),
            new FindPathToTargetNode(engines),
            new MoveToTargetNode(engines)
        ]),
        new SuccessNode()
    ]);

    return new BehaviorTree(rootNode);
}

export { createRangedAI };
