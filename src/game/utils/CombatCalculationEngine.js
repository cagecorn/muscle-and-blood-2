import { debugCombatLogManager } from '../debug/DebugCombatLogManager.js';
import { statusEffectManager } from './StatusEffectManager.js';
import { debugStatusEffectManager } from '../debug/DebugStatusEffectManager.js';
import { skillModifierEngine } from './SkillModifierEngine.js';
import { ownedSkillsManager } from './OwnedSkillsManager.js';
// ✨ 아이언 윌 로직에 필요한 모듈 추가
import { skillInventoryManager } from './SkillInventoryManager.js';
import { passiveSkills } from '../data/skills/passive.js';
// ✨ ValorEngine과 디버거를 import합니다.
import { statEngine } from './StatEngine.js';
import { debugValorManager } from '../debug/DebugValorManager.js';
// ✨ 1. GradeManager와 관련 상수들을 가져옵니다.
import { gradeManager } from './GradeManager.js';
import { ATTACK_TYPE } from '../data/classGrades.js';
import { SKILL_TAGS } from './SkillTagManager.js';
import { comboManager } from './ComboManager.js';
// 콤보 계산 과정을 상세히 기록하기 위한 디버그 매니저
import { debugComboManager } from '../debug/DebugComboManager.js';
// ✨ [신규] 확정 데미지 매니저를 import합니다.
import { fixedDamageManager } from './FixedDamageManager.js';
// ✨ [신규] 스택 매니저와 확정 데미지 타입 상수를 가져옵니다.
import { stackManager } from './StackManager.js';
import { FIXED_DAMAGE_TYPES } from './FixedDamageManager.js';

/**
 * 실제 전투 데미지 계산을 담당하는 엔진
 */
class CombatCalculationEngine {
    /**
     * 스킬 또는 기본 공격 데미지 계산
     * @param {object} attacker
     * @param {object} defender
     * @param {object} skill - 사용된 스킬 데이터 (기본 공격 포함)
     * @returns {number} 최종 적용될 데미지
     */
    calculateDamage(attacker = {}, defender = {}, skill = {}, instanceId, grade = 'NORMAL') {
        // ✨ --- [신규] 피해 무효화 효과 최우선 처리 --- ✨
        if (stackManager.hasStack(defender.uniqueId, FIXED_DAMAGE_TYPES.DAMAGE_IMMUNITY)) {
            stackManager.consumeStack(defender.uniqueId, FIXED_DAMAGE_TYPES.DAMAGE_IMMUNITY);
            debugCombatLogManager.logAttackCalculation(attacker, defender, 0, 0, 0);
            return { damage: 0, hitType: '무효', comboCount: 0 };
        }

        const baseAttack = attacker.finalStats?.physicalAttack || 0;

        // 콤보 배율 계산을 위한 정보
        let comboMultiplier = 1.0;
        let comboCount = 0;
        if (skill.type === 'ACTIVE') {
            comboCount = comboManager.recordAttack(attacker.uniqueId, defender.uniqueId);
            comboMultiplier = comboManager.getDamageMultiplier(comboCount);
        }

        // ✨ 1. 공격자의 배리어에 의한 데미지 증폭률을 먼저 계산합니다.
        const amp = statEngine.valorEngine.calculateDamageAmplification(attacker.currentBarrier, attacker.maxBarrier);
        if (amp > 1.0) {
            debugValorManager.logDamageAmplification(attacker, amp);
        }
        const amplifiedAttack = baseAttack * amp;

        let finalSkill = skill;
        if (instanceId) {
            finalSkill = skillModifierEngine.getModifiedSkill(skill, grade);
        }

        // ✨ [신규] 방어력 관통 효과 적용
        const armorPen = finalSkill.armorPenetration || 0;
        const defenseReductionPercent = statusEffectManager.getModifierValue(defender, 'physicalDefense');
        const initialDefense = defender.finalStats?.physicalDefense || 0;
        const finalDefense = initialDefense * (1 + defenseReductionPercent) * (1 - armorPen);

        const damageMultiplier = finalSkill.damageMultiplier || 1.0;
        // ✨ 2. 증폭된 공격력을 기반으로 스킬 데미지를 계산합니다.
        const skillDamage = amplifiedAttack * damageMultiplier;

        const initialDamage = Math.max(1, skillDamage - finalDefense);

        // --- ✨ 전투 판정 로직 수정 ---
        let hitType = null;
        let combatMultiplier = 1.0;

        // ✨ [수정] 방어자의 확정 효과 스택을 확인합니다.
        let defenderEffect = null;
        if (stackManager.hasStack(defender.uniqueId, FIXED_DAMAGE_TYPES.BLOCK)) {
            defenderEffect = FIXED_DAMAGE_TYPES.BLOCK;
        } else if (stackManager.hasStack(defender.uniqueId, FIXED_DAMAGE_TYPES.MITIGATION)) {
            defenderEffect = FIXED_DAMAGE_TYPES.MITIGATION;
        }

        // 1. 확정 데미지 판정을 먼저 확인합니다.
        const fixedResult = fixedDamageManager.calculateFixedDamage(finalSkill.fixedDamage, defenderEffect);

        if (fixedResult) {
            // 확정 판정이 있는 경우 해당 결과를 사용
            hitType = fixedResult.hitType;
            combatMultiplier = fixedResult.multiplier;

            // ✨ 방어자가 확정 효과를 사용했다면 스택을 소모합니다.
            if (defenderEffect) {
                stackManager.consumeStack(defender.uniqueId, defenderEffect);
            }
        } else {
            // 확정 판정이 없으면 기존 등급 시스템으로 계산
            const attackType = this.getAttackTypeFromSkill(finalSkill);
            if (attackType) {
                const resultTier = gradeManager.calculateCombatGrade(attacker, defender, attackType);

                const roll = Math.random();
                let chance = 0.05;

                switch (resultTier) {
                    case 2:
                        chance += (attacker.finalStats.criticalChance || 0) / 100;
                        if (roll < chance) {
                            hitType = '치명타';
                            combatMultiplier = 2.0;
                        }
                        break;
                    case 1:
                        chance += (attacker.finalStats.weaknessChance || 0) / 100;
                        if (roll < chance) {
                            hitType = '약점';
                            combatMultiplier = 1.5;
                        }
                        break;
                    case -1:
                        chance += (defender.finalStats.mitigationChance || 0) / 100;
                        if (roll < chance) {
                            hitType = '완화';
                            combatMultiplier = 0.75;
                        }
                        break;
                    case -2:
                        chance += (defender.finalStats.blockChance || 0) / 100;
                        if (roll < chance) {
                            hitType = '막기';
                            combatMultiplier = 0.5;
                        }
                        break;
                }
            }
        }
        // --- ✨ 전투 판정 로직 종료 ---

        const damageAfterGrade = initialDamage * combatMultiplier;

        // ✨ 방어자의 받는 데미지 증가/감소 효과 적용
        const damageReductionPercent = statusEffectManager.getModifierValue(defender, 'damageReduction');
        const damageIncreasePercent = statusEffectManager.getModifierValue(defender, 'damageIncrease');
        // ✨ 아이언 윌 패시브 효과 계산
        const ironWillReduction = this.calculateIronWillReduction(defender);

        // 모든 데미지 감소/증가 효과를 합산
        const finalDamageMultiplier = 1 - damageReductionPercent - ironWillReduction + damageIncreasePercent;
        const damageBeforeCombo = damageAfterGrade * finalDamageMultiplier;
        const finalDamage = damageBeforeCombo * comboMultiplier;

        // 콤보 배율 적용 과정을 디버그 로그로 남깁니다.
        debugComboManager.logComboDamage(comboCount, comboMultiplier, damageBeforeCombo, finalDamage);

        if (damageReductionPercent > 0 || damageIncreasePercent > 0 || ironWillReduction > 0) {
            const effects = (statusEffectManager.activeEffects.get(defender.uniqueId) || [])
                .filter(e => {
                    if (!e.modifiers) return false;
                    if (Array.isArray(e.modifiers)) {
                        return e.modifiers.some(m => m.stat === 'damageReduction' || m.stat === 'damageIncrease');
                    }
                    return e.modifiers.stat === 'damageReduction' || e.modifiers.stat === 'damageIncrease';
                });
            debugStatusEffectManager.logDamageModification(defender, initialDamage, finalDamage, effects);
        }

        // 디버그 로그에 finalDefense 사용하도록 수정
        debugCombatLogManager.logAttackCalculation(attacker, defender, skillDamage, finalDamage, finalDefense);
        return { damage: Math.round(finalDamage), hitType: hitType, comboCount };
    }

