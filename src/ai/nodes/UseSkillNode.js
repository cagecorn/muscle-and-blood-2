import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { skillEngine, SKILL_TYPES } from '../../game/utils/SkillEngine.js';
import { statusEffectManager } from '../../game/utils/StatusEffectManager.js';
import { spriteEngine } from '../../game/utils/SpriteEngine.js';

class UseSkillNode extends Node {
    constructor({ vfxManager, animationEngine, delayEngine, terminationManager, skillEngine: se } = {}) {
        super();
        this.vfxManager = vfxManager;
        this.animationEngine = animationEngine;
        this.delayEngine = delayEngine;
        this.skillEngine = se || skillEngine;
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

        // 스킬 이름 표시
        const skillColor = SKILL_TYPES[skillData.type].color;
        this.vfxManager.showSkillName(unit.sprite, skillData.name, skillColor);

        if (skillData.type === 'BUFF' || skillData.type === 'DEBUFF') {
            spriteEngine.changeSpriteForDuration(unit, 'cast', 600);
        } else {
            await this.animationEngine.attack(unit.sprite, skillTarget.sprite);
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
