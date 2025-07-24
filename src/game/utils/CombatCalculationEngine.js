import { debugCombatLogManager } from '../debug/DebugCombatLogManager.js';
import { statusEffectManager } from './StatusEffectManager.js';
import { debugStatusEffectManager } from '../debug/DebugStatusEffectManager.js';
import { skillModifierEngine } from './SkillModifierEngine.js';
import { ownedSkillsManager } from './OwnedSkillsManager.js';
// ✨ 아이언 윌 로직에 필요한 모듈 추가
import { skillInventoryManager } from './SkillInventoryManager.js';
import { passiveSkills } from '../data/skills/passive.js';

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
        const baseAttack = attacker.finalStats?.physicalAttack || 0;

        // ✨ 방어자의 방어력 감소/증가 효과 적용
        const defenseReductionPercent = statusEffectManager.getModifierValue(defender, 'physicalDefense');
        const initialDefense = defender.finalStats?.physicalDefense || 0;
        // 방어력 보정치 적용 (예: -0.1이면 10% 감소)
        const finalDefense = initialDefense * (1 + defenseReductionPercent);

        let finalSkill = skill;
        if (instanceId) {
            const equippedSkills = ownedSkillsManager.getEquippedSkills(attacker.uniqueId);
            const rank = equippedSkills.indexOf(instanceId) + 1;
            if (rank > 0) {
                finalSkill = skillModifierEngine.getModifiedSkill(skill, rank, grade);
            }
        }

        const damageMultiplier = finalSkill.damageMultiplier || 1.0;
        const skillDamage = baseAttack * damageMultiplier;

        const initialDamage = Math.max(1, skillDamage - finalDefense);

        // ✨ 방어자의 받는 데미지 증가/감소 효과 적용
        const damageReductionPercent = statusEffectManager.getModifierValue(defender, 'damageReduction');
        const damageIncreasePercent = statusEffectManager.getModifierValue(defender, 'damageIncrease');
        // ✨ 아이언 윌 패시브 효과 계산
        const ironWillReduction = this.calculateIronWillReduction(defender);

        // 모든 데미지 감소/증가 효과를 합산
        const finalDamageMultiplier = 1 - damageReductionPercent - ironWillReduction + damageIncreasePercent;

        const finalDamage = initialDamage * finalDamageMultiplier;

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
        return Math.round(finalDamage);
    }

    /**
     * ✨ '아이언 윌' 패시브로 인한 데미지 감소율을 계산하는 새로운 메소드
     * @param {object} unit - 방어자 유닛
     * @returns {number} - 데미지 감소율 (예: 0.15는 15% 감소)
     */
    calculateIronWillReduction(unit) {
        const equipped = ownedSkillsManager.getEquippedSkills(unit.uniqueId);
        let reduction = 0;

        equipped.forEach((instId, index) => {
            if (!instId) return;
            const inst = skillInventoryManager.getInstanceData(instId);
            if (inst && inst.skillId === 'ironWill') {
                const skillData = passiveSkills.ironWill;
                const rank = index + 1;
                const rankIndex = rank - 1;

                // 순위에 맞는 최대 감소율 가져오기
                const maxReduction = skillData.rankModifiers[rankIndex] || skillData.NORMAL.maxReduction;

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
