import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

class FindPathToSkillRangeNode extends Node {
    constructor({ pathfinderEngine, formationEngine } = {}) {
        super();
        this.pathfinderEngine = pathfinderEngine;
        this.formationEngine = formationEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const target = blackboard.get('skillTarget');
        const skillData = blackboard.get('currentSkillData');

        if (!target || !skillData) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '타겟 또는 스킬 정보 없음');
            return NodeState.FAILURE;
        }

        const skillRange = skillData.range || unit.finalStats.attackRange || 1;

        const path = this._findPathToUnit(unit, target, skillRange);
        if (path) {
            blackboard.set('movementPath', path);
            debugAIManager.logNodeResult(NodeState.SUCCESS, `스킬 [${skillData.name}] 사용 위치로 경로 설정`);
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, '스킬 사용 위치로의 경로 탐색 실패');
        return NodeState.FAILURE;
    }

    _findPathToUnit(unit, target, range) {
        const start = { col: unit.gridX, row: unit.gridY };
        const targetPos = { col: target.gridX, row: target.gridY };

        const distanceToTarget = Math.abs(start.col - targetPos.col) + Math.abs(start.row - targetPos.row);
        if (distanceToTarget <= range) {
            return [];
        }

        const potentialCells = [];
        for (let r = 0; r < this.formationEngine.grid.rows; r++) {
            for (let c = 0; c < this.formationEngine.grid.cols; c++) {
                const distance = Math.abs(c - targetPos.col) + Math.abs(r - targetPos.row);
                if (distance <= range) {
                    const cell = this.formationEngine.grid.getCell(c, r);
                    if (cell && (!cell.isOccupied || (c === start.col && r === start.row))) {
                        potentialCells.push(cell);
                    }
                }
            }
        }

        if (potentialCells.length === 0) return null;

        potentialCells.sort((a, b) => {
            const distA = Math.abs(a.col - start.col) + Math.abs(a.row - start.row);
            const distB = Math.abs(b.col - start.col) + Math.abs(b.row - start.row);
            return distA - distB;
        });

        for (const bestCell of potentialCells) {
            const path = this.pathfinderEngine.findPath(unit, start, { col: bestCell.col, row: bestCell.row });
            if (path && path.length > 0) {
                return path;
            }
        }
        return null;
    }
}
export default FindPathToSkillRangeNode;
