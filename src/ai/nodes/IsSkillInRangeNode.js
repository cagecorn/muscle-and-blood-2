import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

class IsSkillInRangeNode extends Node {
    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const target = blackboard.get('currentTargetUnit');
        const skillInfo = blackboard.get('currentTargetSkill');

        if (!target || !skillInfo) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '타겟 또는 스킬 정보 없음');
            return NodeState.FAILURE;
        }

        const skillData = skillInfo.skillData;
        const attackRange = skillData.range || unit.finalStats.attackRange || 1;
        const distance = Math.abs(unit.gridX - target.gridX) + Math.abs(unit.gridY - target.gridY);

        if (distance <= attackRange) {
            debugAIManager.logNodeResult(NodeState.SUCCESS, `스킬 [${skillData.name}] 사거리 내`);
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, `스킬 [${skillData.name}] 사거리 밖`);
        return NodeState.FAILURE;
    }
}
export default IsSkillInRangeNode;
