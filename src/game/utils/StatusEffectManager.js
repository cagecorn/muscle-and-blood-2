import { debugLogEngine } from './DebugLogEngine.js';
import { debugStatusEffectManager } from '../debug/DebugStatusEffectManager.js';

// 효과의 종류를 명확히 구분하기 위한 상수
export const EFFECT_TYPES = {
    BUFF: 'BUFF',
    DEBUFF: 'DEBUFF',
    STATUS_EFFECT: 'STATUS_EFFECT', // 기절, 빙결 등 행동을 제어하는 효과
};

/**
 * 게임 내 모든 상태 효과(버프, 디버프, 상태이상)를 관리하는 중앙 엔진
 */
class StatusEffectManager {
    constructor() {
        // key: unitId, value: Array of active effects
        this.activeEffects = new Map();
        this.nextEffectInstanceId = 1;
        debugLogEngine.log('StatusEffectManager', '상태 효과 매니저가 초기화되었습니다.');
    }

    /**
     * 턴 종료 시 모든 활성 효과의 지속시간을 감소시키고 만료된 효과를 제거합니다.
     */
    onTurnEnd() {
        for (const [unitId, effects] of this.activeEffects.entries()) {
            const remainingEffects = [];
            for (const effect of effects) {
                effect.duration--;
                if (effect.duration > 0) {
                    remainingEffects.push(effect);
                } else {
                    debugStatusEffectManager.logEffectExpired(unitId, effect);
                }
            }
            this.activeEffects.set(unitId, remainingEffects);
        }
    }

    /**
     * 대상 유닛에게 새로운 상태 효과를 적용합니다.
     * @param {object} targetUnit - 효과를 받을 유닛
     * @param {object} sourceSkill - 효과를 발생시킨 스킬 데이터
     */
    addEffect(targetUnit, sourceSkill) {
        if (!sourceSkill.effect) return;

        const newEffect = {
            instanceId: this.nextEffectInstanceId++,
            ...sourceSkill.effect,
            sourceSkillName: sourceSkill.name,
        };

        if (!this.activeEffects.has(targetUnit.uniqueId)) {
            this.activeEffects.set(targetUnit.uniqueId, []);
        }
        this.activeEffects.get(targetUnit.uniqueId).push(newEffect);

        debugStatusEffectManager.logEffectApplied(targetUnit, newEffect);
    }

    /**
     * 특정 유닛의 특정 보정치 타입 값을 합산합니다.
     * @param {object} unit - 대상 유닛
     * @param {string} modifierType - 계산할 보정치 타입 (예: 'physicalDefense', 'damageReduction')
     * @returns {number} - 해당 타입의 모든 효과 값을 합산한 결과
     */
    getModifierValue(unit, modifierType) {
        const effects = this.activeEffects.get(unit.uniqueId) || [];
        let totalValue = 0;

        const relevantEffects = [];

        for (const effect of effects) {
            if (effect.modifiers && effect.modifiers.stat === modifierType) {
                totalValue += effect.modifiers.value;
                relevantEffects.push(effect);
            }
        }

        // 값의 변화 로그는 CombatCalculationEngine에서 처리합니다.
        return totalValue;
    }
}

export const statusEffectManager = new StatusEffectManager();
