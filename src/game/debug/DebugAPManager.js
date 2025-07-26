import { debugLogEngine } from '../utils/DebugLogEngine.js';

/**
 * 유닛의 행동력(AP) 변화를 추적하고 로그를 남기는 디버그 매니저
 */
class DebugAPManager {
    constructor() {
        this.name = 'DebugAP';
        debugLogEngine.register(this);
    }

    /**
     * AP 변화 로그를 기록합니다.
     * @param {string} unitName - 유닛 이름
     * @param {number} change - 변화량 (+1 또는 -1)
     * @param {number} newTotal - 변화 후 총 AP
     * @param {string} reason - 변화 이유
     */
    logAPChange(unitName, change, newTotal, reason) {
        const sign = change > 0 ? '+' : '';
        const message = `${unitName} AP ${sign}${change} -> 현재 ${newTotal} AP (${reason})`;
        debugLogEngine.log(this.name, message);
    }

    /**
     * AP 시스템 초기화 로그를 기록합니다.
     */
    logInitialization(unitCount) {
        debugLogEngine.log(this.name, `모든 유닛(${unitCount}명)의 AP 데이터를 초기화했습니다.`);
    }
}

export const debugAPManager = new DebugAPManager();
