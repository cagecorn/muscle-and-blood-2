import { debugCombatLogManager } from '../debug/DebugCombatLogManager.js';

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
        const base = attacker.finalStats?.physicalAttack || 0;
        const def = defender.finalStats?.physicalDefense || 0;
        const finalDamage = Math.max(1, base - def);
        debugCombatLogManager.logAttackCalculation(attacker, defender, base, finalDamage);
        return finalDamage;
    }
}

export const combatCalculationEngine = new CombatCalculationEngine();
