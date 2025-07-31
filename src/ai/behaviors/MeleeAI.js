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
import FindPathToSkillRangeNode from '../nodes/FindPathToSkillRangeNode.js';
import FindMeleeStrategicTargetNode from '../nodes/FindMeleeStrategicTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';

/**
 * 근접 유닛을 위한 합리적인 하드코딩 AI를 생성합니다.
 * @param {object} engines - AI 노드에 주입될 각종 엔진
 * @returns {BehaviorTree}
 */
function createMeleeAI(engines = {}) {
    // 스킬을 실행하는 공통 로직 (이동 포함)
    const executeSkillBranch = new SelectorNode([
        // 1. 사거리 내에 있으면 즉시 사용
        new SequenceNode([
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ]),
        // 2. 사거리 밖이면 이동 후 사용
        new SequenceNode([
            new HasNotMovedNode(),
            new FindPathToSkillRangeNode(engines),
            new MoveToTargetNode(engines),
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ])
    ]);

    // 주 공격 시퀀스
    const attackSequence = new SequenceNode([
        new FindBestSkillByScoreNode(engines),
        new FindTargetBySkillTypeNode(engines),
        executeSkillBranch
    ]);

    // 기본 이동 로직 (공격할 스킬이 없을 때)
    const basicMovement = new SequenceNode([
        new HasNotMovedNode(),
        new FindMeleeStrategicTargetNode(engines), // 근접 유닛에 맞는 타겟 탐색
        new FindPathToTargetNode(engines),
        new MoveToTargetNode(engines)
    ]);

    // 최종 행동 트리 구성
    const rootNode = new SelectorNode([
        attackSequence, // 1순위: 공격 시도
        basicMovement,  // 2순위: 이동
        new SuccessNode() // 모든 행동 실패 시 턴 정상 종료
    ]);

    return new BehaviorTree(rootNode);
}

export { createMeleeAI };
