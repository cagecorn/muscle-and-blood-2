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
 * 수정된 행동 로직:
 * 1. 대상 확보: 유효한 타겟이 있는가? 없다면 새로 찾는다.
 * 2. 행동 실행:
 * - (우선) 현재 위치에서 공격을 시도한다.
 * - (차선) 공격이 안되면, 적에게 이동한 후 다시 공격을 시도한다.
 * - 둘 다 안되면 턴을 마친다.
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
        // 단계 2: 확보된 타겟에 대해 행동 결정 (더 유연한 구조로 변경)
        new SelectorNode([
            // 2a. (최우선) 사거리 내라면 즉시 공격
            new SequenceNode([
                new IsTargetInRangeNode(),
                new AttackTargetNode(engines),
            ]),
            // 2b. (차선) 사거리 밖이라면 이동 후 다시 공격 시도
            new SequenceNode([
                new FindPathToTargetNode(engines),
                new MoveToTargetNode(engines),
                // 이동 후, 다시 사거리 체크 후 공격
                new SelectorNode([
                    new SequenceNode([
                        new IsTargetInRangeNode(),
                        new AttackTargetNode(engines),
                    ]),
                    // 이동은 했지만 공격은 실패한 경우 (예: 적이 그 사이 이동)
                    // 턴을 성공으로 간주하여 AI가 멈추지 않게 함
                    new SuccessNode(),
                ]),
            ]),
             // 2c. (대안) 공격도, 공격 위치로 이동도 할 수 없을 때
             // 턴을 성공으로 처리하여 아무것도 하지 않고 턴을 넘김
            new SuccessNode(),
        ]),
    ]);

    return new BehaviorTree(rootNode);
}

export { createMeleeAI };
