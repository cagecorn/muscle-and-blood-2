import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 유닛의 스탯에 따라 전투의 턴 순서를 결정하고 관리하는 매니저
 */
class TurnOrderManager {
    constructor() {
        debugLogEngine.log('TurnOrderManager', '턴 순서 매니저가 초기화되었습니다.');
    }

    /**
     * 유닛 목록을 받아 무게(weight)가 낮은 순서대로 정렬하여 턴 큐를 생성합니다.
     * @param {Array<object>} allUnits - 전투에 참여하는 모든 유닛 목록
     * @returns {Array<object>} - 턴 순서에 따라 정렬된 유닛 배열
     */
    createTurnQueue(allUnits) {
        // 임의의 무게(weight)를 각 유닛의 finalStats에 추가합니다.
        // 실제 게임에서는 StatEngine이 이 값을 계산해야 합니다.
        allUnits.forEach(unit => {
            if (!unit.finalStats) unit.finalStats = {};
            // 전사는 10, 좀비는 15로 설정하여 전사가 항상 선공하도록 합니다.
            if (unit.name === '전사') {
                unit.finalStats.weight = 10;
            } else if (unit.name === '좀비') {
                unit.finalStats.weight = 15;
            } else {
                unit.finalStats.weight = 20; // 기타
            }
        });

        const turnQueue = [...allUnits].sort((a, b) => a.finalStats.weight - b.finalStats.weight);
        
        const turnOrderNames = turnQueue.map(u => `${u.instanceName}(w:${u.finalStats.weight})`).join(' -> ');
        debugLogEngine.log('TurnOrderManager', `턴 순서 결정: ${turnOrderNames}`);

        return turnQueue;
    }
}

export const turnOrderManager = new TurnOrderManager();
