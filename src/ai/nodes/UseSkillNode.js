import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { skillEngine } from '../../game/utils/SkillEngine.js';

class UseSkillNode extends Node {
    constructor({ vfxManager, animationEngine, delayEngine, terminationManager, skillEngine: se } = {}) {
        super();
        this.animationEngine = animationEngine;
        this.delayEngine = delayEngine;
        this.skillEngine = se || skillEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const target = blackboard.get('currentTargetUnit');
        const skillInfo = blackboard.get('currentTargetSkill');

        if (!target || !skillInfo) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '스킬 대상 또는 스킬 정보 없음');
            return NodeState.FAILURE;
        }

        const { skillData, instanceId } = skillInfo;

        this.skillEngine.recordSkillUse(unit, skillData);

        const usedSkills = blackboard.get('usedSkillsThisTurn') || new Set();
        usedSkills.add(instanceId);
        blackboard.set('usedSkillsThisTurn', usedSkills);

        await this.animationEngine.attack(unit.sprite, target.sprite);

        console.log(`[AI] ${unit.instanceName}이(가) ${target.instanceName}에게 스킬 [${skillData.name}] 사용!`);

        blackboard.set('currentTargetSkill', null);

        await this.delayEngine.hold(200);

        debugAIManager.logNodeResult(NodeState.SUCCESS);
        return NodeState.SUCCESS;
    }
}
export default UseSkillNode;
