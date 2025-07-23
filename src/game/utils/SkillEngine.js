import { diceEngine } from './DiceEngine.js';
import { debugLogEngine } from './DebugLogEngine.js';

// 스킬 종류와 해당 색상, 이름을 상수로 정의합니다.
export const SKILL_TYPES = {
    ACTIVE: { name: '액티브', color: '#FF8C00' }, // 주황색
    BUFF:   { name: '버프',   color: '#1E90FF' }, // 파랑색
    DEBUFF: { name: '디버프', color: '#DC143C' }, // 빨강색
    PASSIVE:{ name: '패시브', color: '#32CD32' }  // 초록색
};

/**
 * 용병의 스킬 슬롯 생성 등 스킬 관련 로직을 총괄하는 엔진
 */
class SkillEngine {
    constructor() {
        this.skillTypes = Object.keys(SKILL_TYPES);
        debugLogEngine.log('SkillEngine', '스킬 엔진이 초기화되었습니다.');
    }

    /**
     * 3개의 무작위 스킬 슬롯 타입을 생성하여 반환합니다.
     * @returns {Array<string>} - 3개의 스킬 타입 문자열 배열 (예: ['ACTIVE', 'PASSIVE', 'BUFF'])
     */
    generateRandomSkillSlots() {
        const slots = [];
        for (let i = 0; i < 3; i++) {
            const randomType = diceEngine.getRandomElement(this.skillTypes);
            slots.push(randomType);
        }
        return slots;
    }
}

export const skillEngine = new SkillEngine();
