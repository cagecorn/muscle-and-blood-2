import { SKILL_TYPES } from './SkillEngine.js';
import { statusEffectManager } from './StatusEffectManager.js';
import { spriteEngine } from './SpriteEngine.js';
import { combatCalculationEngine } from './CombatCalculationEngine.js';
import { formationEngine } from './FormationEngine.js';
import { tokenEngine } from './TokenEngine.js';
import { battleTagManager } from './BattleTagManager.js';
import { turnOrderManager } from './TurnOrderManager.js';
import { classSpecializations } from '../data/classSpecializations.js';
import { yinYangEngine } from './YinYangEngine.js';
import { sharedResourceEngine, SHARED_RESOURCE_TYPES } from './SharedResourceEngine.js';
import { diceEngine } from './DiceEngine.js';
import { debugLogEngine } from './DebugLogEngine.js';
import { comboManager } from './ComboManager.js';

/**
 * 스킬의 실제 효과(데미지, 치유, 상태이상 등)를 게임 세계에 적용하는 것을 전담하는 엔진
 */
class SkillEffectProcessor {
    constructor(engines) {
        this.vfxManager = engines.vfxManager;
        this.animationEngine = engines.animationEngine;
        this.terminationManager = engines.terminationManager;
        this.summoningEngine = engines.summoningEngine;
        this.battleSimulator = engines.battleSimulator;
    }

    /**
     * 스킬 효과 적용의 메인 메서드
     * @param {object} context - 스킬 처리에 필요한 모든 정보
     */
    async process(context) {
        const { unit, target, skill, instanceId, grade, blackboard } = context;

        // 1. 공통 처리: 태그 기록, 자원 소모, 음양 지수 업데이트
        this._handleCommonPreEffects(unit, target, skill);

        // 2. 스킬 타입별 분기 처리
        switch (skill.type) {
            case 'ACTIVE':
            case 'DEBUFF':
                await this._processOffensiveSkill(unit, target, skill, instanceId, grade);
                break;
            case 'AID':
                await this._processAidSkill(unit, target, skill);
                break;
            case 'SUMMON':
                await this._processSummonSkill(unit, skill);
                break;
            case 'BUFF':
            case 'STRATEGY':
                // BUFF와 STRATEGY는 주로 상태 효과 적용이 핵심
                spriteEngine.changeSpriteForDuration(unit, 'cast', 600);
                break;
        }

        // 3. 공통 처리: 상태 효과 적용, 자원 생성
        this._handleCommonPostEffects(unit, target, skill, blackboard);

        // ✨ [신규] 4. 클래스 패시브 발동 처리
        this._handleClassPassiveTrigger(unit, skill);
    }

    _handleCommonPreEffects(unit, target, skill) {
        battleTagManager.recordSkillUse(unit, target, skill);
        yinYangEngine.updateBalance(unit.uniqueId, skill.yinYangValue);

        if (skill.resourceCost) {
            sharedResourceEngine.spendResource(unit.team, skill.resourceCost);
            const costText = Array.isArray(skill.resourceCost)
                ? skill.resourceCost.map(c => `[${c.type}] ${c.amount}`).join(', ')
                : `[${skill.resourceCost.type}] ${skill.resourceCost.amount}`;
            debugLogEngine.log('SkillEffectProcessor', `${costText} 소모`);
        }
    }

    _handleCommonPostEffects(unit, target, skill, blackboard) {
        if (skill.generatesResource) {
            sharedResourceEngine.addResource(unit.team, skill.generatesResource.type, skill.generatesResource.amount);
            debugLogEngine.log('SkillEffectProcessor', `[${skill.generatesResource.type}] ${skill.generatesResource.amount} 생산`);
        }

        // 클래스 및 속성 특화 보너스 적용
        this._applySpecializationBonuses(unit, skill);
        
        // 상태 효과 적용
        if (skill.effect) {
            this._applyStatusEffects(unit, target, skill, blackboard);
        }
    }

    /**
     * 스킬 사용 후 발동하는 클래스 패시브를 처리합니다.
     * @param {object} unit - 스킬을 사용한 유닛
     * @param {object} skill - 사용된 스킬
     * @private
     */
    _handleClassPassiveTrigger(unit, skill) {
        if (!unit.classPassive) return;

        switch (unit.classPassive.id) {
            case 'elementalManifest': {
                // 패시브, 전략 스킬은 자원 생성을 발동시키지 않습니다.
                if (skill.type === 'PASSIVE' || skill.type === 'STRATEGY') break;

                const resourceTypes = Object.keys(SHARED_RESOURCE_TYPES);
                const randomResourceType = diceEngine.getRandomElement(resourceTypes);
                sharedResourceEngine.addResource(unit.team, randomResourceType, 1);
                debugLogEngine.log(
                    this.constructor.name,
                    `[${unit.instanceName}]의 [원소 구현] 패시브 발동! [${SHARED_RESOURCE_TYPES[randomResourceType]}] 자원 1개 생산.`
                );
                break;
            }
            // ... 다른 클래스 패시브 case 추가 ...
        }
    }

