import { debugCombatLogManager } from '../debug/DebugCombatLogManager.js';
import { statusEffectManager } from './StatusEffectManager.js';
import { debugStatusEffectManager } from '../debug/DebugStatusEffectManager.js';
import { skillModifierEngine } from './SkillModifierEngine.js';
import { ownedSkillsManager } from './OwnedSkillsManager.js';

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
    calculateDamage(attacker = {}, defender = {}, skill = {}, instanceId) {
        const baseAttack = attacker.finalStats?.physicalAttack || 0;
        const baseDefense = defender.finalStats?.physicalDefense || 0;

        let finalSkill = skill;
        if (instanceId) {
            const equippedSkills = ownedSkillsManager.getEquippedSkills(attacker.uniqueId);
            const rank = equippedSkills.indexOf(instanceId) + 1;
            if (rank > 0) {
                finalSkill = skillModifierEngine.getModifiedSkill(skill, rank);
            }
        }

        const damageMultiplier = finalSkill.damageMultiplier || 1.0;
        const skillDamage = baseAttack * damageMultiplier;

        const initialDamage = Math.max(1, skillDamage - baseDefense);

        // ✨ 방어자의 받는 데미지 증가/감소 효과 적용
        const damageReductionPercent = statusEffectManager.getModifierValue(defender, 'damageReduction');
        const damageIncreasePercent = statusEffectManager.getModifierValue(defender, 'damageIncrease');
        const finalDamageMultiplier = 1 - damageReductionPercent + damageIncreasePercent;

        const finalDamage = initialDamage * finalDamageMultiplier;

        if (damageReductionPercent > 0 || damageIncreasePercent > 0) {
            const effects = (statusEffectManager.activeEffects.get(defender.uniqueId) || [])
                .filter(e => e.modifiers && (e.modifiers.stat === 'damageReduction' || e.modifiers.stat === 'damageIncrease'));
            debugStatusEffectManager.logDamageModification(defender, initialDamage, finalDamage, effects);
        }

        debugCombatLogManager.logAttackCalculation(attacker, defender, skillDamage, finalDamage);
        return Math.round(finalDamage);
    }
}

export const combatCalculationEngine = new CombatCalculationEngine();
