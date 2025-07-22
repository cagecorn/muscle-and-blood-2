import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

// 타겟이 너무 가까운지(위험 지역 내에 있는지) 확인하는 노드
class IsTargetTooCloseNode extends Node {
    constructor({ dangerZone = 1 }) {
        super();
        this.dangerZone = dangerZone;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const target = blackboard.get('currentTargetUnit');
        if (!target) {
            debugAIManager.logNodeResult(NodeState.FAILURE);
            return NodeState.FAILURE;
        }

        const distance = Math.abs(unit.gridX - target.gridX) + Math.abs(unit.gridY - target.gridY);

        if (distance <= this.dangerZone) {
            debugAIManager.logNodeResult(NodeState.SUCCESS);
            return NodeState.SUCCESS; // 너무 가까움!
        }
        
        debugAIManager.logNodeResult(NodeState.FAILURE);
        return NodeState.FAILURE; // 안전함
    }
}
export default IsTargetTooCloseNode;
