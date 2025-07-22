import Node, { NodeState } from './Node.js';
import { debugLogEngine } from '../../game/utils/DebugLogEngine.js';

/**
 * 블랙보드에 저장된 타겟이 공격 사거리 내에 있는지 확인하는 조건 노드입니다.
 */
class IsTargetInRangeNode extends Node {
    async evaluate(unit, blackboard) {
        const target = blackboard.get('currentTargetUnit');
        if (!target) {
            return NodeState.FAILURE;
        }

        const attackRange = 1;
        const unitPos = { x: unit.gridX, y: unit.gridY };
        const targetPos = { x: target.gridX, y: target.gridY };
        const distance = Math.abs(unitPos.x - targetPos.x) + Math.abs(unitPos.y - targetPos.y);

        if (distance <= attackRange) {
            blackboard.set('isTargetInAttackRange', true);
            debugLogEngine.log('IsTargetInRangeNode', `${unit.instanceName}: 타겟(${target.instanceName})이 사거리 내에 있습니다.`);
            return NodeState.SUCCESS;
        } else {
            blackboard.set('isTargetInAttackRange', false);
            debugLogEngine.log('IsTargetInRangeNode', `${unit.instanceName}: 타겟(${target.instanceName})이 사거리 밖에 있습니다.`);
            return NodeState.FAILURE;
        }
    }
}

export default IsTargetInRangeNode;
