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

class UseSkillNode extends Node {
    constructor({ vfxManager, animationEngine, delayEngine, terminationManager, summoningEngine, skillEngine: se } = {}) {
        super();
        this.vfxManager = vfxManager;
        this.animationEngine = animationEngine;
        this.delayEngine = delayEngine;
        this.terminationManager = terminationManager;
        this.summoningEngine = summoningEngine;
        this.skillEngine = se || skillEngine;
        this.combatEngine = combatCalculationEngine;
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
                const damage = this.combatEngine.calculateDamage(
                    unit,
                    skillTarget,
                    baseSkillData,
                    instanceId,
                    instanceData.grade
                );
                skillTarget.currentHp -= damage;

                this.vfxManager.createBloodSplatter(skillTarget.sprite.x, skillTarget.sprite.y);
                this.vfxManager.createDamageNumber(skillTarget.sprite.x, skillTarget.sprite.y, damage);

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

        // ✨ AID 타입 스킬 처리 - 회복 및 디버프 제거
        if (modifiedSkill.type === 'AID') {
            const healAmount = Math.round(unit.finalStats.wisdom * (modifiedSkill.healMultiplier || 0));
            skillTarget.currentHp = Math.min(skillTarget.finalStats.hp, skillTarget.currentHp + healAmount);
            this.vfxManager.createDamageNumber(skillTarget.sprite.x, skillTarget.sprite.y, `+${healAmount}`, '#22c55e');
            if (modifiedSkill.removesDebuff && Math.random() < modifiedSkill.removesDebuff.chance) {
                statusEffectManager.removeOneDebuff(skillTarget);
            }
        }

        if (modifiedSkill.effect) {
            statusEffectManager.addEffect(skillTarget, modifiedSkill);
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
