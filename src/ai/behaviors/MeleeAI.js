import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import FindTargetNode from '../nodes/FindTargetNode.js';
import IsTargetInRangeNode from '../nodes/IsTargetInRangeNode.js';
import AttackTargetNode from '../nodes/AttackTargetNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';
import IsTargetValidNode from '../nodes/IsTargetValidNode.js';
import SuccessNode from '../nodes/SuccessNode.js';

/**
 * 근접 유닛을 위한 범용 행동 트리를 생성합니다.
 * 행동 로직:
 * 1. 대상 확보: 유효한 타겟이 있는가? 없다면 새로 찾는다.
 * 2. 행동 실행: 확보된 타겟에 대해, 공격 또는 이동을 실행한다.
 * @param {object} engines - AI 노드들이 사용할 엔진 및 매니저 모음
 * @returns {BehaviorTree}
 */
function createMeleeAI(engines) {
    const rootNode = new SequenceNode([
        // 단계 1: 타겟 확보 (현재 타겟이 유효한지 먼저 검사하고, 없으면 탐색)
        new SelectorNode([
            new IsTargetValidNode(),
            new FindTargetNode(engines),
        ]),
        // 단계 2: 확보된 타겟에 대해 행동 결정
        new SelectorNode([
            // 2a. 사거리 내라면 즉시 공격
            new SequenceNode([
                new IsTargetInRangeNode(),
                new AttackTargetNode(engines),
            ]),
            // 2b. 사거리 밖이라면 이동 후 다시 공격 시도
            new SequenceNode([
                new FindPathToTargetNode(engines),
                new MoveToTargetNode(engines),
                new SelectorNode([
                    new SequenceNode([
                        new IsTargetInRangeNode(),
                        new AttackTargetNode(engines),
                    ]),
                    // 공격 사거리 밖인 경우에도 턴은 성공적으로 종료
                    new SuccessNode(),
                ]),
            ]),
        ]),
    ]);

    return new BehaviorTree(rootNode);
}

export { createMeleeAI };
