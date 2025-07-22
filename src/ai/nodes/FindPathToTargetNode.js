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
        const target = blackboard.get('currentTargetUnit');
        if (!target) {
            debugAIManager.logNodeResult(NodeState.FAILURE);
            return NodeState.FAILURE;
        }

        const attackRange = unit.finalStats.attackRange || 1;
        const start = { col: unit.gridX, row: unit.gridY };
        const targetPos = { col: target.gridX, row: target.gridY };

        // 1. 목표 주변의 공격 가능한 모든 셀 찾기
        const potentialAttackCells = [];
        for (let r = targetPos.row - attackRange; r <= targetPos.row + attackRange; r++) {
            for (let c = targetPos.col - attackRange; c <= targetPos.col + attackRange; c++) {
                const distance = Math.abs(c - targetPos.col) + Math.abs(r - targetPos.row);
                if (distance <= attackRange) {
                    const cell = this.formationEngine.grid.getCell(c, r);
                    // 유효하고, 비어있거나, 자기 자신 위치인 경우
                    if (cell && (!cell.isOccupied || (c === start.col && r === start.row))) {
                        potentialAttackCells.push(cell);
                    }
                }
            }
        }

        if (potentialAttackCells.length === 0) {
            debugAIManager.logNodeResult(NodeState.FAILURE);
            return NodeState.FAILURE;
        }

        // 2. 가장 가까운 공격 가능 셀 찾기
        potentialAttackCells.sort((a, b) => {
            const distA = Math.abs(a.col - start.col) + Math.abs(a.row - start.row);
            const distB = Math.abs(b.col - start.col) + Math.abs(b.row - start.row);
            return distA - distB;
        });

        // 3. 해당 셀까지의 경로 탐색
        for (const bestCell of potentialAttackCells) {
            const path = this.pathfinderEngine.findPath(start, { col: bestCell.col, row: bestCell.row });
            if (path && path.length > 0) {
                // 경로가 존재하면 해당 경로를 사용
                blackboard.set('movementPath', path);
                debugAIManager.logNodeResult(NodeState.SUCCESS);
                return NodeState.SUCCESS;
            }
        }

        // 이동할 경로가 전혀 없는 경우 (이미 최적 위치에 있거나 완전히 막힌 경우)
        // 현재 위치에서 공격이 가능한지 체크하는 IsTargetInRangeNode가 이미 있으므로
        // 여기서는 이동할 경로가 없으면 실패 처리합니다.
        const distanceToTarget = Math.abs(start.col - targetPos.col) + Math.abs(start.row - targetPos.row);
        if (distanceToTarget <= attackRange) {
            blackboard.set('movementPath', []); // 이동 필요 없음
            debugAIManager.logNodeResult(NodeState.SUCCESS);
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE);
        return NodeState.FAILURE;
    }
}
export default FindPathToTargetNode;
