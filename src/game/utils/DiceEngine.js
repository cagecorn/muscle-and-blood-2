import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 게임 내 모든 무작위 요소를 관장하는 중앙 주사위 엔진 (싱글턴)
 */
class DiceEngine {
    constructor() {
        debugLogEngine.log('DiceEngine', '다이스 엔진이 초기화되었습니다.');
    }

    /**
     * 주어진 배열에서 무작위 요소를 하나 선택하여 반환합니다.
     * @param {Array<*>} array - 요소를 선택할 배열
     * @returns {*|undefined} - 무작위로 선택된 요소
     */
    getRandomElement(array) {
        if (!array || array.length === 0) {
            return undefined;
        }
        const index = Math.floor(Math.random() * array.length);
        return array[index];
    }
}

export const diceEngine = new DiceEngine();
