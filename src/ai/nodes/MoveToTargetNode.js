import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

class MoveToTargetNode extends Node {
    constructor({ formationEngine, animationEngine }) {
        super();
        this.formationEngine = formationEngine;
        this.animationEngine = animationEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const path = blackboard.get('movementPath');
        const movementRange = unit.finalStats.movement || 3;

        if (!path || path.length === 0) {
            debugAIManager.logNodeResult(NodeState.FAILURE);
            return NodeState.FAILURE;
        }
        
        // 이동력만큼만 경로를 잘라냄
        const movePath = path.slice(0, movementRange);
        const destination = movePath[movePath.length - 1];

        // 이동 애니메이션 실행 및 유닛 위치 업데이트
        await this.formationEngine.moveUnitOnGrid(unit, destination, this.animationEngine);
        
        debugAIManager.logNodeResult(NodeState.SUCCESS);
        return NodeState.SUCCESS;
    }
}
export default MoveToTargetNode;
