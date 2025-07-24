import Node, { NodeState } from './Node.js';
import { tokenEngine } from '../../game/utils/TokenEngine.js';

/**
 * 자식 노드를 반복 실행하는 데코레이터 노드입니다.
 * 토큰이 남아있는 한 계속해서 행동을 시도하여 한 턴에 여러 번의 행동을 가능하게 합니다.
 */
class RepeaterNode extends Node {
    constructor(child) {
        super();
        this.child = child;
    }

    async evaluate(unit, blackboard) {
        let hasSucceededOnce = false;
        const maxActions = 10; // 무한 루프 방지를 위한 안전장치

        for (let i = 0; i < maxActions; i++) {
            // 행동에 필요한 토큰이 없으면 반복을 중단합니다.
            if (tokenEngine.getTokens(unit.uniqueId) <= 0) {
                break;
            }

            const result = await this.child.evaluate(unit, blackboard);

            // 자식 노드가 실패했다는 것은 더 이상 할 수 있는 행동이 없다는 의미이므로 반복을 중단합니다.
            if (result === NodeState.FAILURE) {
                break;
            }

            hasSucceededOnce = true;

            // 다음 행동 평가에 영향을 줄 수 있는 블랙보드 데이터를 초기화합니다.
            blackboard.set('movementPath', null);
            blackboard.set('currentTargetSkill', null);
        }

        // 한 번이라도 행동에 성공했다면 전체를 성공으로 간주합니다.
        return hasSucceededOnce ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}
export default RepeaterNode;
