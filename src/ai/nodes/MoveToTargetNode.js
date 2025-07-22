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
            // 이동할 필요가 없거나 경로가 없으면 그대로 성공 처리
            debugAIManager.logNodeResult(NodeState.SUCCESS);
            return NodeState.SUCCESS;
        }

        // 이동력 범위 내에서 가능한 한 한 칸씩 이동
        const movePath = path.slice(0, movementRange);
        let movedAtLeastOnce = false;
        for (const step of movePath) {
            const moved = await this.formationEngine.moveUnitOnGrid(
                unit,
                step,
                this.animationEngine
            );
            if (!moved) {
                break;
            }
            movedAtLeastOnce = true;
        }

        if (!movedAtLeastOnce) {
            // 한 칸도 이동하지 못했더라도 턴 진행을 위해 성공 처리
            debugAIManager.logNodeResult(NodeState.SUCCESS);
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.SUCCESS);
        return NodeState.SUCCESS;
    }
}
export default MoveToTargetNode;
