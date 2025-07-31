import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import SuccessNode from '../nodes/SuccessNode.js';
import { NodeState } from '../nodes/Node.js';

// 사용할 노드들을 import 합니다.
import CanUseSkillBySlotNode from '../nodes/CanUseSkillBySlotNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';
import FindTargetBySkillTypeNode from '../nodes/FindTargetBySkillTypeNode.js';
import FindSafeHealingPositionNode from '../nodes/FindSafeHealingPositionNode.js';
import FindSafeRepositionNode from '../nodes/FindSafeRepositionNode.js';
import MBTIActionNode from '../nodes/MBTIActionNode.js';
import IsHealthBelowThresholdNode from '../nodes/IsHealthBelowThresholdNode.js';
import FleeNode from '../nodes/FleeNode.js';
import FindNearestAllyInDangerNode from '../nodes/FindNearestAllyInDangerNode.js';
import FindPathToAllyNode from '../nodes/FindPathToAllyNode.js';
import JustRecoveredFromStunNode from '../nodes/JustRecoveredFromStunNode.js';
import SetTargetToStunnerNode from '../nodes/SetTargetToStunnerNode.js';
import { debugMBTIManager } from '../../game/debug/DebugMBTIManager.js';
import FindBestSkillByScoreNode from '../nodes/FindBestSkillByScoreNode.js';
import CheckAspirationStateNode from '../nodes/CheckAspirationStateNode.js';
import { ASPIRATION_STATE } from '../../game/utils/AspirationEngine.js';

/**
 * 힐러 유닛을 위한 합리적인 하드코딩 AI를 생성합니다.
 * @param {object} engines - AI 노드에 주입될 각종 엔진
 * @returns {BehaviorTree}
 */
function createHealerAI(engines = {}) {
    const executeSkillBranch = new SelectorNode([
        new SequenceNode([
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ]),
        new SequenceNode([
            new HasNotMovedNode(),
            new FindSafeHealingPositionNode(engines),
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
                new MBTIActionNode('E', engines),
                new FleeNode(engines),
                new MoveToTargetNode(engines)
            ]),
            new SequenceNode([
                new MBTIActionNode('I', engines),
                new FleeNode(engines),
                new MoveToTargetNode(engines)
            ])
        ]),
        { async evaluate() { debugMBTIManager.logDecisionEnd(); return NodeState.SUCCESS; } }
    ]);

    const postStunRecoveryBehavior = new SequenceNode([
        new JustRecoveredFromStunNode(),
        new SetTargetToStunnerNode(),
        new MBTIActionNode('T', engines),
        new CanUseSkillBySlotNode(0),
        executeSkillBranch
    ]);

    const supportSequence = new SequenceNode([
        new FindBestSkillByScoreNode(engines),
        new FindTargetBySkillTypeNode(engines),
        executeSkillBranch
    ]);

    const allyCareBehavior = new SequenceNode([
        new FindNearestAllyInDangerNode(engines),
        new MBTIActionNode('F', engines),
        new FindPathToAllyNode(engines),
        new MoveToTargetNode(engines),
        new CanUseSkillBySlotNode(1),
        executeSkillBranch
    ]);

    const repositionSequence = new SequenceNode([
        new HasNotMovedNode(),
        new FindSafeRepositionNode(engines),
        new MoveToTargetNode(engines)
    ]);

    const baseBehaviorTree = new SelectorNode([
        survivalBehavior,
        postStunRecoveryBehavior,
        supportSequence,
        allyCareBehavior,
        repositionSequence,
        new SuccessNode()
    ]);

    const rootNode = new SelectorNode([
        new SequenceNode([
            new CheckAspirationStateNode(ASPIRATION_STATE.COLLAPSED),
            baseBehaviorTree
        ]),
        baseBehaviorTree
    ]);

    return new BehaviorTree(rootNode);
}

export { createHealerAI };
