import { debugLogEngine } from '../utils/DebugLogEngine.js';

/**
 * 유닛의 이동 행동을 추적하고 로그로 남기는 디버그 매니저
 */
class DebugMoveManager {
    constructor() {
        this.name = 'DebugMove';
        debugLogEngine.register(this);
    }

    /**
     * 유닛이 이동 스킬을 사용하여 이동했음을 로그로 남깁니다.
     * @param {object} unit - 이동한 유닛
     * @param {Array<object>} path - 이동한 경로
     */
    logMoveAction(unit, path) {
        if (!unit || !path) return;

        const pathLength = path.length;
        const startPos = { col: unit.gridX - path[0].col, row: unit.gridY - path[0].row };
        const endPos = { col: unit.gridX, row: unit.gridY };

        console.groupCollapsed(
            `%c[${this.name}]`,
            `color: #3b82f6; font-weight: bold;`,
            `${unit.instanceName} 이동 완료`
        );

        debugLogEngine.log(this.name, `이동 거리: ${pathLength}칸`);
        debugLogEngine.log(this.name, `경로: (${startPos.col}, ${startPos.row}) -> (${endPos.col}, ${endPos.row})`);

        console.groupEnd();
    }
}

export const debugMoveManager = new DebugMoveManager();
