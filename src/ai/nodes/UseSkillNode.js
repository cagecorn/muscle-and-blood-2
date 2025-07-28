import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { skillEngine, SKILL_TYPES } from '../../game/utils/SkillEngine.js';
import { statusEffectManager } from '../../game/utils/StatusEffectManager.js';
import { spriteEngine } from '../../game/utils/SpriteEngine.js';
import { combatCalculationEngine } from '../../game/utils/CombatCalculationEngine.js';
import { formationEngine } from '../../game/utils/FormationEngine.js';
import { skillInventoryManager } from '../../game/utils/SkillInventoryManager.js';
import { ownedSkillsManager } from '../../game/utils/OwnedSkillsManager.js';
import { skillModifierEngine } from '../../game/utils/SkillModifierEngine.js';
import { tokenEngine } from '../../game/utils/TokenEngine.js';
import { debugSkillExecutionManager } from '../../game/debug/DebugSkillExecutionManager.js';
import { sharedResourceEngine } from '../../game/utils/SharedResourceEngine.js';
import { debugLogEngine } from '../../game/utils/DebugLogEngine.js';
// ✨ 1. 새로 만든 BattleTagManager를 import 합니다.
import { battleTagManager } from '../../game/utils/BattleTagManager.js';
import { turnOrderManager } from '../../game/utils/TurnOrderManager.js';

