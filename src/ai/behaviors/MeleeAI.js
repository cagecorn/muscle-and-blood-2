import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import AttackTargetNode from '../nodes/AttackTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';
import JustRecoveredFromStunNode from '../nodes/JustRecoveredFromStunNode.js';
import SetTargetToStunnerNode from '../nodes/SetTargetToStunnerNode.js';
import IsTargetValidNode from '../nodes/IsTargetValidNode.js';
import FindPriorityTargetNode from '../nodes/FindPriorityTargetNode.js';
import IsTargetInRangeNode from '../nodes/IsTargetInRangeNode.js';
import FindLowestHealthEnemyNode from '../nodes/FindLowestHealthEnemyNode.js';
import FindSafeRepositionNode from '../nodes/FindSafeRepositionNode.js';
import IsHealthBelowThresholdNode from '../nodes/IsHealthBelowThresholdNode.js';
import SuccessNode from '../nodes/SuccessNode.js';
import { NodeState } from '../nodes/Node.js';

function createMeleeAI(engines = {}) {
    const setCurrentFromMovement = {
        async evaluate(_unit, blackboard) {
            const target = blackboard.get('movementTarget');
            if (target) {
                blackboard.set('currentTargetUnit', target);
                return NodeState.SUCCESS;
            }
            return NodeState.FAILURE;
        }
    };

    const revengeBranch = new SequenceNode([
        new JustRecoveredFromStunNode(),
        new SetTargetToStunnerNode(),
        new IsTargetValidNode(),
        new FindPathToTargetNode(engines),
        new MoveToTargetNode(engines),
        new AttackTargetNode(engines)
    ]);

    const priorityAttackBranch = new SequenceNode([
        new FindPriorityTargetNode(engines),
        setCurrentFromMovement,
        new IsTargetValidNode(),
        new SelectorNode([
            new SequenceNode([
                new IsTargetInRangeNode(engines),
                new AttackTargetNode(engines)
            ]),
            new SequenceNode([
                new FindPathToTargetNode(engines),
                new MoveToTargetNode(engines),
                new AttackTargetNode(engines)
            ])
        ])
    ]);

    const finishOffBranch = new SequenceNode([
        new FindLowestHealthEnemyNode(engines),
        new IsTargetValidNode(),
        new SelectorNode([
            new SequenceNode([
                new IsTargetInRangeNode(engines),
                new AttackTargetNode(engines)
            ]),
            new SequenceNode([
                new FindPathToTargetNode(engines),
                new MoveToTargetNode(engines),
                new AttackTargetNode(engines)
            ])
        ])
    ]);

    const retreatBranch = new SequenceNode([
        new IsHealthBelowThresholdNode(0.5),
        new FindSafeRepositionNode(engines),
        new MoveToTargetNode(engines)
    ]);

    const root = new SelectorNode([
        revengeBranch,
        priorityAttackBranch,
        finishOffBranch,
        retreatBranch,
        new SuccessNode()
    ]);

    return new BehaviorTree(root);
}

export { createMeleeAI };
