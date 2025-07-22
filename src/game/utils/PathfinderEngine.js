import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 유닛의 이동 경로를 계산하는 엔진 (현재는 단순화된 버전)
 */
class PathfinderEngine {
    constructor() {
        debugLogEngine.log('PathfinderEngine', '경로 탐색 엔진이 초기화되었습니다.');
    }

    /**
     * 시작 좌표에서 목표 좌표까지의 경로를 찾습니다.
     * (A* 알고리즘 대신, 장애물을 무시하는 직선 경로를 반환하는 단순화된 버전입니다.)
     * @param {object} startPos - 시작 그리드 좌표 { col, row }
     * @param {object} endPos - 목표 그리드 좌표 { col, row }
     * @returns {Array<object>|null} - 경로 좌표 배열 또는 null
     */
    findPath(startPos, endPos) {
        const path = [];
        let currentPos = { ...startPos };

        while (currentPos.col !== endPos.col || currentPos.row !== endPos.row) {
            const dx = endPos.col - currentPos.col;
            const dy = endPos.row - currentPos.row;

            if (Math.abs(dx) > Math.abs(dy)) {
                currentPos.col += Math.sign(dx);
            } else {
                currentPos.row += Math.sign(dy);
            }
            path.push({ ...currentPos });
        }
        
        if (path.length > 0) {
            debugLogEngine.log('PathfinderEngine', `경로 탐색 완료: ${path.length}개의 이동 경로 발견.`);
            return path;
        }
        return null;
    }
}

export const pathfinderEngine = new PathfinderEngine();
