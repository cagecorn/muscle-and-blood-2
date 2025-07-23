import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { skillEngine, SKILL_TYPES } from '../../game/utils/SkillEngine.js';
import { statusEffectManager } from '../../game/utils/StatusEffectManager.js';
import { spriteEngine } from '../../game/utils/SpriteEngine.js';
// ✨ CombatCalculationEngine import
import { combatCalculationEngine } from '../../game/utils/CombatCalculationEngine.js';

class UseSkillNode extends Node {
    constructor({ vfxManager, animationEngine, delayEngine, terminationManager, skillEngine: se } = {}) {
        super();
        this.vfxManager = vfxManager;
        this.animationEngine = animationEngine;
        this.delayEngine = delayEngine;
        this.skillEngine = se || skillEngine;
        // ✨ combatCalculationEngine 추가
        this.combatEngine = combatCalculationEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const skillTarget = blackboard.get('skillTarget');
        const skillData = blackboard.get('currentSkillData');
        const instanceId = blackboard.get('currentSkillInstanceId');

        if (!skillData || !skillTarget) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '스킬 데이터 또는 대상 없음');
            return NodeState.FAILURE;
        }

        this.skillEngine.recordSkillUse(unit, skillData);

        const usedSkills = blackboard.get('usedSkillsThisTurn') || new Set();
        usedSkills.add(instanceId);
        blackboard.set('usedSkillsThisTurn', usedSkills);

        const skillColor = SKILL_TYPES[skillData.type].color;
        this.vfxManager.showSkillName(unit.sprite, skillData.name, skillColor);

        // ✨ 스킬 애니메이션 및 효과 적용 로직 수정
        if (skillData.type === 'ACTIVE') {
            await this.animationEngine.attack(unit.sprite, skillTarget.sprite);
            const damage = this.combatEngine.calculateDamage(unit, skillTarget, skillData);
            skillTarget.currentHp -= damage;

            this.vfxManager.updateHealthBar(skillTarget.healthBar, skillTarget.currentHp, skillTarget.finalStats.hp);
            this.vfxManager.createBloodSplatter(skillTarget.sprite.x, skillTarget.sprite.y);
            this.vfxManager.createDamageNumber(skillTarget.sprite.x, skillTarget.sprite.y, damage);

            if (skillTarget.currentHp <= 0) {
                this.terminationManager.handleUnitDeath(skillTarget);
            }
        } else {
            if (unit.sprite.scene && !spriteEngine.scene) {
                spriteEngine.setScene(unit.sprite.scene);
            }
            spriteEngine.changeSpriteForDuration(unit, 'cast', 600);
        }

        if (skillData.effect) {
            statusEffectManager.addEffect(skillTarget, skillData);
        }

        console.log(`[AI] ${unit.instanceName}이(가) ${skillTarget.instanceName}에게 스킬 [${skillData.name}] 사용!`);

        blackboard.set('currentSkillData', null);
        blackboard.set('currentSkillInstanceId', null);
        blackboard.set('skillTarget', null);

        await this.delayEngine.hold(500);

        debugAIManager.logNodeResult(NodeState.SUCCESS);
        return NodeState.SUCCESS;
    }
}
export default UseSkillNode;
