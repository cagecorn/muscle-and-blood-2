import { debugLogEngine } from './DebugLogEngine.js';

/**
 * \uc720\ub2c8\uc758 \ud560\ub85c\uadf8(AP)\uc744 \uad00\ub9ac\ud558\ub294 \uc5d4\uc9c4 (\uc2f1\uae00\ud134)
 * AP\ub294 \uc774\ub3d9 \ub610\ub294 \uc544\uc774\ud15c \uc0ac\uc6a9 \ub4f1\uc5d0 \uc18c\uba3c\ub2e4.
 */
class ActionPointEngine {
    constructor() {
        this.apData = new Map();
        debugLogEngine.log('ActionPointEngine', '행동력 엔진이 초기화되었습니다.');
    }

    /**
     * \uc804\ud22c \uc2dc\uc791 \uc2dc \ubaa8\ub4e0 \uc720\ub2c8\uc758 AP \uc815\ubcf4\ub97c \ucd94\uac00\ud558\uace0 \ucd08\uae30\ud654\ud569\ub2c8\ub2e4.
     * @param {Array<object>} units - \uc804\ud22c\uc5d0 \ucc38\uc5ec\ud558\ub294 \ubaa8\ub4e0 \uc720\ub2c8
     */
    initializeUnits(units) {
        this.apData.clear();
        units.forEach(unit => {
            this.apData.set(unit.uniqueId, {
                currentPoints: 1,
                unitName: unit.instanceName
            });
        });
        debugLogEngine.log('ActionPointEngine', `${units.length}명의 유닛 AP 정보 초기화 완료.`);
    }

    /**
     * \uc0c8 \ud134\uc774 \uc2dc\uc791\ub420 \ub54c \ubaa8\ub4e0 \uc720\ub2c8\uc5d0\uac8c AP\ub97c 1\uc529 \ubd80\uc5ec\ud569\ub2c8\ub2e4.
     */
    addPointForNewTurn() {
        for (const [unitId, data] of this.apData.entries()) {
            data.currentPoints++;
            debugLogEngine.log('ActionPointEngine', `${data.unitName} (ID: ${unitId})의 턴 시작, AP 1 획득. 현재 AP: ${data.currentPoints}`);
        }
    }

    /**
     * \ud2b9\uc815 \uc720\ub2c8\uc758 AP\ub97c \uc0ac\uc6a9\ud569\ub2c8\ub2e4.
     * @param {number} unitId - AP\ub97c \uc0ac\uc6a9\ud560 \uc720\ub2c8\uc758 ID
     * @param {number} [amount=1] - \uc18c\uba3c AP \uc591
     * @returns {boolean} - AP \uc18c\uba3c \uc131\uacf5 \uc5ec\ubd80
     */
    spendPoint(unitId, amount = 1) {
        const data = this.apData.get(unitId);
        if (data && data.currentPoints >= amount) {
            data.currentPoints -= amount;
            debugLogEngine.log('ActionPointEngine', `${data.unitName} (ID: ${unitId})이(가) AP ${amount} 소모. 남은 AP: ${data.currentPoints}`);
            return true;
        }
        debugLogEngine.warn('ActionPointEngine', `유닛(ID:${unitId}) AP 부족으로 ${amount} 사용 실패.`);
        return false;
    }

    /**
     * \ud2b9\uc815 \uc720\ub2c8\uc758 \ud604\uc7ac AP \uac1c\uc218\ub97c \ubc18\ud658\ud569\ub2c8\ub2e4.
     * @param {number} unitId - \uc870\ud68c\ud560 \uc720\ub2c8\uc758 ID
     * @returns {number} - \ud604\uc7ac AP \uac1c\uc218
     */
    getPoints(unitId) {
        return this.apData.get(unitId)?.currentPoints || 0;
    }
}

export const actionPointEngine = new ActionPointEngine();
