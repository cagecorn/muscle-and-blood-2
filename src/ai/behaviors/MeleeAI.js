import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import FindTargetNode from '../nodes/FindTargetNode.js';
import IsTargetInRangeNode from '../nodes/IsTargetInRangeNode.js';
import AttackTargetNode from '../nodes/AttackTargetNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';

/**
 * 근접 유닛을 위한 범용 행동 트리를 생성합니다.
 * 행동 로직:
 * 1. (공격) 타겟이 사거리 내에 있는가? -> 그렇다면 공격한다.
 * 2. (이동) 타겟이 사거리 밖에 있는가? -> 경로를 찾아 이동한다.
 * 3. (탐색) 타겟이 없는가? -> 새로운 타겟을 찾는다.
 * @param {object} engines - AI 노드들이 사용할 엔진 및 매니저 모음
 * @returns {BehaviorTree}
 */
function createMeleeAI(engines) {
    const rootNode = new SelectorNode([
        // 1. 공격 시도 (가장 우선순위가 높음)
        new SequenceNode([
            new IsTargetInRangeNode(),
            new AttackTargetNode(engines), // 엔진 전달
        ]),
        // 2. 이동 시도
        new SequenceNode([
            new FindPathToTargetNode(engines), // 엔진 전달
            new MoveToTargetNode(engines),   // 엔진 전달
        ]),
        // 3. 타겟 탐색
        new FindTargetNode(engines), // 엔진 전달
    ]);

    return new BehaviorTree(rootNode);
}

export { createMeleeAI };
