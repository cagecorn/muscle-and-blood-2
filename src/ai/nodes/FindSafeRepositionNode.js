import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

/**
 * 전투가 잠잠할 때 유리한 위치로 이동하기 위한 위치를 탐색합니다.
 */
class FindSafeRepositionNode extends Node {
    constructor({ formationEngine, pathfinderEngine, narrationEngine }) {
        super();
        this.formationEngine = formationEngine;
        this.pathfinderEngine = pathfinderEngine;
        this.narrationEngine = narrationEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const enemies = blackboard.get('enemyUnits');
        if (this.narrationEngine) {
            const isThreatened = blackboard.get('isThreatened');
            if (isThreatened) {
                this.narrationEngine.show(`${unit.instanceName}이(가) 위협을 피해 안전한 위치로 후퇴합니다.`);
            } else {
                this.narrationEngine.show(`${unit.instanceName}이(가) 다음 행동을 위해 유리한 위치로 이동합니다.`);
            }
        }
        const cells = this.formationEngine.grid.gridCells.filter(
            cell => !cell.isOccupied || (cell.col === unit.gridX && cell.row === unit.gridY)
        );

        let bestCell = null;
        let maxScore = -Infinity;

        cells.forEach(cell => {
            let minEnemyDist = Infinity;
            if (enemies && enemies.length > 0) {
                enemies.forEach(enemy => {
                    const d = Math.abs(cell.col - enemy.gridX) + Math.abs(cell.row - enemy.gridY);
                    if (d < minEnemyDist) minEnemyDist = d;
                });
            }

            const travelDist = Math.abs(cell.col - unit.gridX) + Math.abs(cell.row - unit.gridY);
            const score = minEnemyDist - travelDist * 0.5;
            if (score > maxScore) {
                maxScore = score;
                bestCell = cell;
            }
        });

        if (bestCell) {
            const path = this.pathfinderEngine.findPath(
                unit,
                { col: unit.gridX, row: unit.gridY },
                { col: bestCell.col, row: bestCell.row }
            );
            if (path && path.length > 0) {
                blackboard.set('movementPath', path);
                debugAIManager.logNodeResult(NodeState.SUCCESS, `재배치 위치 (${bestCell.col}, ${bestCell.row}) 경로 설정`);
                return NodeState.SUCCESS;
            }
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, '재배치 위치 탐색 실패');
        return NodeState.FAILURE;
    }
}

export default FindSafeRepositionNode;
