import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

/**
 * 용병의 MBTI 성향에 따라 확률적으로 SUCCESS 또는 FAILURE를 반환하는 노드
 */
class MBTIActionNode extends Node {
    /**
     * @param {string} trait - 확인할 MBTI 특성 (E, I, S, N, T, F, J, P)
     */
    constructor(trait) {
        super();
        this.trait = trait.toUpperCase();
    }

    async evaluate(unit, blackboard) {
        const nodeName = `MBTIActionNode (${this.trait})`;
        debugAIManager.logNodeEvaluation({ constructor: { name: nodeName } }, unit);

        if (!unit.mbti || unit.mbti[this.trait] === undefined) {
            debugAIManager.logNodeResult(NodeState.FAILURE, `MBTI 정보 없음: ${this.trait}`);
            return NodeState.FAILURE;
        }

        const score = unit.mbti[this.trait];
        const roll = Math.random() * 100;
        if (roll <= score) {
            debugAIManager.logNodeResult(NodeState.SUCCESS, `성공 (score: ${score}, roll: ${roll.toFixed(2)})`);
            return NodeState.SUCCESS;
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, `실패 (score: ${score}, roll: ${roll.toFixed(2)})`);
        return NodeState.FAILURE;
    }
}

export default MBTIActionNode;
