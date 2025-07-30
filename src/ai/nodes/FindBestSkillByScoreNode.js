import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { ownedSkillsManager } from '../../game/utils/OwnedSkillsManager.js';
import { skillInventoryManager } from '../../game/utils/SkillInventoryManager.js';
import { skillEngine } from '../../game/utils/SkillEngine.js';
import { skillScoreEngine } from '../../game/utils/SkillScoreEngine.js';

/**
 * 사용 가능한 스킬 중 SkillScoreEngine으로 계산된 점수가 가장 높은 스킬을 찾는 노드
 */
class FindBestSkillByScoreNode extends Node {
    constructor(engines = {}) {
        super();
        this.skillEngine = engines.skillEngine || skillEngine;
        this.skillScoreEngine = engines.skillScoreEngine || skillScoreEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);

        const target = blackboard.get('skillTarget');
        const equippedSkillInstances = ownedSkillsManager.getEquippedSkills(unit.uniqueId);
        const usedSkills = blackboard.get('usedSkillsThisTurn') || new Set();
        const allies = blackboard.get('allyUnits') || [];
        const enemies = blackboard.get('enemyUnits') || [];

        let bestSkill = null;
        let maxScore = -Infinity;

        const availableSkills = [];
        for (const instanceId of equippedSkillInstances) {
            if (!instanceId || usedSkills.has(instanceId)) continue;
            const instData = skillInventoryManager.getInstanceData(instanceId);
            const skillData = skillInventoryManager.getSkillData(instData.skillId, instData.grade);
            if (this.skillEngine.canUseSkill(unit, skillData)) {
                availableSkills.push({ skillData, instanceId });
            }
        }

        const scores = await Promise.all(
            availableSkills.map(s => this.skillScoreEngine.calculateScore(unit, s.skillData, target, allies, enemies))
        );

        for (let i = 0; i < availableSkills.length; i++) {
            const currentScore = scores[i];
            if (currentScore > maxScore) {
                maxScore = currentScore;
                bestSkill = availableSkills[i];
            }
        }

        if (bestSkill) {
            blackboard.set('currentTargetSkill', bestSkill);
            blackboard.set('currentSkillData', bestSkill.skillData);
            blackboard.set('currentSkillInstanceId', bestSkill.instanceId);
            debugAIManager.logNodeResult(NodeState.SUCCESS, `최고점 스킬 [${bestSkill.skillData.name}] 찾음 (점수: ${maxScore})`);
            return NodeState.SUCCESS;
        }

        blackboard.set('currentTargetSkill', null);
        debugAIManager.logNodeResult(NodeState.FAILURE, '사용 가능한 스킬 없음');
        return NodeState.FAILURE;
    }
}

export default FindBestSkillByScoreNode;
