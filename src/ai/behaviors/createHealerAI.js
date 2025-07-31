import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import SuccessNode from '../nodes/SuccessNode.js';

// 사용할 노드들을 import 합니다.
import FindBestSkillByScoreNode from '../nodes/FindBestSkillByScoreNode.js';
import FindTargetBySkillTypeNode from '../nodes/FindTargetBySkillTypeNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
import FindSafeHealingPositionNode from '../nodes/FindSafeHealingPositionNode.js';
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';
import FindLowestHealthAllyNode from '../nodes/FindLowestHealthAllyNode.js';
import FindSafeRepositionNode from '../nodes/FindSafeRepositionNode.js';

/**
 * 힐러 유닛을 위한 합리적인 하드코딩 AI를 생성합니다.
 * @param {object} engines - AI 노드에 주입될 각종 엔진
 * @returns {BehaviorTree}
 */
function createHealerAI(engines = {}) {
    // 스킬을 실행하는 공통 로직 (이동 포함)
    const executeSkillBranch = new SelectorNode([
        // 1. 사거리 내에 있으면 즉시 사용
        new SequenceNode([
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ]),
        // 2. 사거리 밖이면 안전한 위치로 이동 후 사용
        new SequenceNode([
            new HasNotMovedNode(),
            new FindSafeHealingPositionNode(engines),
            new MoveToTargetNode(engines),
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ])
    ]);

    // 아군 지원 시퀀스
    const supportSequence = new SequenceNode([
        new FindBestSkillByScoreNode(engines), // 점수 기반으로 힐/버프 스킬 우선 선택
        new FindTargetBySkillTypeNode(engines), // 체력 낮은 아군 등 스킬에 맞는 대상 탐색
        executeSkillBranch
    ]);

    // 안전한 위치로 재배치하는 로직
    const repositionSequence = new SequenceNode([
        new HasNotMovedNode(),
        new FindSafeRepositionNode(engines),
        new MoveToTargetNode(engines)
    ]);

    // 최종 행동 트리 구성
    const rootNode = new SelectorNode([
        supportSequence,    // 1순위: 아군 치유 및 버프 시도
        repositionSequence, // 2순위: 할 게 없으면 안전한 곳으로 이동
        new SuccessNode()   // 모든 행동 실패 시 턴 정상 종료
    ]);

    return new BehaviorTree(rootNode);
}

export { createHealerAI };
