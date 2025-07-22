import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

// 최적의 카이팅(거리두기) 위치를 찾는 노드
class FindKitingPositionNode extends Node {
    constructor({ formationEngine, pathfinderEngine }) {
        super();
        this.formationEngine = formationEngine;
        this.pathfinderEngine = pathfinderEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const target = blackboard.get('currentTargetUnit');
        if (!target) return NodeState.FAILURE;

        const safeRange = unit.finalStats.attackRange || 3;
        const start = { col: unit.gridX, row: unit.gridY };
        const targetPos = { col: target.gridX, row: target.gridY };

        // 1. 이동 가능한 모든 빈 셀 찾기
        const availableCells = this.formationEngine.grid.gridCells.filter(cell => !cell.isOccupied || (cell.col === start.col && cell.row === start.row));

        // 2. 각 셀의 "안전 점수" 계산
        let bestCell = null;
        let maxScore = -Infinity;

        availableCells.forEach(cell => {
            const distanceToTarget = Math.abs(cell.col - targetPos.col) + Math.abs(cell.row - targetPos.row);
            // 점수 = (목표와의 거리 - 목표 사거리) -> 목표로부터 멀수록, 사거리 안에 있을수록 점수 높음
            let score = distanceToTarget - safeRange;

            // 이동 불가능한 셀은 점수 대폭 하락
            if (this.pathfinderEngine.findPath(start, cell) === null) {
                score = -Infinity;
            }

            if (score > maxScore) {
                maxScore = score;
                bestCell = cell;
            }
        });
        
        // 3. 가장 좋은 위치로의 경로 탐색
        if (bestCell) {
            const path = this.pathfinderEngine.findPath(start, { col: bestCell.col, row: bestCell.row });
            if (path && path.length > 0) {
                blackboard.set('movementPath', path);
                debugAIManager.logNodeResult(NodeState.SUCCESS);
                return NodeState.SUCCESS;
            }
        }

        debugAIManager.logNodeResult(NodeState.FAILURE);
        return NodeState.FAILURE;
    }
}
export default FindKitingPositionNode;
