import { debugLogEngine } from './DebugLogEngine.js';
import { debugStatusEffectManager } from '../debug/DebugStatusEffectManager.js';
import { statusEffects } from '../data/status-effects.js';
// ✨ 아이언 윌 로직에 필요한 모듈 추가
import { ownedSkillsManager } from './OwnedSkillsManager.js';
import { skillInventoryManager } from './SkillInventoryManager.js';
import { passiveSkills } from '../data/skills/passive.js';
// 상태이상 시 스프라이트 교체에 사용
import { spriteEngine } from './SpriteEngine.js';

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
        this.battleSimulator = null;
        debugLogEngine.log('StatusEffectManager', '상태 효과 매니저가 초기화되었습니다.');
    }

    /** BattleSimulatorEngine과 연동하여 유닛 검색에 사용할 참조를 설정합니다. */
    setBattleSimulator(simulator) {
        this.battleSimulator = simulator;
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
                    const effectDefinition = statusEffects[effect.id];
                    if (effectDefinition && effectDefinition.onRemove) {
                        const unit = this.findUnitById(unitId);
                        if (unit) effectDefinition.onRemove(unit);
                    }
                    debugStatusEffectManager.logEffectExpired(unitId, effect);
                }
            }
            this.activeEffects.set(unitId, remainingEffects);
        }

        // ✨ 아이언 윌 체력 회복 로직 추가
        if (this.battleSimulator) {
            this.battleSimulator.turnQueue.forEach(unit => {
                if (unit.currentHp > 0) {
                    this.applyIronWillRegen(unit);
                }
            });
        }
    }

    /**
     * ✨ '아이언 윌'의 등급별 체력 회복 효과를 적용하는 새로운 메소드
     * @param {object} unit - 대상 유닛
     */
    applyIronWillRegen(unit) {
        const equipped = ownedSkillsManager.getEquippedSkills(unit.uniqueId);
        equipped.forEach(instId => {
            if (!instId) return;
            const inst = skillInventoryManager.getInstanceData(instId);
            if (inst && inst.skillId === 'ironWill') {
                const skillData = passiveSkills.ironWill;
                const gradeData = skillData[inst.grade];

                if (gradeData && gradeData.hpRegen > 0) {
                    const healAmount = Math.round(unit.finalStats.hp * gradeData.hpRegen);
                    unit.currentHp = Math.min(unit.finalStats.hp, unit.currentHp + healAmount);

                    // VFX 매니저가 있다면 체력바 업데이트 및 회복량 표시
                    if (this.battleSimulator && this.battleSimulator.vfxManager) {
                        this.battleSimulator.vfxManager.updateHealthBar(unit.healthBar, unit.currentHp, unit.finalStats.hp);
                        this.battleSimulator.vfxManager.createDamageNumber(unit.sprite.x, unit.sprite.y - 20, `+${healAmount}`, '#22c55e');
                    }
                    debugLogEngine.log('StatusEffectManager', `${unit.instanceName}이(가) '아이언 윌' 효과로 HP ${healAmount} 회복.`);
                }
            }
        });
    }

    /**
     * 대상 유닛에게 새로운 상태 효과를 적용합니다.
     * @param {object} targetUnit - 효과를 받을 유닛
     * @param {object} sourceSkill - 효과를 발생시킨 스킬 데이터
     */
    addEffect(targetUnit, sourceSkill) {
        if (!sourceSkill.effect) return;

        // ✨ [신규] isGlobal 효과 처리
        if (sourceSkill.effect.isGlobal) {
            const allies = this.battleSimulator.turnQueue.filter(u => u.team === targetUnit.team && u.currentHp > 0);
            allies.forEach(ally => {
                this.applySingleEffect(ally, sourceSkill);
            });
        } else {
            this.applySingleEffect(targetUnit, sourceSkill);
        }
    }

    // ✨ 기존 addEffect 로직을 별도 함수로 분리
    applySingleEffect(targetUnit, sourceSkill) {
        const effectId = sourceSkill.effect.id;
        const effectDefinition = statusEffects[effectId];

        if (!effectDefinition) {
            debugLogEngine.warn('StatusEffectManager', `정의되지 않은 효과 ID: ${effectId}`);
            return;
        }

        const newEffect = {
            instanceId: this.nextEffectInstanceId++,
            ...sourceSkill.effect,
            sourceSkillName: sourceSkill.name,
        };

        if (!this.activeEffects.has(targetUnit.uniqueId)) {
            this.activeEffects.set(targetUnit.uniqueId, []);
        }
        this.activeEffects.get(targetUnit.uniqueId).push(newEffect);

        if (effectDefinition.onApply) {
            effectDefinition.onApply(targetUnit);
        }

        // 상태 효과 이름 표시
        if (this.battleSimulator && this.battleSimulator.vfxManager && effectDefinition.name) {
            const color = newEffect.type === EFFECT_TYPES.BUFF ? '#22c55e' : '#ef4444';
            this.battleSimulator.vfxManager.showEffectName(targetUnit.sprite, effectDefinition.name, color);
        }

        // 버프가 아니라면 상태이상 스프라이트를 잠시 적용
        if (newEffect.type !== EFFECT_TYPES.BUFF) {
            spriteEngine.changeSpriteForDuration(targetUnit, 'status-effects', 1000);
        }

        debugStatusEffectManager.logEffectApplied(targetUnit, newEffect);
    }

    findUnitById(unitId) {
        if (!this.battleSimulator) return null;
        return this.battleSimulator.turnQueue.find(u => u.uniqueId === unitId) || null;
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
            const mods = effect.modifiers;
            if (Array.isArray(mods)) {
                for (const m of mods) {
                    if (m.stat === modifierType) {
                        totalValue += m.value;
                        relevantEffects.push(effect);
                    }
                }
            } else if (mods && mods.stat === modifierType) {
                totalValue += mods.value;
                relevantEffects.push(effect);
            }
        }

        // 값의 변화 로그는 CombatCalculationEngine에서 처리합니다.
        return totalValue;
    }

    // ✨ [신규] 해로운 효과 1개를 제거합니다.
    removeOneDebuff(unit) {
        const effects = this.activeEffects.get(unit.uniqueId);
        if (!effects || effects.length === 0) return false;
        const index = effects.findIndex(e => e.type !== EFFECT_TYPES.BUFF);
        if (index === -1) return false;

        const [removed] = effects.splice(index, 1);
        const def = statusEffects[removed.id];
        if (def && def.onRemove) {
            def.onRemove(unit);
        }
        debugStatusEffectManager.logEffectExpired(unit.uniqueId, removed);
        return true;
    }
}

export const statusEffectManager = new StatusEffectManager();
