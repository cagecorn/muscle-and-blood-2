import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { formationEngine } from '../../game/utils/FormationEngine.js';

class MoveToTargetNode extends Node {
    constructor({ animationEngine }) {
        super();
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

        // 이동력만큼만 경로를 잘라냅니다.
        const movePath = path.slice(0, movementRange);
        if (movePath.length === 0) {
            return NodeState.SUCCESS;
        }

        // 현재 위치의 점유 상태를 해제합니다.
        const originalCell = formationEngine.grid.getCell(unit.gridX, unit.gridY);
        if (originalCell) {
            originalCell.isOccupied = false;
            originalCell.sprite = null;
        }

        // 경로를 따라 한 칸씩 이동합니다.
        for (const step of movePath) {
            const targetCell = formationEngine.grid.getCell(step.col, step.row);
            if (targetCell) {
                await this.animationEngine.moveTo(unit.sprite, targetCell.x, targetCell.y, 200);
                unit.gridX = step.col;
                unit.gridY = step.row;
            }
        }

        // 최종 위치의 점유 상태를 갱신합니다.
        const destination = movePath[movePath.length - 1];
        const finalCell = formationEngine.grid.getCell(destination.col, destination.row);
        if (finalCell) {
            finalCell.isOccupied = true;
            finalCell.sprite = unit.sprite;
        }

        debugAIManager.logNodeResult(NodeState.SUCCESS);
        return NodeState.SUCCESS;
    }
}
export default MoveToTargetNode;
