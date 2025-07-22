import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import FindTargetNode from '../nodes/FindTargetNode.js';
import IsTargetInRangeNode from '../nodes/IsTargetInRangeNode.js';
import AttackTargetNode from '../nodes/AttackTargetNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';

/**
 * '전사' 타입 유닛을 위한 행동 트리를 생성합니다.
 * 행동 로직:
 * 1. 공격할 대상이 있는가?
 *    - 있다면, 대상이 사거리 내에 있는가?
 *        - (Yes) -> 대상을 공격한다.
 *        - (No)  -> 대상에게 이동한다.
 *    - 없다면, 새로운 대상을 찾는다.
 */
function createWarriorAI() {
    const rootNode = new SelectorNode([
        new SequenceNode([
            new IsTargetInRangeNode(),
            new AttackTargetNode(),
        ]),
        new SequenceNode([
            new MoveToTargetNode(),
        ]),
        new FindTargetNode(),
    ]);

    return new BehaviorTree(rootNode);
}

export { createWarriorAI };
