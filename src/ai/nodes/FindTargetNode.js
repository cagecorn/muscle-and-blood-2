import Node, { NodeState } from './Node.js';
import { debugLogEngine } from '../../game/utils/DebugLogEngine.js';

/**
 * 전장에 있는 적들 중에서 가장 가까운 적을 찾아 블랙보드에 저장합니다.
 */
class FindTargetNode extends Node {
    async evaluate(unit, blackboard) {
        const enemyUnits = blackboard.get('enemyUnits');
        if (!enemyUnits || enemyUnits.length === 0) {
            debugLogEngine.log('FindTargetNode', '타겟을 찾을 수 없음: 적이 없습니다.');
            return NodeState.FAILURE;
        }

        let nearestEnemy = null;
        let minDistance = Infinity;
        const unitPos = { x: unit.gridX, y: unit.gridY };

        for (const enemy of enemyUnits) {
            const enemyPos = { x: enemy.gridX, y: enemy.gridY };
            const distance = Math.abs(unitPos.x - enemyPos.x) + Math.abs(unitPos.y - enemyPos.y);
            if (distance < minDistance) {
                minDistance = distance;
                nearestEnemy = enemy;
            }
        }

        if (nearestEnemy) {
            blackboard.set('currentTargetUnit', nearestEnemy);
            debugLogEngine.log('FindTargetNode', `${unit.instanceName}: 가장 가까운 타겟 설정 -> ${nearestEnemy.instanceName}`);
            return NodeState.SUCCESS;
        }

        return NodeState.FAILURE;
    }
}

export default FindTargetNode;
