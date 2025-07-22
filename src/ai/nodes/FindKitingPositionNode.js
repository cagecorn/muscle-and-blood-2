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
        if (!target) {
            debugAIManager.logNodeResult(NodeState.FAILURE, "카이팅할 대상 없음");
            return NodeState.FAILURE;
        }

        const attackRange = unit.finalStats.attackRange || 3;
        const dangerZone = 2; // IsTargetTooCloseNode와 동일하게 설정
        const start = { col: unit.gridX, row: unit.gridY };
        const targetPos = { col: target.gridX, row: target.gridY };

        const availableCells = this.formationEngine.grid.gridCells.filter(cell => !cell.isOccupied || (cell.col === start.col && cell.row === start.row));

        let bestCell = null;
        let minDistanceToTravel = Infinity;

        availableCells.forEach(cell => {
            const distanceToTarget = Math.abs(cell.col - targetPos.col) + Math.abs(cell.row - targetPos.row);

            // 조건 1: 위험 지역(dangerZone)보다 멀리 떨어져 있는가?
            // 조건 2: 최대 공격 사거리(attackRange) 안에 있는가?
            if (distanceToTarget > dangerZone && distanceToTarget <= attackRange) {
                const distanceToTravel = Math.abs(cell.col - start.col) + Math.abs(cell.row - start.row);

                // 조건 3: 위 조건들을 만족하는 셀 중에서 가장 이동 거리가 짧은 곳인가?
                if (distanceToTravel < minDistanceToTravel) {
                    minDistanceToTravel = distanceToTravel;
                    bestCell = cell;
                }
            }
        });
        
        if (bestCell) {
            const path = this.pathfinderEngine.findPath(start, { col: bestCell.col, row: bestCell.row });
            if (path && path.length > 0) {
                blackboard.set('movementPath', path);
                debugAIManager.logNodeResult(NodeState.SUCCESS, `최적 카이팅 위치 (${bestCell.col}, ${bestCell.row})로 경로 설정`);
                return NodeState.SUCCESS;
            }
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, "적절한 카이팅 위치를 찾지 못함");
        return NodeState.FAILURE; // 마땅한 후퇴 지점 없음
    }
}
export default FindKitingPositionNode;