    /**
     * 스킬 데이터의 태그를 분석하여 공격 타입을 반환합니다.
     * @param {object} skill - 스킬 데이터
     * @returns {string|null} - 'melee', 'ranged', 'magic' 또는 null
     */
    getAttackTypeFromSkill(skill) {
        if (!skill.tags) return null;
        if (skill.tags.includes(SKILL_TAGS.MELEE)) return ATTACK_TYPE.MELEE;
        if (skill.tags.includes(SKILL_TAGS.RANGED)) return ATTACK_TYPE.RANGED;
        if (skill.tags.includes(SKILL_TAGS.MAGIC)) return ATTACK_TYPE.MAGIC;
        return null;
    }

    /**
     * ✨ '아이언 윌' 패시브로 인한 데미지 감소율을 계산하는 새로운 메소드
     * @param {object} unit - 방어자 유닛
     * @returns {number} - 데미지 감소율 (예: 0.15는 15% 감소)
     */
    calculateIronWillReduction(unit) {
        const equipped = ownedSkillsManager.getEquippedSkills(unit.uniqueId);
        let reduction = 0;

        equipped.forEach((instId) => {
            if (!instId) return;
            const inst = skillInventoryManager.getInstanceData(instId);
            if (inst && inst.skillId === 'ironWill') {
                const gradeData = passiveSkills.ironWill[inst.grade] || passiveSkills.ironWill.NORMAL;
                const maxReduction = gradeData.maxReduction;

                // 잃은 체력 비율 계산 (0 ~ 1)
                const lostHpRatio = 1 - (unit.currentHp / unit.finalStats.hp);

                // 잃은 체력에 비례하여 데미지 감소율 적용
                reduction = maxReduction * lostHpRatio;

                // 디버그 로그 추가
                debugStatusEffectManager.logDamageModification(
                    unit,
                    100,
                    100 * (1 - reduction),
                    [{ sourceSkillName: `아이언 윌 (체력 ${((unit.currentHp / unit.finalStats.hp) * 100).toFixed(0)}%)` }]
                );
            }
        });

        return reduction;
    }
}

export const combatCalculationEngine = new CombatCalculationEngine();
