import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { skillEngine } from '../../game/utils/SkillEngine.js';
import { statusEffectManager } from '../../game/utils/StatusEffectManager.js';

class UseSkillNode extends Node {
    constructor({ vfxManager, animationEngine, delayEngine, terminationManager, skillEngine: se } = {}) {
        super();
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

        if (skillData.targetType === 'self') {
            // 자신에게 사용하는 모션이 존재한다면 여기서 처리 가능
            // await this.animationEngine.cast(unit.sprite);
        } else {
            await this.animationEngine.attack(unit.sprite, skillTarget.sprite);
        }

        if (skillData.effect) {
            statusEffectManager.addEffect(skillTarget, skillData);
        }

        console.log(`[AI] ${unit.instanceName}이(가) ${skillTarget.instanceName}에게 스킬 [${skillData.name}] 사용!`);

        blackboard.set('currentTargetSkill', null);

        await this.delayEngine.hold(200);

        debugAIManager.logNodeResult(NodeState.SUCCESS);
        return NodeState.SUCCESS;
    }
}
export default UseSkillNode;
