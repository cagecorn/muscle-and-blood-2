import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

class FindPathToTargetNode extends Node {
    constructor({ pathfinderEngine, formationEngine }) {
        super();
        this.pathfinderEngine = pathfinderEngine;
        this.formationEngine = formationEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const originalTarget = blackboard.get('currentTargetUnit');
        if (!originalTarget) {
            debugAIManager.logNodeResult(NodeState.FAILURE, "원래 타겟 없음");
            return NodeState.FAILURE;
        }

        const start = { col: unit.gridX, row: unit.gridY };

        // --- 1. 원래 타겟에게 접근 시도 ---
        let pathToTarget = this._findPathToUnit(unit, originalTarget);
        if (pathToTarget) {
            blackboard.set('movementPath', pathToTarget);
            debugAIManager.logNodeResult(NodeState.SUCCESS, `원래 타겟(${originalTarget.instanceName})에게 경로 설정`);
            return NodeState.SUCCESS;
        }

        // --- 2. 경로가 없다면, 다른 적에게 접근 시도 ---
        debugAIManager.logNodeResult(NodeState.FAILURE, `원래 타겟(${originalTarget.instanceName})에게 접근 불가. 대체 타겟 탐색.`);
        const enemyUnits = blackboard
            .get('enemyUnits')
            .filter(e => e.uniqueId !== originalTarget.uniqueId && e.currentHp > 0);

        // 유닛과의 거리를 기준으로 적들을 정렬합니다.
        const sortedEnemies = enemyUnits.sort((a, b) => {
            const distA = Math.abs(a.gridX - start.col) + Math.abs(a.gridY - start.row);
            const distB = Math.abs(b.gridX - start.col) + Math.abs(b.gridY - start.row);
            return distA - distB;
        });

        for (const alternateEnemy of sortedEnemies) {
            let pathToAlternate = this._findPathToUnit(unit, alternateEnemy);
            if (pathToAlternate) {
                blackboard.set('currentTargetUnit', alternateEnemy); // 타겟 교체!
                blackboard.set('movementPath', pathToAlternate);
                debugAIManager.logNodeResult(
                    NodeState.SUCCESS,
                    `대체 타겟(${alternateEnemy.instanceName})으로 변경하고 경로 설정`
                );
                return NodeState.SUCCESS;
            }
        }

        // --- 3. 접근 가능한 적이 아무도 없다면, 원래 타겟에게 최대한 가까이 이동 ---
        debugAIManager.logNodeResult(NodeState.FAILURE, '접근 가능한 대체 타겟 없음. 원래 타겟에게 최대한 접근 시도.');
        const availableCells = this.formationEngine.grid.gridCells.filter(
            cell => !cell.isOccupied || (cell.col === start.col && cell.row === start.row)
        );

        if (availableCells.length === 0) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '이동 가능한 셀이 없음');
            return NodeState.FAILURE;
        }

        // 타겟과 가장 가까우면서 '실제로 이동 가능한' 셀을 찾습니다.
        availableCells.sort((a, b) => {
            const distA = Math.abs(a.col - originalTarget.gridX) + Math.abs(a.row - originalTarget.gridY);
            const distB = Math.abs(b.col - originalTarget.gridX) + Math.abs(b.row - originalTarget.gridY);
            return distA - distB;
        });

        for (const closestCell of availableCells) {
            const path = this.pathfinderEngine.findPath(unit, start, {
                col: closestCell.col,
                row: closestCell.row,
            });
            if (path && path.length > 0) {
                blackboard.set('movementPath', path);
                debugAIManager.logNodeResult(
                    NodeState.SUCCESS,
                    `원래 타겟에게 가장 가까운 셀(${closestCell.col}, ${closestCell.row})로 경로 설정`
                );
                return NodeState.SUCCESS;
            }
        }

        // --- 4. 모든 시도 실패 ---
        debugAIManager.logNodeResult(NodeState.FAILURE, '이동할 경로를 전혀 찾지 못함');
        return NodeState.FAILURE;
    }

    /**
     * 특정 유닛을 공격할 수 있는 가장 가까운 위치로의 경로를 찾는 헬퍼 메서드
     * @param {object} unit - 이동하는 유닛
     * @param {object} target - 목표 유닛
     * @returns {Array|null} - 경로 배열 또는 null
     */
    _findPathToUnit(unit, target) {
        const attackRange = unit.finalStats.attackRange || 1;
        const start = { col: unit.gridX, row: unit.gridY };
        const targetPos = { col: target.gridX, row: target.gridY };

        // 이미 사거리 내에 있는지 확인
        const distanceToTarget = Math.abs(start.col - targetPos.col) + Math.abs(start.row - targetPos.row);
        if (distanceToTarget <= attackRange) {
            return []; // 이동이 필요 없음
        }

        const potentialAttackCells = [];
        for (let r = targetPos.row - attackRange; r <= targetPos.row + attackRange; r++) {
            for (let c = targetPos.col - attackRange; c <= targetPos.col + attackRange; c++) {
                const distance = Math.abs(c - targetPos.col) + Math.abs(r - targetPos.row);
                if (distance <= attackRange) {
                    const cell = this.formationEngine.grid.getCell(c, r);
                    // 비어있거나, 자기 자신의 위치인 경우에만 잠재적 목표 셀로 추가
                    if (cell && (!cell.isOccupied || (c === start.col && r === start.row))) {
                        potentialAttackCells.push(cell);
                    }
                }
            }
        }

        if (potentialAttackCells.length === 0) {
            return null; // 공격 위치가 전혀 없음
        }

        // 현재 위치에서 가장 가까운 공격 가능 지점을 찾기 위해 정렬
        potentialAttackCells.sort((a, b) => {
            const distA = Math.abs(a.col - start.col) + Math.abs(a.row - start.row);
            const distB = Math.abs(b.col - start.col) + Math.abs(b.row - start.row);
            return distA - distB;
        });

        // 가장 가까운 지점부터 차례대로 경로 탐색
        for (const bestCell of potentialAttackCells) {
            const path = this.pathfinderEngine.findPath(unit, start, { col: bestCell.col, row: bestCell.row });
            if (path && path.length > 0) {
                return path; // 유효한 첫 번째 경로를 즉시 반환
            }
        }

        return null; // 모든 공격 위치로의 경로를 찾지 못함
    }
}
export default FindPathToTargetNode;

