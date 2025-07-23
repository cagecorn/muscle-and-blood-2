import { debugCombatLogManager } from '../debug/DebugCombatLogManager.js';
import { statusEffectManager } from './StatusEffectManager.js';
import { debugStatusEffectManager } from '../debug/DebugStatusEffectManager.js';

/**
 * 실제 전투 데미지 계산을 담당하는 엔진
 */
class CombatCalculationEngine {
    /**
     * 기본 공격 데미지 계산
     * @param {object} attacker
     * @param {object} defender
     * @returns {number} 최종 적용될 데미지
     */
    calculateDamage(attacker = {}, defender = {}) {
        const baseAttack = attacker.finalStats?.physicalAttack || 0;
        const baseDefense = defender.finalStats?.physicalDefense || 0;

        const initialDamage = Math.max(1, baseAttack - baseDefense);

        const damageReductionPercent = statusEffectManager.getModifierValue(defender, 'damageReduction');

        const finalDamage = initialDamage * (1 - damageReductionPercent);

        if (damageReductionPercent > 0) {
            const effects = (statusEffectManager.activeEffects.get(defender.uniqueId) || [])
                .filter(e => e.modifiers.stat === 'damageReduction');
            debugStatusEffectManager.logDamageModification(defender, initialDamage, finalDamage, effects);
        }

        debugCombatLogManager.logAttackCalculation(attacker, defender, baseAttack, finalDamage);
        return finalDamage;
    }
}

export const combatCalculationEngine = new CombatCalculationEngine();
