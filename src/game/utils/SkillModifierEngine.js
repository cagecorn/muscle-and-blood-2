import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 스킬의 슬롯 순위에 따라 최종 능력치를 계산하는 엔진
 */
class SkillModifierEngine {
    constructor() {
        // 순위별 데미지 계수 (1순위 -> 4순위)
        // 스킬마다 별도의 계수를 지정해 세밀한 밸런싱을 가능하게 합니다.
        this.rankModifiers = {
            'charge': [1.5, 1.2, 1.0, 0.8],
            'attack': [1.3, 1.2, 1.1, 1.0]
        };
        debugLogEngine.log('SkillModifierEngine', '스킬 보정 엔진이 초기화되었습니다.');
    }

    /**
     * 스킬 데이터와 순위를 받아 보정된 스킬 데이터를 반환합니다.
     * @param {object} baseSkillData - 원본 스킬 데이터
     * @param {number} rank - 슬롯 순위 (1부터 시작)
     * @returns {object} - 보정된 스킬 데이터
     */
    getModifiedSkill(baseSkillData, rank, grade = 'NORMAL') {
        if (!baseSkillData) return null;

        const modifiedSkill = { ...baseSkillData };
        const rankIndex = rank - 1;

        const modifiers = this.rankModifiers[baseSkillData.id];
        if (modifiers && modifiers[rankIndex] && modifiedSkill.damageMultiplier) {
            modifiedSkill.damageMultiplier = modifiers[rankIndex];
        }

        // 차지 스킬의 경우 슬롯 순위에 따라 기절 턴 수를 보정합니다.
        if (baseSkillData.id === 'charge' && modifiedSkill.effect) {
            modifiedSkill.effect.duration = (rank === 1)
                ? 1
                : (grade === 'LEGENDARY' ? 2 : 1);
        }

        return modifiedSkill;
    }
}

export const skillModifierEngine = new SkillModifierEngine();
