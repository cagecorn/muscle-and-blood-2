import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { actionPointEngine } from '../../game/utils/ActionPointEngine.js';

/**
 * 이동을 위해 행동력(AP) 1을 소모하는 노드
 */
class SpendActionPointNode extends Node {
    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);

        if (actionPointEngine.getPoints(unit.uniqueId) >= 1) {
            actionPointEngine.spendPoint(unit.uniqueId, 1);
            debugAIManager.logNodeResult(NodeState.SUCCESS, '이동을 위해 행동력 1 소모');
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, '행동력 부족');
        return NodeState.FAILURE;
    }
}

export default SpendActionPointNode;
