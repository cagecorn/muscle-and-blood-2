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
        // 기본 대상은 현재 AI가 노리고 있는 유닛으로 설정
        let skillTarget = blackboard.get('currentTargetUnit');
        const skillInfo = blackboard.get('currentTargetSkill');

        if (!skillInfo) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '스킬 정보 없음');
            return NodeState.FAILURE;
        }

        const { skillData, instanceId } = skillInfo;

        // 스킬의 targetType에 따라 대상 결정. 기본값은 전달된 대상 유지
        if (skillData.targetType === 'self') {
            skillTarget = unit;
        }

        if (!skillTarget) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '스킬 대상 없음');
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

        blackboard.set('currentTargetSkill', null);

        await this.delayEngine.hold(500);

        debugAIManager.logNodeResult(NodeState.SUCCESS);
        return NodeState.SUCCESS;
    }
}
export default UseSkillNode;
