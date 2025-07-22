import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import IsTargetValidNode from '../nodes/IsTargetValidNode.js';
import FindLowestHealthEnemyNode from '../nodes/FindLowestHealthEnemyNode.js';
import IsTargetInRangeNode from '../nodes/IsTargetInRangeNode.js';
import AttackTargetNode from '../nodes/AttackTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import IsTargetTooCloseNode from '../nodes/IsTargetTooCloseNode.js';
import FindKitingPositionNode from '../nodes/FindKitingPositionNode.js';
import SuccessNode from '../nodes/SuccessNode.js';

/**
 * 원거리 유닛(거너)을 위한 카이팅 행동 트리를 생성합니다.
 * 행동 로직:
 * 1. 생존: 적이 너무 가까우면 뒤로 물러난다.
 * 2. 타겟팅: 체력이 가장 낮은 적을 노린다.
 * 3. 공격: 사거리 내에 있으면 공격, 아니면 접근 후 공격.
 * @param {object} engines - AI 노드들이 사용할 엔진 및 매니저 모음
 * @returns {BehaviorTree}
 */
function createRangedAI(engines) {
    const rootNode = new SequenceNode([
        // 단계 1: 유효한 타겟 설정 (체력이 가장 낮은 적 우선)
        new SelectorNode([
            new IsTargetValidNode(),
            new FindLowestHealthEnemyNode(engines),
        ]),
        // 단계 2: 상황에 따른 행동 결정
        new SelectorNode([
            // 2a. (최우선) 생존: 적이 너무 가까우면 카이팅 위치로 이동
            new SequenceNode([
                new IsTargetTooCloseNode({ dangerZone: 1 }),
                new FindKitingPositionNode(engines),
                new MoveToTargetNode(engines),
            ]),
            // 2b. 공격: 사거리 내에 있으면 즉시 공격
            new SequenceNode([
                new IsTargetInRangeNode(),
                new AttackTargetNode(engines),
            ]),
            // 2c. 이동 후 공격: 사거리 밖이면 적절한 위치로 이동 후 공격
            new SequenceNode([
                new FindPathToTargetNode(engines),
                new MoveToTargetNode(engines),
                new SelectorNode([
                    new SequenceNode([
                        new IsTargetInRangeNode(),
                        new AttackTargetNode(engines),
                    ]),
                    new SuccessNode(),
                ]),
            ]),
            // 2d. 어떤 행동도 할 수 없을 때
            new SuccessNode(),
        ]),
    ]);

    return new BehaviorTree(rootNode);
}

export { createRangedAI };
