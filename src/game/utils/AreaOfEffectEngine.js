import { formationEngine } from './FormationEngine.js';
import { debugLogEngine } from './DebugLogEngine.js';

/**
 * @typedef {'SQUARE' | 'CROSS' | 'LINE'} AOEShape
 */

/**
 * 스킬의 범위 효과(AOE)를 계산하고 적용될 셀 목록을 반환하는 엔진입니다.
 */
class AreaOfEffectEngine {
    constructor() {
        debugLogEngine.log('AreaOfEffectEngine', '범위 효과 엔진이 초기화되었습니다.');
    }

    /**
     * 지정된 형태와 범위에 따라 영향을 받는 모든 셀의 배열을 반환합니다.
     * @param {AOEShape} shape - 범위의 형태 ('SQUARE', 'CROSS' 등)
     * @param {object} targetCellPos - 효과의 중심이 될 그리드 좌표 { col, row }
     * @param {number} radius - 효과의 반경 (또는 길이)
     * @returns {Array<object>} - 영향을 받는 셀 객체의 배열
     */
    getAffectedCells(shape, targetCellPos, radius) {
        let affectedCells = [];

        switch (shape) {
            case 'SQUARE':
                affectedCells = this._getSquareArea(targetCellPos, radius);
                break;
            case 'CROSS':
                affectedCells = this._getCrossArea(targetCellPos, radius);
                break;
            // 추후 'LINE', 'CONE' 등 다른 모양 추가 가능
            default:
                debugLogEngine.warn('AreaOfEffectEngine', `알 수 없는 범위 형태: ${shape}`);
                // 기본적으로는 중심 셀만 반환
                const centerCell = formationEngine.grid.getCell(targetCellPos.col, targetCellPos.row);
                if (centerCell) {
                    affectedCells.push(centerCell);
                }
        }
        return affectedCells;
    }

    /**
     * SQUARE (정사각형) 형태의 범위를 계산합니다.
     * @param {object} centerPos - 중심 좌표 { col, row }
     * @param {number} radius - 중심으로부터의 거리
     * @returns {Array<object>}
     * @private
     */
    _getSquareArea(centerPos, radius) {
        const cells = [];
        for (let r = -radius; r <= radius; r++) {
            for (let c = -radius; c <= radius; c++) {
                const targetCol = centerPos.col + c;
                const targetRow = centerPos.row + r;

                const cell = formationEngine.grid.getCell(targetCol, targetRow);
                if (cell) {
                    cells.push(cell);
                }
            }
        }
        return cells;
    }

    /**
     * CROSS (십자) 형태의 범위를 계산합니다.
     * @param {object} centerPos - 중심 좌표 { col, row }
     * @param {number} radius - 중심으로부터 뻗어나가는 거리
     * @returns {Array<object>}
     * @private
     */
    _getCrossArea(centerPos, radius) {
        const cells = [];
        // 중심 셀 추가
        const centerCell = formationEngine.grid.getCell(centerPos.col, centerPos.row);
        if (centerCell) {
            cells.push(centerCell);
        }

        for (let i = 1; i <= radius; i++) {
            // 상하좌우 방향
            const directions = [
                { col: 0, row: -i }, // Up
                { col: 0, row: i },  // Down
                { col: -i, row: 0 }, // Left
                { col: i, row: 0 }   // Right
            ];

            for (const dir of directions) {
                const targetCol = centerPos.col + dir.col;
                const targetRow = centerPos.row + dir.row;
                const cell = formationEngine.grid.getCell(targetCol, targetRow);
                if (cell) {
                    cells.push(cell);
                }
            }
        }
        return cells;
    }
}

export const areaOfEffectEngine = new AreaOfEffectEngine();
