import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import MoveToTargetNode from './MoveToTargetNode.js';

class MoveToUseSkillNode extends Node {
    constructor(engines = {}) {
        super();
        this.moveNode = new MoveToTargetNode(engines);
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const path = blackboard.get('movementPath');
        const skill = blackboard.get('currentSkillData');

        if (!path || path.length === 0) {
            debugAIManager.logNodeResult(NodeState.SUCCESS, '이동 필요 없음');
            return NodeState.SUCCESS;
        }

        const result = await this.moveNode.evaluate(unit, blackboard);

        if (result === NodeState.SUCCESS) {
            debugAIManager.logNodeResult(
                NodeState.SUCCESS,
                `스킬 [${skill?.name}] 사용 위치로 이동 완료`
            );
        } else {
            debugAIManager.logNodeResult(NodeState.FAILURE, '경로 이동 실패');
        }

        return result;
    }
}

export default MoveToUseSkillNode;

