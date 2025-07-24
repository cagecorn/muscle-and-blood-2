import { debugLogEngine } from './DebugLogEngine.js';
// 아이언 윌 데이터를 직접 참조하기 위해 import 합니다.
import { passiveSkills } from '../data/skills/passive.js';

/**
 * 스킬의 슬롯 순위에 따라 최종 능력치를 계산하는 엔진
 */
class SkillModifierEngine {
    constructor() {
        // 순위별 계수 (1순위 -> 4순위)
        this.rankModifiers = {
            'charge': [1.5, 1.2, 1.0, 0.8],
            'attack': [1.3, 1.2, 1.1, 1.0],
            // 'stoneSkin' 스킬의 순위별 데미지 감소율
            'stoneSkin': [0.24, 0.21, 0.18, 0.15],
            // ✨ 쉴드 브레이크의 순위별 '받는 데미지 증가' 효과 수치
            'shieldBreak': [0.24, 0.21, 0.18, 0.15]
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

        // 원본 훼손을 막기 위해 깊은 복사를 수행합니다.
        const modifiedSkill = JSON.parse(JSON.stringify(baseSkillData));
        const rankIndex = rank - 1;

        const damageModifiers = this.rankModifiers[baseSkillData.id];
        if (damageModifiers && damageModifiers[rankIndex] !== undefined && modifiedSkill.damageMultiplier) {
            modifiedSkill.damageMultiplier = damageModifiers[rankIndex];
        }

        // 'stoneSkin' 스킬의 데미지 감소 효과 보정
        if (baseSkillData.id === 'stoneSkin' && modifiedSkill.effect) {
            const reductionModifiers = this.rankModifiers['stoneSkin'];
            if (reductionModifiers && reductionModifiers[rankIndex] !== undefined) {
                if (Array.isArray(modifiedSkill.effect.modifiers)) {
                    const reductionMod = modifiedSkill.effect.modifiers.find(m => m.stat === 'damageReduction');
                    if (reductionMod) {
                        reductionMod.value = reductionModifiers[rankIndex];
                    }
                } else if (modifiedSkill.effect.modifiers && modifiedSkill.effect.modifiers.stat === 'damageReduction') {
                    modifiedSkill.effect.modifiers.value = reductionModifiers[rankIndex];
                }
            }
        }

        // ✨ 'shieldBreak' 스킬의 '받는 데미지 증가' 효과 보정
        if (baseSkillData.id === 'shieldBreak' && modifiedSkill.effect) {
            const increaseModifiers = this.rankModifiers['shieldBreak'];
            if (increaseModifiers && increaseModifiers[rankIndex] !== undefined) {
                // modifiers가 배열인지 단일 객체인지 확인하여 처리
                if (Array.isArray(modifiedSkill.effect.modifiers)) {
                    const increaseMod = modifiedSkill.effect.modifiers.find(m => m.stat === 'damageIncrease');
                    if (increaseMod) {
                        increaseMod.value = increaseModifiers[rankIndex];
                    }
                } else if (modifiedSkill.effect.modifiers && modifiedSkill.effect.modifiers.stat === 'damageIncrease') {
                    modifiedSkill.effect.modifiers.value = increaseModifiers[rankIndex];
                }
            }
        }

        // 차지 스킬의 경우 슬롯 순위에 따라 기절 턴 수를 보정합니다.
        if (baseSkillData.id === 'charge' && modifiedSkill.effect) {
            modifiedSkill.effect.duration = (rank === 1)
                ? 1
                : (grade === 'LEGENDARY' ? 2 : 1);
        }

        // --- ✨ 새로운 설명 동적 생성 로직 ---

        if (modifiedSkill.description) {
            // 1. 데미지 계수 치환 (차지, 공격 스킬 등)
            if (modifiedSkill.damageMultiplier) {
                const damagePercent = Math.round(modifiedSkill.damageMultiplier * 100);
                // '{{damage}}%' 패턴을 찾아 '수치%'로 변경합니다.
                modifiedSkill.description = modifiedSkill.description.replace('{{damage}}%', `${damagePercent}%`);
            }
            // 2. 스톤 스킨 감소율 치환
            if (baseSkillData.id === 'stoneSkin') {
                const reductionValue = (this.rankModifiers.stoneSkin[rankIndex] || 0) * 100;
                modifiedSkill.description = modifiedSkill.description.replace('{{reduction}}%', `${reductionValue.toFixed(0)}%`);
            }
            // 3. 쉴드 브레이크 증가율 치환
            if (baseSkillData.id === 'shieldBreak') {
                const increaseValue = (this.rankModifiers.shieldBreak[rankIndex] || 0) * 100;
                modifiedSkill.description = modifiedSkill.description.replace('{{increase}}%', `${increaseValue.toFixed(0)}%`);
            }
            // 4. 아이언 윌 최대 감소율 치환
            if (baseSkillData.id === 'ironWill') {
                const maxReductionValue = (passiveSkills.ironWill.rankModifiers[rankIndex] || 0) * 100;
                modifiedSkill.description = modifiedSkill.description.replace('{{maxReduction}}%', `${maxReductionValue.toFixed(0)}%`);
            }
        }

        return modifiedSkill;
    }
}

export const skillModifierEngine = new SkillModifierEngine();
