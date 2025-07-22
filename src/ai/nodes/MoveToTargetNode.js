import Node, { NodeState } from './Node.js';
import { debugLogEngine } from '../../game/utils/DebugLogEngine.js';

/**
 * 타겟을 향해 한 칸 이동하는 행동 노드입니다.
 * (Pathfinding은 구현되지 않았으므로, 직선으로 다가가는 로직으로 단순화합니다.)
 */
class MoveToTargetNode extends Node {
    async evaluate(unit, blackboard) {
        const target = blackboard.get('currentTargetUnit');
        if (!target) {
            return NodeState.FAILURE;
        }

        const unitPos = { x: unit.gridX, y: unit.gridY };
        const targetPos = { x: target.gridX, y: target.gridY };

        const dx = targetPos.x - unitPos.x;
        const dy = targetPos.y - unitPos.y;

        if (Math.abs(dx) > Math.abs(dy)) {
            unit.gridX += Math.sign(dx);
        } else {
            unit.gridY += Math.sign(dy);
        }

        debugLogEngine.log('MoveToTargetNode', `${unit.instanceName}이(가) 타겟을 향해 이동 -> 새로운 위치: (${unit.gridX}, ${unit.gridY})`);

        return NodeState.SUCCESS;
    }
}

export default MoveToTargetNode;
