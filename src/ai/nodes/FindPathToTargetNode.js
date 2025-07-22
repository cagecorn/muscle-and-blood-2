import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

class FindPathToTargetNode extends Node {
    constructor({ pathfinderEngine }) {
        super();
        this.pathfinderEngine = pathfinderEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const target = blackboard.get('currentTargetUnit');
        if (!target) {
            debugAIManager.logNodeResult(NodeState.FAILURE);
            return NodeState.FAILURE;
        }

        const start = { col: unit.gridX, row: unit.gridY };
        const end = { col: target.gridX, row: target.gridY };
        const path = this.pathfinderEngine.findPath(start, end);

        if (path && path.length > 0) {
            blackboard.set('movementPath', path);
            debugAIManager.logNodeResult(NodeState.SUCCESS);
            return NodeState.SUCCESS;
        }
        
        debugAIManager.logNodeResult(NodeState.FAILURE);
        return NodeState.FAILURE;
    }
}
export default FindPathToTargetNode;
