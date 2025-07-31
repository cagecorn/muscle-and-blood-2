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
import FindPathToSkillRangeNode from '../nodes/FindPathToSkillRangeNode.js';
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
import FindAllyClusterNode from '../nodes/FindAllyClusterNode.js';
import FindBuffedEnemyNode from '../nodes/FindBuffedEnemyNode.js';
import FindEnemyMedicNode from '../nodes/FindEnemyMedicNode.js';
import { debugMBTIManager } from '../../game/debug/DebugMBTIManager.js';
import IsTokenBelowThresholdNode from '../nodes/IsTokenBelowThresholdNode.js';
import FindSafeRepositionNode from '../nodes/FindSafeRepositionNode.js';
import FindBestSkillByScoreNode from '../nodes/FindBestSkillByScoreNode.js';
import CheckAspirationStateNode from '../nodes/CheckAspirationStateNode.js';
import { ASPIRATION_STATE } from '../../game/utils/AspirationEngine.js';

/**
 * 근접 유닛을 위한 합리적인 하드코딩 AI를 생성합니다.
 * @param {object} engines - AI 노드에 주입될 각종 엔진
 * @returns {BehaviorTree}
 */
function createMeleeAI(engines = {}) {
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

    const lowTokenResponse = new SequenceNode([
        new IsTokenBelowThresholdNode(1),
        new MBTIActionNode('P', engines),
        new CanUseSkillBySlotNode(2),
        executeSkillBranch
    ]);

    const enemyBuffResponse = new SequenceNode([
        new FindBuffedEnemyNode(engines),
        new MBTIActionNode('J', engines),
        new CanUseSkillBySlotNode(1),
        executeSkillBranch
    ]);

    const enemyMedicResponse = new SequenceNode([
        new FindEnemyMedicNode(engines),
        new MBTIActionNode('T', engines),
        new CanUseSkillBySlotNode(3),
        executeSkillBranch
    ]);

    const allyClusterResponse = new SequenceNode([
        new FindAllyClusterNode(engines),
        new MBTIActionNode('E', engines),
        new CanUseSkillBySlotNode(0),
        executeSkillBranch
    ]);

    const allyCareBehavior = new SequenceNode([
        new FindNearestAllyInDangerNode(engines),
        new MBTIActionNode('F', engines),
        new FindPathToAllyNode(engines),
        new MoveToTargetNode(engines),
        new CanUseSkillBySlotNode(2),
        executeSkillBranch
    ]);

    const attackSequence = new SequenceNode([
        new FindTargetBySkillTypeNode(engines),
        new FindBestSkillByScoreNode(engines),
        executeSkillBranch
    ]);

    const basicMovement = new SequenceNode([
        new HasNotMovedNode(),
        new FindMeleeStrategicTargetNode(engines),
        new FindPathToTargetNode(engines),
        new MoveToTargetNode(engines)
    ]);

    const collapsedBehaviorTree = new SelectorNode([
        survivalBehavior,
        postStunRecoveryBehavior,
        lowTokenResponse,
        enemyBuffResponse,
        enemyMedicResponse,
        allyClusterResponse,
        allyCareBehavior,
        attackSequence,
        basicMovement,
        new SuccessNode()
    ]);

    const rationalBehaviorTree = (() => {
        const executeSkillBranch2 = new SelectorNode([
            new SequenceNode([new IsSkillInRangeNode(engines), new UseSkillNode(engines)]),
            new SequenceNode([
                new HasNotMovedNode(),
                new FindPathToSkillRangeNode(engines),
                new MoveToTargetNode(engines),
                new IsSkillInRangeNode(engines),
                new UseSkillNode(engines)
            ])
        ]);
        const attackSequence2 = new SequenceNode([
            new FindBestSkillByScoreNode(engines),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch2
        ]);
        const basicMovement2 = new SequenceNode([
            new HasNotMovedNode(),
            new FindMeleeStrategicTargetNode(engines),
            new FindPathToTargetNode(engines),
            new MoveToTargetNode(engines)
        ]);
        return new SelectorNode([attackSequence2, basicMovement2, new SuccessNode()]);
    })();

    const rootNode = new SelectorNode([
        new SequenceNode([
            new CheckAspirationStateNode(ASPIRATION_STATE.COLLAPSED),
            collapsedBehaviorTree
        ]),
        rationalBehaviorTree
    ]);

    return new BehaviorTree(rootNode);
}

export { createMeleeAI };
