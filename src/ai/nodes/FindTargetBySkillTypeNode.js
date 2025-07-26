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
        const enemyUnits = blackboard.get('enemyUnits')?.filter(e => e.currentHp > 0);
        const allUnits = blackboard.get('allUnits');
        const alliedUnits = allUnits?.filter(u => u.team === unit.team && u.currentHp > 0);

        if (!skillData) {
            debugAIManager.logNodeResult(NodeState.FAILURE, "스킬 데이터 없음");
            return NodeState.FAILURE;
        }

        // ✨ [수정] 스킬의 targetType을 먼저 확인하여 'self'인 경우 자신을 즉시 타겟으로 설정합니다.
        if (skillData.targetType === 'self') {
            blackboard.set('skillTarget', unit);
            debugAIManager.logNodeResult(NodeState.SUCCESS, `스킬 [${skillData.name}]의 대상 (자신) 설정`);
            return NodeState.SUCCESS;
        }

        let target = null;
        switch (skillData.type) {
            case 'ACTIVE':
                if (!enemyUnits || enemyUnits.length === 0) {
                    debugAIManager.logNodeResult(NodeState.FAILURE, "적 유닛 없음");
                    return NodeState.FAILURE;
                }
                const skillRange = skillData.range || unit.finalStats.attackRange || 1;
                const inRangeEnemies = enemyUnits.filter(e =>
                    Math.abs(unit.gridX - e.gridX) + Math.abs(unit.gridY - e.gridY) <= skillRange
                );

                if (inRangeEnemies.length > 0) {
                    target = inRangeEnemies.sort((a, b) => a.currentHp - b.currentHp)[0];
                } else {
                    target = this.targetManager.findNearestEnemy(unit, enemyUnits);
                }
                break;
            case 'DEBUFF':
                if (!enemyUnits || enemyUnits.length === 0) {
                    debugAIManager.logNodeResult(NodeState.FAILURE, "적 유닛 없음");
                    return NodeState.FAILURE;
                }
                target = this.targetManager.findHighestHealthEnemy(enemyUnits);
                break;
            // ✨ [수정] 'BUFF' 타입을 별도로 처리하고, 'self'가 아닌 경우에만 아군을 찾도록 남겨둡니다.
            case 'BUFF':
            case 'AID':
                if (!alliedUnits || alliedUnits.length === 0) {
                    debugAIManager.logNodeResult(NodeState.FAILURE, "아군 유닛 없음");
                    return NodeState.FAILURE;
                }
                // 체력 비율이 가장 낮은 아군을 찾습니다 (자신 포함).
                target = [...alliedUnits].sort((a, b) => {
                    const healthRatioA = a.currentHp / a.finalStats.hp;
                    const healthRatioB = b.currentHp / b.finalStats.hp;
                    return healthRatioA - healthRatioB;
                })[0];
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
