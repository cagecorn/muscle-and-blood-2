import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 전투 중 유닛의 토큰(자원)을 관리하는 엔진 (싱글턴)
 */
class TokenEngine {
    constructor() {
        this.tokenData = new Map();
        this.maxTokens = 9; // 최대 토큰 보유량
        debugLogEngine.log('TokenEngine', '토큰 엔진이 초기화되었습니다.');
    }

    /**
     * 전투 시작 시 모든 유닛의 토큰 정보를 등록하고 초기화합니다.
     * @param {Array<object>} units - 전투에 참여하는 모든 유닛
     */
    initializeUnits(units) {
        this.tokenData.clear();
        units.forEach(unit => {
            this.tokenData.set(unit.uniqueId, { currentTokens: 0 });
        });
        debugLogEngine.log('TokenEngine', `${units.length}명의 유닛 토큰 정보 초기화 완료.`);
    }

    /**
     * 새로운 턴이 시작될 때 모든 유닛에게 토큰을 지급합니다.
     * @param {number} turnNumber - 현재 턴 번호 (1턴부터 시작)
     */
    addTokensForNewTurn(turnNumber) {
        if (turnNumber <= 0) return;

        for (const [unitId, data] of this.tokenData.entries()) {
            const newTokens = Math.min(this.maxTokens, data.currentTokens + turnNumber);
            this.tokenData.set(unitId, { currentTokens: newTokens });
        }
        debugLogEngine.log('TokenEngine', `${turnNumber}턴 시작: 모든 유닛에게 ${turnNumber}개의 토큰 지급 시도.`);
    }

    /**
     * 특정 유닛의 토큰을 사용합니다.
     * @param {number} unitId - 토큰을 사용할 유닛의 고유 ID
     * @param {number} amount - 소모할 토큰의 양
     * @returns {boolean} - 토큰 소모 성공 여부
     */
    spendTokens(unitId, amount) {
        const data = this.tokenData.get(unitId);
        if (data && data.currentTokens >= amount) {
            data.currentTokens -= amount;
            debugLogEngine.log('TokenEngine', `유닛(ID:${unitId})이 토큰 ${amount}개를 사용. 남은 토큰: ${data.currentTokens}`);
            return true;
        }
        debugLogEngine.warn('TokenEngine', `유닛(ID:${unitId}) 토큰 부족으로 ${amount}개 사용 실패.`);
        return false;
    }

    /**
     * 특정 유닛의 현재 토큰 개수를 반환합니다.
     * @param {number} unitId - 조회할 유닛의 고유 ID
     * @returns {number} - 현재 토큰 개수
     */
    getTokens(unitId) {
        return this.tokenData.get(unitId)?.currentTokens || 0;
    }
}

export const tokenEngine = new TokenEngine();
