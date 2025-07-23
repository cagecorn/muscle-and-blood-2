import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

class FindTargetBySkillTypeNode extends Node {
    constructor({ targetManager }) {
        super();
        this.targetManager = targetManager;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const skillData = blackboard.get('currentSkillData');
        const enemyUnits = blackboard.get('enemyUnits');

        if (!skillData || !enemyUnits || enemyUnits.length === 0) {
            debugAIManager.logNodeResult(NodeState.FAILURE, "스킬 데이터 또는 적 유닛 없음");
            return NodeState.FAILURE;
        }

        let target = null;
        switch (skillData.type) {
            case 'ACTIVE':
                target = this.targetManager.findLowestHealthEnemy(enemyUnits);
                break;
            case 'DEBUFF':
                target = this.targetManager.findHighestHealthEnemy(enemyUnits);
                break;
            case 'BUFF':
                target = unit;
                break;
            default:
                target = this.targetManager.findNearestEnemy(unit, enemyUnits);
                break;
        }

        if (target) {
            blackboard.set('skillTarget', target);
            debugAIManager.logNodeResult(NodeState.SUCCESS, `스킬 [${skillData.name}]의 대상 (${target.instanceName}) 설정`);
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, "스킬 대상을 찾지 못함");
        return NodeState.FAILURE;
    }
}
export default FindTargetBySkillTypeNode;
