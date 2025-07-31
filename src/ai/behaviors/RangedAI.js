import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import SuccessNode from '../nodes/SuccessNode.js';

import FindTargetBySkillTypeNode from '../nodes/FindTargetBySkillTypeNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
import FindKitingPositionNode from '../nodes/FindKitingPositionNode.js';
import IsTargetTooCloseNode from '../nodes/IsTargetTooCloseNode.js';
import FindPreferredTargetNode from '../nodes/FindPreferredTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';
import IsHealthBelowThresholdNode from '../nodes/IsHealthBelowThresholdNode.js';
import FleeNode from '../nodes/FleeNode.js';
import FindSafeRepositionNode from '../nodes/FindSafeRepositionNode.js';
import FindBestSkillByScoreNode from '../nodes/FindBestSkillByScoreNode.js';
import FindPathToSkillRangeNode from '../nodes/FindPathToSkillRangeNode.js';
import CheckAspirationStateNode from '../nodes/CheckAspirationStateNode.js';
import { ASPIRATION_STATE } from '../../game/utils/AspirationEngine.js';

function createRangedAI(engines = {}) {
    // 스킬 하나를 실행하는 공통 로직 (이동 불포함)
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
    
    // 생존 본능 (체력이 낮을 때)
    const survivalBehavior = new SequenceNode([
        new IsHealthBelowThresholdNode(0.35),
        new FleeNode(engines),
        new MoveToTargetNode(engines)
    ]);

    // 카이팅 (적이 너무 가까울 때)
    const kitingBehavior = new SequenceNode([
        new HasNotMovedNode(),
        new IsTargetTooCloseNode({ ...engines, dangerZone: 2 }),
        new FindKitingPositionNode(engines),
        new MoveToTargetNode(engines)
    ]);

    // 주 공격 로직
    const mainAttackLogic = new SequenceNode([
        // ✨ [수정] 스킬 점수 기반으로 최적의 스킬을 먼저 찾습니다.
        new FindBestSkillByScoreNode(engines),
        // ✨ [수정] 해당 스킬에 맞는 최적의 대상을 찾습니다.
        new FindTargetBySkillTypeNode(engines),
        new SelectorNode([
            // 사거리 내에 있으면 즉시 사용
            useSkillBranch,
            // 사거리 밖에 있으면 이동 후 사용
            moveAndUseSkillBranch
        ])
    ]);

    // 기본 이동 로직 (공격할 스킬이 없을 때)
    const basicMovement = new SequenceNode([
        new HasNotMovedNode(),
        // ✨ [수정] 원거리 유닛에 맞는 타겟 탐색 노드를 사용합니다.
        new FindPreferredTargetNode(engines), 
        new FindPathToTargetNode(engines),
        new MoveToTargetNode(engines)
    ]);

    // 최종 행동 트리 구성 (기존 로직)
    const baseBehaviorTree = new SelectorNode([
        survivalBehavior,
        kitingBehavior,
        mainAttackLogic,
        basicMovement,
        new SequenceNode([
            new HasNotMovedNode(),
            new FindSafeRepositionNode(engines),
            new MoveToTargetNode(engines)
        ]),
        new SuccessNode()
    ]);

    // 열망 상태에 따른 분기 처리
    const rootNode = new SelectorNode([
        new SequenceNode([
            new CheckAspirationStateNode(ASPIRATION_STATE.COLLAPSED),
            baseBehaviorTree
        ]),
        baseBehaviorTree
    ]);

    return new BehaviorTree(rootNode);
}

export { createRangedAI };
