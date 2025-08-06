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
import { SKILL_TAGS } from './SkillTagManager.js';
import { EFFECT_TYPES } from './EffectTypes.js'; // EFFECT_TYPES import 추가
import { areaOfEffectEngine } from './AreaOfEffectEngine.js';
// ✨ 1. StatEngine을 import하여 스탯을 재계산할 수 있도록 합니다.
import { statEngine } from './StatEngine.js';
// 상태 효과 데이터베이스를 통해 해커 패시브에 사용할 디버프를 조회합니다.
import { statusEffects } from '../data/status-effects.js';

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

        // ✨ '희생' 태그 스킬 사용 시 '강화 학습' 패시브 발동
        if (skill.tags?.includes(SKILL_TAGS.SACRIFICE)) {
            this.battleSimulator.triggerReinforcementLearning(unit, '희생 스킬 사용');
        }

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

            // --- ▼ [신규] '해커의 침입' 패시브 발동 로직 ▼ ---
            if (unit.classPassive?.id === 'hackersInvade' && skill.type === 'DEBUFF') {
                const allDebuffs = Object.values(statusEffects).filter(
                    e => e.type === EFFECT_TYPES.DEBUFF && e.id !== skill.effect.id
                );

                if (allDebuffs.length > 0) {
                    const randomDebuff = diceEngine.getRandomElement(allDebuffs);
                    const bonusDebuffSkill = {
                        name: `[침입] ${randomDebuff.name}`,
                        effect: { ...randomDebuff, duration: 1 }
                    };
                    statusEffectManager.addEffect(target, bonusDebuffSkill, unit);

                    debugLogEngine.log(
                        this.constructor.name,
                        `[해커의 침입] 패시브 발동! ${target.instanceName}에게 [${randomDebuff.name}] 추가 적용.`
                    );
                    this.vfxManager.showEffectName(unit.sprite, '해커의 침입!', '#22c55e');
                }
            }
            // --- ▲ [신규] '해커의 침입' 패시브 발동 로직 ▲ ---
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
            // --- ▼ [신규] '해독제' 패시브 로직 추가 ▼ ---
            case 'antidote': {
                const radius = 3;
                const allies = this.battleSimulator.turnQueue.filter(
                    u => u.team === unit.team && u.uniqueId !== unit.uniqueId && u.currentHp > 0
                );

                let targetToCleanse = null;

                // 1. 주변 아군 중 디버프가 있는 아군 탐색
                const nearbyAllies = allies.filter(ally => {
                    const distance = Math.abs(unit.gridX - ally.gridX) + Math.abs(unit.gridY - ally.gridY);
                    return distance <= radius;
                });

                const debuffedAllies = nearbyAllies.filter(ally => {
                    const effects = statusEffectManager.activeEffects.get(ally.uniqueId) || [];
                    return effects.some(e => e.type === EFFECT_TYPES.DEBUFF || e.type === EFFECT_TYPES.STATUS_EFFECT);
                });

                if (debuffedAllies.length > 0) {
                    // 디버프 걸린 아군 중 무작위 한 명 선택
                    targetToCleanse = diceEngine.getRandomElement(debuffedAllies);
                } else {
                    // 주변에 대상이 없으면 자기 자신을 확인
                    const selfEffects = statusEffectManager.activeEffects.get(unit.uniqueId) || [];
                    if (selfEffects.some(e => e.type === EFFECT_TYPES.DEBUFF || e.type === EFFECT_TYPES.STATUS_EFFECT)) {
                        targetToCleanse = unit;
                    }
                }

                // 2. 대상이 있으면 디버프 1개 제거
                if (targetToCleanse) {
                    const success = statusEffectManager.removeOneDebuff(targetToCleanse);
                    if (success) {
                        debugLogEngine.log(
                            this.constructor.name,
                            `[${unit.instanceName}]의 [해독제] 패시브 발동! [${targetToCleanse.instanceName}]의 해로운 효과 1개를 제거했습니다.`
                        );
                        this.vfxManager.showEffectName(targetToCleanse.sprite, '정화', '#60a5fa');
                    }
                }
                break;
            }
            // --- ▲ [신규] '해독제' 패시브 로직 추가 ▲ ---
            // ... 다른 클래스 패시브 case 추가 ...
        }
    }

    async _processOffensiveSkill(unit, target, skill, instanceId, grade) {
        spriteEngine.changeSpriteForDuration(unit, 'attack', 600);

        // ▼▼▼ [수정] 마법 스킬일 경우 공격 애니메이션을 다르게 처리합니다. ▼▼▼
        if (skill.tags?.includes(SKILL_TAGS.MAGIC)) {
            this.vfxManager.createMagicImpact(target.sprite.x, target.sprite.y, 'placeholder');
            await this.battleSimulator.delayEngine.hold(300);
        } else {
            await this.animationEngine.attack(unit.sprite, target.sprite);
        }
        // ▲▲▲ [수정] ▲▲▲

        if (skill.type !== 'ACTIVE') return;

        // ▼▼▼ [핵심 수정] 단일 타겟과 광역 타겟을 모두 처리하도록 로직 수정 ▼▼▼
        let finalTargets = [target];

        if (skill.aoe) {
            const targetCellPos = { col: target.gridX, row: target.gridY };
            const affectedCells = areaOfEffectEngine.getAffectedCells(skill.aoe.shape, targetCellPos, skill.aoe.radius || skill.aoe.length, unit);

            const allUnits = this.battleSimulator.turnQueue;
            const affectedEnemies = allUnits.filter(u =>
                u.team !== unit.team &&
                u.currentHp > 0 &&
                affectedCells.some(cell => cell.col === u.gridX && cell.row === u.gridY)
            );
            finalTargets = affectedEnemies.length > 0 ? affectedEnemies : [];
        }

        for (const currentTarget of finalTargets) {
            spriteEngine.changeSpriteForDuration(currentTarget, 'hitted', 300);

            const { damage: totalDamage, hitType, comboCount } = combatCalculationEngine.calculateDamage(unit, currentTarget, skill, instanceId, grade);

            const damageToBarrier = Math.min(currentTarget.currentBarrier, totalDamage);
            const damageToHp = totalDamage - damageToBarrier;

            if (damageToBarrier > 0) {
                currentTarget.currentBarrier -= damageToBarrier;
                this.vfxManager.createDamageNumber(currentTarget.sprite.x, currentTarget.sprite.y - 10, damageToBarrier, '#ffd700', hitType);
            }
            if (damageToHp > 0) {
                currentTarget.currentHp -= damageToHp;
                this.vfxManager.createDamageNumber(currentTarget.sprite.x, currentTarget.sprite.y + 10, damageToHp, '#ff4d4d', hitType);

                if (currentTarget.classPassive?.id === 'ghosting') {
                    currentTarget.cumulativeDamageTaken += damageToHp;
                    const threshold = currentTarget.finalStats.hp * 0.20;

                    if (currentTarget.cumulativeDamageTaken >= threshold) {
                        currentTarget.cumulativeDamageTaken = 0;
                        const buffEffect = {
                            id: 'ghostingBuff',
                            type: EFFECT_TYPES.BUFF,
                            duration: 1,
                            sourceSkillName: '투명화'
                        };
                        statusEffectManager.addEffect(currentTarget, { name: '투명화', effect: buffEffect }, currentTarget);
                        this.vfxManager.showEffectName(currentTarget.sprite, '투명화!', '#a78bfa');
                    }
                }
            }

            this.vfxManager.showComboCount(comboCount);
            this.vfxManager.createBloodSplatter(currentTarget.sprite.x, currentTarget.sprite.y);

            if (skill.centerTargetEffect && currentTarget.uniqueId === target.uniqueId) {
                statusEffectManager.addEffect(currentTarget, { name: skill.name, effect: skill.centerTargetEffect }, unit);
            }

            if (currentTarget.currentHp <= 0) {
                this.terminationManager.handleUnitDeath(currentTarget, unit);

                if (skill.tags?.includes(SKILL_TAGS.EXECUTE) &&
                    classSpecializations[unit.id]?.some(s => s.tag === SKILL_TAGS.EXECUTE)) {
                    tokenEngine.addTokens(unit.uniqueId, 1, '처형 특화');
                }
            }
        }
        // ▲▲▲ [핵심 수정] 종료 ▲▲▲

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

    }

    async _processAidSkill(unit, target, skill) {
        spriteEngine.changeSpriteForDuration(unit, 'cast', 600);
        if (target.isHealingProhibited) {
            debugLogEngine.log('SkillEffectProcessor', `${target.instanceName}은(는) 치료 금지 상태라 회복 불가!`);
            return;
        }

        let healAmount = Math.round(unit.finalStats.wisdom * (skill.healMultiplier || 0));

        // --- ▼ [신규] 메딕 '응급처치' 패시브 로직 추가 ▼ ---
        if (unit.classPassive?.id === 'firstAid' &&
            skill.tags?.includes(SKILL_TAGS.HEAL) &&
            (target.currentHp / target.finalStats.hp) <= 0.25)
        {
            const bonusHeal = healAmount * 0.25;
            healAmount += bonusHeal;
            debugLogEngine.log(
                this.constructor.name,
                `[${unit.instanceName}]의 [응급처치] 패시브 발동! 치유량 +25% (${bonusHeal.toFixed(0)})`
            );
            this.vfxManager.showEffectName(unit.sprite, '응급처치!', '#22c55e');
        }
        // --- ▲ [신규] 메딕 '응급처치' 패시브 로직 추가 ▲ ---

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
                // ✨ [핵심 수정] 메카닉의 소환 특화 보너스를 위한 별도 로직 추가
                if (spec.effect?.id === 'mechanicSummonBonus') {
                    // SummoningEngine을 통해 현재 유닛이 소환한 모든 소환수의 ID를 가져옵니다.
                    const summons = this.summoningEngine.getSummons(unit.uniqueId);
                    if (summons && summons.size > 0) {
                        debugLogEngine.log('SkillEffectProcessor', `[${unit.instanceName}]의 [소환술 특화] 발동! 소환수 ${summons.size}기 강화 시작.`);

                        // 각 소환수 ID에 대해 실제 유닛 객체를 찾아 스탯을 강화합니다.
                        summons.forEach(summonId => {
                            const summonUnit = this.battleSimulator.turnQueue.find(u => u.uniqueId === summonId);
                            if (summonUnit && summonUnit.currentHp > 0) {
                                // 1. 모든 기본 스탯을 5%씩 증가시킵니다.
                                for (const stat in summonUnit.baseStats) {
                                    if (typeof summonUnit.baseStats[stat] === 'number') {
                                        summonUnit.baseStats[stat] *= 1.05;
                                    }
                                }
                                // 2. StatEngine을 사용하여 finalStats를 다시 계산합니다.
                                summonUnit.finalStats = statEngine.calculateStats(summonUnit, summonUnit.baseStats);

                                // 3. 시각 효과(VFX)를 표시하여 강화되었음을 알립니다.
                                this.vfxManager.showEffectName(summonUnit.sprite, '유닛 강화!', '#f59e0b');
                            }
                        });
                    }
                } else if (spec.effect) {
                    // 메카닉 외 다른 클래스의 일반적인 특화 효과 적용
                    statusEffectManager.addEffect(unit, { name: `특화 보너스: ${spec.tag}`, effect: spec.effect }, unit);
                }
                debugLogEngine.log('SkillEffectProcessor', `${unit.instanceName}가 특화 태그 [${spec.tag}] 보너스 획득!`);
            }
        });

        if (unit.attributeSpec && skill.tags.includes(unit.attributeSpec.tag)) {
            statusEffectManager.addEffect(unit, { name: `속성 특화: ${unit.attributeSpec.tag}`, effect: unit.attributeSpec.effect }, unit);
            debugLogEngine.log('SkillEffectProcessor', `${unit.instanceName}가 속성 특화 태그 [${unit.attributeSpec.tag}] 보너스 획득!`);
        }
    }
    
    _applyStatusEffects(unit, target, skill, blackboard) {
        // 이미 쓰러진 대상에게는 상태 효과를 적용하지 않습니다.
        if (target.currentHp <= 0) {
            debugLogEngine.log(
                'SkillEffectProcessor',
                `[${target.instanceName}]은(는) 이미 쓰러져서 상태 효과를 적용할 수 없습니다.`
            );
            return;
        }

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
    
        // --- ▼ [신규] '팔라딘의 인도' 패시브 로직 추가 ▼ ---
        let finalEffect = skill.effect;
        if (unit.classPassive?.id === 'paladinsGuide' && skill.tags?.includes(SKILL_TAGS.AURA) && finalEffect?.modifiers) {
            // 원본 effect 객체를 변경하지 않기 위해 깊은 복사를 수행합니다.
            finalEffect = JSON.parse(JSON.stringify(skill.effect));

            const applyBonus = modifier => {
                if (typeof modifier.value === 'number') {
                    modifier.value *= 1.2;
                }
            };

            if (Array.isArray(finalEffect.modifiers)) {
                finalEffect.modifiers.forEach(applyBonus);
            } else {
                applyBonus(finalEffect.modifiers);
            }
            debugLogEngine.log(this.constructor.name, `[팔라딘의 인도] 패시브 발동! [${skill.name}] 스킬 효과 20% 증가.`);
            this.vfxManager.showEffectName(unit.sprite, '팔라딘의 인도', '#f0e68c');
        }
        // --- ▲ [신규] '팔라딘의 인도' 패시브 로직 추가 ▲ ---

        baseTargets.forEach(currentTarget => {
            const roll = Math.random();
            if (finalEffect.chance === undefined || roll < finalEffect.chance) {
                statusEffectManager.addEffect(currentTarget, { ...skill, effect: finalEffect }, unit);
            } else {
                debugLogEngine.log('SkillEffectProcessor', `[${skill.name}]의 효과 발동 실패 (확률: ${finalEffect.chance}, 주사위: ${roll.toFixed(2)})`);
            }
        });
    }
}

export default SkillEffectProcessor;