    async _processOffensiveSkill(unit, target, skill, instanceId, grade) {
        spriteEngine.changeSpriteForDuration(unit, 'attack', 600);
        await this.animationEngine.attack(unit.sprite, target.sprite);
        spriteEngine.changeSpriteForDuration(target, 'hitted', 300);

        if (skill.type !== 'ACTIVE') return;

        const { damage: totalDamage, hitType, comboCount } = combatCalculationEngine.calculateDamage(unit, target, skill, instanceId, grade);
        
        const damageToBarrier = Math.min(target.currentBarrier, totalDamage);
        const damageToHp = totalDamage - damageToBarrier;

        if (damageToBarrier > 0) {
            target.currentBarrier -= damageToBarrier;
            this.vfxManager.createDamageNumber(target.sprite.x, target.sprite.y - 10, damageToBarrier, '#ffd700', hitType);
        }
        if (damageToHp > 0) {
            target.currentHp -= damageToHp;
            this.vfxManager.createDamageNumber(target.sprite.x, target.sprite.y + 10, damageToHp, '#ff4d4d', hitType);
        }

        this.vfxManager.showComboCount(comboCount);
        this.vfxManager.createBloodSplatter(target.sprite.x, target.sprite.y);

        // ✨ [신규] 공격이 끝났으므로, 다음 공격의 콤보 연계를 위해 현재 스킬의 태그를 ComboManager에 기록합니다.
        comboManager.updateLastSkillTags(unit.uniqueId, skill.tags || []);

        if (skill.generatesToken && Math.random() < skill.generatesToken.chance) {
            tokenEngine.addTokens(unit.uniqueId, skill.generatesToken.amount, `${skill.name} 효과`);
        }
        if (skill.turnOrderEffect === 'pushToBack' && this.battleSimulator) {
            this.battleSimulator.turnQueue = turnOrderManager.pushToBack(this.battleSimulator.turnQueue, target);
        }
        if (skill.push > 0) {
            await formationEngine.pushUnit(target, unit, skill.push, this.animationEngine);
        }
        if (skill.pull) {
            await formationEngine.pullUnit(target, unit, this.animationEngine);
        }
        if (skill.restoresBarrierPercent && unit.maxBarrier > 0) {
            const healAmount = Math.round(unit.maxBarrier * skill.restoresBarrierPercent);
            unit.currentBarrier = Math.min(unit.maxBarrier, unit.currentBarrier + healAmount);
            this.vfxManager.createDamageNumber(unit.sprite.x, unit.sprite.y - 10, `+${healAmount}`, '#ffd700', '배리어');
        }

        if (target.currentHp <= 0) {
            this.terminationManager.handleUnitDeath(target);
        }
    }

    async _processAidSkill(unit, target, skill) {
        spriteEngine.changeSpriteForDuration(unit, 'cast', 600);
        if (target.isHealingProhibited) {
            debugLogEngine.log('SkillEffectProcessor', `${target.instanceName}은(는) 치료 금지 상태라 회복 불가!`);
            return;
        }

        const healAmount = Math.round(unit.finalStats.wisdom * (skill.healMultiplier || 0));
        if (healAmount > 0) {
            target.currentHp = Math.min(target.finalStats.hp, target.currentHp + healAmount);
            this.vfxManager.createDamageNumber(target.sprite.x, target.sprite.y, `+${healAmount}`, '#22c55e');
        }

        if (skill.removesDebuff && Math.random() < skill.removesDebuff.chance) {
            statusEffectManager.removeOneDebuff(target);
        }
    }

    async _processSummonSkill(unit, skill) {
        spriteEngine.changeSpriteForDuration(unit, 'cast', 600);
        this.summoningEngine.summon(unit, skill);
    }

    _applySpecializationBonuses(unit, skill) {
        const specializations = classSpecializations[unit.id] || [];
        skill.tags.forEach(tag => {
            const spec = specializations.find(s => s.tag === tag);
            if (spec) {
                statusEffectManager.addEffect(unit, { name: `특화 보너스: ${spec.tag}`, effect: spec.effect }, unit);
                debugLogEngine.log('SkillEffectProcessor', `${unit.instanceName}가 특화 태그 [${spec.tag}] 보너스 획득!`);
            }
        });

        if (unit.attributeSpec && skill.tags.includes(unit.attributeSpec.tag)) {
            statusEffectManager.addEffect(unit, { name: `속성 특화: ${unit.attributeSpec.tag}`, effect: unit.attributeSpec.effect }, unit);
            debugLogEngine.log('SkillEffectProcessor', `${unit.instanceName}가 속성 특화 태그 [${unit.attributeSpec.tag}] 보너스 획득!`);
        }
    }
    
    _applyStatusEffects(unit, target, skill, blackboard) {
        const baseTargets = [target];
        // 다중 타겟 처리
        if (skill.numberOfTargets && skill.numberOfTargets > 1) {
            const enemyUnits = blackboard.get('enemyUnits')?.filter(e => e.currentHp > 0 && e.uniqueId !== target.uniqueId) || [];
            if (enemyUnits.length > 0) {
                 let farthestEnemies = [];
                let maxDist = -1;
                enemyUnits.forEach(enemy => {
                    const dist = Math.abs(unit.gridX - enemy.gridX) + Math.abs(unit.gridY - enemy.gridY);
                    if (dist > maxDist) {
                        maxDist = dist;
                        farthestEnemies = [enemy];
                    } else if (dist === maxDist) {
                        farthestEnemies.push(enemy);
                    }
                });
                if (farthestEnemies.length > 0) {
                    const secondTarget = farthestEnemies.sort((a, b) => a.currentHp - b.currentHp)[0];
                    if (secondTarget) baseTargets.push(secondTarget);
                }
            }
        }
    
        baseTargets.forEach(currentTarget => {
            const roll = Math.random();
            if (skill.effect.chance === undefined || roll < skill.effect.chance) {
                statusEffectManager.addEffect(currentTarget, skill, unit);
            } else {
                debugLogEngine.log('SkillEffectProcessor', `[${skill.name}]의 효과 발동 실패 (확률: ${skill.effect.chance}, 주사위: ${roll.toFixed(2)})`);
            }
        });
    }
}

export default SkillEffectProcessor;
