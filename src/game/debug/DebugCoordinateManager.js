import { debugLogEngine } from '../utils/DebugLogEngine.js';

class DebugCoordinateManager {
    constructor() {
        this.name = 'DebugCoordinate';
        debugLogEngine.register(this);
    }

    /**
     * 유닛 이미지와 이름표의 좌표 정보를 로그로 남깁니다.
     * @param {string} unitName - 유닛의 이름
     * @param {object} imageCoord - 이미지의 x, y 좌표 {x, y}
     * @param {object} labelCoord - 이름표의 x, y 좌표 {x, y}
     */
    logCoordinates(unitName, imageCoord, labelCoord) {
        console.groupCollapsed(
            `%c[${this.name}]`,
            `color: #f59e0b; font-weight: bold;`,
            `'${unitName}' 좌표 정보`
        );

        debugLogEngine.log(this.name, `유닛 이미지 좌표: x=${imageCoord.x.toFixed(2)}, y=${imageCoord.y.toFixed(2)}`);
        debugLogEngine.log(this.name, `이름표 실제 좌표: x=${labelCoord.x.toFixed(2)}, y=${labelCoord.y.toFixed(2)}`);

        console.groupEnd();
    }
}

export const debugCoordinateManager = new DebugCoordinateManager();
