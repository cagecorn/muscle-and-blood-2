import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 스킬의 슬롯 순위에 따라 최종 능력치를 계산하는 엔진
 */
class SkillModifierEngine {
    constructor() {
        // 순위별 데미지 계수 (1순위 -> 4순위)
        this.rankModifiers = [2.0, 1.7, 1.5, 1.2];
        debugLogEngine.log('SkillModifierEngine', '스킬 보정 엔진이 초기화되었습니다.');
    }

    /**
     * 스킬 데이터와 순위를 받아 보정된 스킬 데이터를 반환합니다.
     * @param {object} baseSkillData - 원본 스킬 데이터
     * @param {number} rank - 슬롯 순위 (1부터 시작)
     * @returns {object} - 보정된 스킬 데이터
     */
    getModifiedSkill(baseSkillData, rank) {
        if (!baseSkillData) return null;

        const modifiedSkill = { ...baseSkillData };
        const rankIndex = rank - 1;

        if (this.rankModifiers[rankIndex] && modifiedSkill.damageMultiplier) {
            modifiedSkill.damageMultiplier = this.rankModifiers[rankIndex];
        }

        return modifiedSkill;
    }
}

export const skillModifierEngine = new SkillModifierEngine();
