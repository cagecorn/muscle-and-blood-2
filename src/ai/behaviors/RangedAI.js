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
import FindPreferredTargetNode from '../nodes/FindPreferredTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';
import IsTargetTooCloseNode from '../nodes/IsTargetTooCloseNode.js';
import FindKitingPositionNode from '../nodes/FindKitingPositionNode.js';
import FindSafeRepositionNode from '../nodes/FindSafeRepositionNode.js';

/**
 * 원거리 유닛을 위한 합리적인 하드코딩 AI를 생성합니다.
 * @param {object} engines - AI 노드에 주입될 각종 엔진
 * @returns {BehaviorTree}
 */
function createRangedAI(engines = {}) {
    // 스킬을 실행하는 공통 로직 (이동 불포함)
    const useSkillBranch = new SequenceNode([
        new IsSkillInRangeNode(engines),
        new UseSkillNode(engines)
    ]);

    // 이동 후 스킬을 사용하는 공통 로직
    const moveAndUseSkillBranch = new SequenceNode([
        new HasNotMovedNode(),
        new FindPathToSkillRangeNode(engines),
        new MoveToTargetNode(engines),
        new IsSkillInRangeNode(engines),
        new UseSkillNode(engines)
    ]);
    
    // 카이팅 (적이 너무 가까울 때)
    const kitingBehavior = new SequenceNode([
        new HasNotMovedNode(),
        new IsTargetTooCloseNode({ ...engines, dangerZone: 2 }), // 위험 거리 2칸
        new FindKitingPositionNode(engines),
        new MoveToTargetNode(engines)
    ]);

    // 주 공격 로직
    const mainAttackLogic = new SequenceNode([
        new FindBestSkillByScoreNode(engines),
        new FindTargetBySkillTypeNode(engines),
        new SelectorNode([
            useSkillBranch,       // 사거리 내에 있으면 즉시 사용
            moveAndUseSkillBranch // 사거리 밖에 있으면 이동 후 사용
        ])
    ]);

    // 최종 행동 트리 구성
    const rootNode = new SelectorNode([
        kitingBehavior,     // 1순위: 적이 너무 가까우면 카이팅
        mainAttackLogic,    // 2순위: 공격
        // 3순위: 할 게 없으면 안전한 위치로 재배치
        new SequenceNode([
            new HasNotMovedNode(),
            new FindSafeRepositionNode(engines),
            new MoveToTargetNode(engines)
        ]),
        new SuccessNode() // 모든 행동 실패 시 턴 정상 종료
    ]);

    return new BehaviorTree(rootNode);
}

export { createRangedAI };