class UseSkillNode extends Node {
    constructor({ vfxManager, animationEngine, delayEngine, terminationManager, summoningEngine, skillEngine: se, battleSimulator } = {}) {
        super();
        this.vfxManager = vfxManager;
        this.animationEngine = animationEngine;
        this.delayEngine = delayEngine;
        this.terminationManager = terminationManager;
        this.summoningEngine = summoningEngine;
        this.skillEngine = se || skillEngine;
        this.combatEngine = combatCalculationEngine;
        this.battleSimulator = battleSimulator;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const skillTarget = blackboard.get('skillTarget');
        const instanceId = blackboard.get('currentSkillInstanceId');

        if (!instanceId || !skillTarget) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '스킬 인스턴스 또는 대상 없음');
            return NodeState.FAILURE;
        }

        const instanceData = skillInventoryManager.getInstanceData(instanceId);
        const baseSkillData = skillInventoryManager.getSkillData(instanceData.skillId, instanceData.grade);

        const equippedSkills = ownedSkillsManager.getEquippedSkills(unit.uniqueId);
        const rank = equippedSkills.indexOf(instanceId) + 1;
        const modifiedSkill = skillModifierEngine.getModifiedSkill(baseSkillData, rank, instanceData.grade);
        if (!modifiedSkill) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '스킬 데이터 처리 오류');
            return NodeState.FAILURE;
        }

        debugSkillExecutionManager.logSkillExecution(unit, baseSkillData, modifiedSkill, rank, instanceData.grade);

        if (!this.skillEngine.canUseSkill(unit, modifiedSkill)) {
            debugAIManager.logNodeResult(NodeState.FAILURE, `스킬 [${modifiedSkill.name}] 사용 조건 미충족`);
            return NodeState.FAILURE;
        }

        // ✨ 2. 스킬 사용이 확정된 이 시점에 BattleTagManager에 정보를 기록합니다.
        battleTagManager.recordSkillUse(unit, skillTarget, modifiedSkill);

        if (modifiedSkill.resourceCost) {
            sharedResourceEngine.spendResource(modifiedSkill.resourceCost.type, modifiedSkill.resourceCost.amount);
            debugLogEngine.log('UseSkillNode', `[${modifiedSkill.resourceCost.type}] ${modifiedSkill.resourceCost.amount} 소모`);
        }

        this.skillEngine.recordSkillUse(unit, modifiedSkill); // 보정된 데이터로 기록

        const usedSkills = blackboard.get('usedSkillsThisTurn') || new Set();
        usedSkills.add(instanceId);
        blackboard.set('usedSkillsThisTurn', usedSkills);

        const skillColor = SKILL_TYPES[modifiedSkill.type].color;
        this.vfxManager.showSkillName(unit.sprite, modifiedSkill.name, skillColor);

        // 스킬 애니메이션 및 효과 적용 로직
        if (modifiedSkill.type === 'ACTIVE' || modifiedSkill.type === 'DEBUFF') {
            // ✨ 1. 공격 스프라이트로 변경
            spriteEngine.changeSpriteForDuration(unit, 'attack', 600);
            await this.animationEngine.attack(unit.sprite, skillTarget.sprite);

            // ✨ 2. 피격 스프라이트로 변경
            spriteEngine.changeSpriteForDuration(skillTarget, 'hitted', 300);

            if (modifiedSkill.type === 'ACTIVE') {
                const totalDamage = this.combatEngine.calculateDamage(
                    unit,
                    skillTarget,
                    baseSkillData,
                    instanceId,
                    instanceData.grade
                );

                // ✨ 배리어 및 체력 데미지 분배 로직
                const damageToBarrier = Math.min(skillTarget.currentBarrier, totalDamage);
                const damageToHp = totalDamage - damageToBarrier;

                if (damageToBarrier > 0) {
                    skillTarget.currentBarrier -= damageToBarrier;
                    this.vfxManager.createDamageNumber(
                        skillTarget.sprite.x,
                        skillTarget.sprite.y - 10,
                        damageToBarrier,
                        '#ffd700'
                    );
                }
                if (damageToHp > 0) {
                    skillTarget.currentHp -= damageToHp;
                    this.vfxManager.createDamageNumber(
                        skillTarget.sprite.x,
                        skillTarget.sprite.y + 10,
                        damageToHp,
                        '#ff4d4d'
                    );
                }

                this.vfxManager.createBloodSplatter(skillTarget.sprite.x, skillTarget.sprite.y);

                // 토큰 생성 효과 처리
                if (modifiedSkill.generatesToken) {
                    if (Math.random() < modifiedSkill.generatesToken.chance) {
                        tokenEngine.addTokens(
                            unit.uniqueId,
                            modifiedSkill.generatesToken.amount,
                            `${modifiedSkill.name} 효과`
                        );
                    }
                }

                if (modifiedSkill.turnOrderEffect === 'pushToBack' && this.battleSimulator) {
                    this.battleSimulator.turnQueue = turnOrderManager.pushToBack(this.battleSimulator.turnQueue, skillTarget);
                }

                // ✨ 넉백(push) 효과 처리
                if (modifiedSkill.push && modifiedSkill.push > 0) {
                    await formationEngine.pushUnit(skillTarget, unit, modifiedSkill.push, this.animationEngine);
                }

                if (skillTarget.currentHp <= 0) {
                    this.terminationManager.handleUnitDeath(skillTarget);
                }
            }
        } else if (modifiedSkill.type === 'SUMMON') {
            spriteEngine.changeSpriteForDuration(unit, 'cast', 600);
            this.summoningEngine.summon(unit, modifiedSkill);
        } else {
            // ✨ 3. 캐스트 스프라이트 변경 (기존 로직 유지)
            spriteEngine.changeSpriteForDuration(unit, 'cast', 600);
        }

        // ✨ AID 타입 스킬 처리 - 회복 및 디버프 제거 (치료 금지 체크)
        if (modifiedSkill.type === 'AID') {
            if (skillTarget.isHealingProhibited) {
                debugLogEngine.log('UseSkillNode', `${skillTarget.instanceName}은(는) 치료 금지 상태라 회복 불가!`);
            } else {
                const healAmount = Math.round(unit.finalStats.wisdom * (modifiedSkill.healMultiplier || 0));
                skillTarget.currentHp = Math.min(skillTarget.finalStats.hp, skillTarget.currentHp + healAmount);
                this.vfxManager.createDamageNumber(skillTarget.sprite.x, skillTarget.sprite.y, `+${healAmount}`, '#22c55e');
                if (modifiedSkill.removesDebuff && Math.random() < modifiedSkill.removesDebuff.chance) {
                    statusEffectManager.removeOneDebuff(skillTarget);
                }
            }
        }

        if (modifiedSkill.generatesResource) {
            sharedResourceEngine.addResource(modifiedSkill.generatesResource.type, modifiedSkill.generatesResource.amount);
            debugLogEngine.log('UseSkillNode', `[${modifiedSkill.generatesResource.type}] ${modifiedSkill.generatesResource.amount} 생산`);
        }

        if (modifiedSkill.effect) {
            const targets = [skillTarget];
            if (modifiedSkill.numberOfTargets && modifiedSkill.numberOfTargets > 1) {
                const enemyUnits = blackboard.get('enemyUnits')?.filter(e => e.currentHp > 0 && e.uniqueId !== skillTarget.uniqueId) || [];
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
                        if (secondTarget) targets.push(secondTarget);
                    }
                }
            }

            targets.forEach(target => {
                const roll = Math.random();
                if (modifiedSkill.effect.chance === undefined || roll < modifiedSkill.effect.chance) {
                    statusEffectManager.addEffect(target, modifiedSkill);
                } else {
                    debugLogEngine.log('UseSkillNode', `[${modifiedSkill.name}]의 효과 발동 실패 (확률: ${modifiedSkill.effect.chance}, 주사위: ${roll.toFixed(2)})`);
                }
            });
        }

        console.log(`[AI] ${unit.instanceName}이(가) ${skillTarget.instanceName}에게 스킬 [${modifiedSkill.name}] 사용!`);

        blackboard.set('currentSkillData', null);
        blackboard.set('currentSkillInstanceId', null);
        blackboard.set('skillTarget', null);

        await this.delayEngine.hold(500);

        debugAIManager.logNodeResult(NodeState.SUCCESS);
        return NodeState.SUCCESS;
    }
}
export default UseSkillNode;
