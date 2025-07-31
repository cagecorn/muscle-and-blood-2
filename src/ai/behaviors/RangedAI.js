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

/**
 * 원거리 유닛을 위한 합리적인 하드코딩 AI를 생성합니다.
 * @param {object} engines - AI 노드에 주입될 각종 엔진
 * @returns {BehaviorTree}
 */
function createRangedAI(engines = {}) {
    const useSkillBranch = new SequenceNode([
        new IsSkillInRangeNode(engines),
        new UseSkillNode(engines)
    ]);

    const moveAndUseSkillBranch = new SequenceNode([
        new HasNotMovedNode(),
        new FindPathToSkillRangeNode(engines),
        new MoveToTargetNode(engines),
        new IsSkillInRangeNode(engines),
        new UseSkillNode(engines)
    ]);

    const survivalBehavior = new SequenceNode([
        new IsHealthBelowThresholdNode(0.35),
        new FleeNode(engines),
        new MoveToTargetNode(engines)
    ]);

    const kitingBehavior = new SequenceNode([
        new HasNotMovedNode(),
        new IsTargetTooCloseNode({ ...engines, dangerZone: 2 }),
        new FindKitingPositionNode(engines),
        new MoveToTargetNode(engines)
    ]);

    const mainAttackLogic = new SequenceNode([
        new FindBestSkillByScoreNode(engines),
        new FindTargetBySkillTypeNode(engines),
        new SelectorNode([
            useSkillBranch,
            moveAndUseSkillBranch
        ])
    ]);

    const basicMovement = new SequenceNode([
        new HasNotMovedNode(),
        new FindPreferredTargetNode(engines),
        new FindPathToTargetNode(engines),
        new MoveToTargetNode(engines)
    ]);

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
