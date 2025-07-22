import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

class FindPathToTargetNode extends Node {
    constructor({ pathfinderEngine }) {
        super();
        this.pathfinderEngine = pathfinderEngine;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const target = blackboard.get('currentTargetUnit');
        if (!target) {
            debugAIManager.logNodeResult(NodeState.FAILURE);
            return NodeState.FAILURE;
        }

        const start = { col: unit.gridX, row: unit.gridY };
        const end = { col: target.gridX, row: target.gridY };
        const path = this.pathfinderEngine.findPath(start, end);

        if (path && path.length > 0) {
            // 경로의 마지막 단계(적의 위치)를 제외하여 바로 앞까지만 이동하도록 설정
            const movementPath = path.slice(0, path.length - 1);

            // 최종 경로가 없으면(이미 인접해 있으면) 이동할 필요가 없으므로 실패 처리
            if (movementPath.length === 0) {
                debugAIManager.logNodeResult(NodeState.FAILURE);
                return NodeState.FAILURE;
            }

            blackboard.set('movementPath', movementPath);
            debugAIManager.logNodeResult(NodeState.SUCCESS);
            return NodeState.SUCCESS;
        }
        
        debugAIManager.logNodeResult(NodeState.FAILURE);
        return NodeState.FAILURE;
    }
}
export default FindPathToTargetNode;
