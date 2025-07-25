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
        // ✨ StatEngine이 계산한 turnValue를 기준으로 정렬합니다.
        const turnQueue = [...allUnits].sort((a, b) => (a.finalStats.turnValue ?? 0) - (b.finalStats.turnValue ?? 0));

        // ✨ 로그에 turnValue를 표시합니다.
        const turnOrderNames = turnQueue.map(u => `${u.instanceName}(w:${u.finalStats.turnValue})`).join(' -> ');
        debugLogEngine.log('TurnOrderManager', `턴 순서 결정: ${turnOrderNames}`);

        return turnQueue;
    }
}

export const turnOrderManager = new TurnOrderManager();
