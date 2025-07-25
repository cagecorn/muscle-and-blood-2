import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import SuccessNode from '../nodes/SuccessNode.js';

// 기존 노드들
import CanUseSkillBySlotNode from '../nodes/CanUseSkillBySlotNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';

// 신규 힐러 전용 노드들
import FindLowestHealthAllyNode from '../nodes/FindLowestHealthAllyNode.js';
import FindSafeHealingPositionNode from '../nodes/FindSafeHealingPositionNode.js';
import FindAllyToBuffNode from '../nodes/FindAllyToBuffNode.js';
import FindSafeRepositionNode from '../nodes/FindSafeRepositionNode.js';

/**
 * 힐러 유닛을 위한 행동 트리를 생성합니다.
 */
function createHealerAI(engines = {}) {
    // 최우선: 이동 없이 즉시 치유
    const immediateHealBranch = new SequenceNode([
        new CanUseSkillBySlotNode(0),
        new FindLowestHealthAllyNode({ inRangeOnly: true }),
        new IsSkillInRangeNode(engines),
        new UseSkillNode(engines),
    ]);

    // 이동 후 치유 시도
    const moveAndHealBranch = new SequenceNode([
        new HasNotMovedNode(),
        new CanUseSkillBySlotNode(0),
        new FindLowestHealthAllyNode({ inRangeOnly: false }),
        new FindSafeHealingPositionNode(engines),
        new MoveToTargetNode(engines),
        new IsSkillInRangeNode(engines),
        new UseSkillNode(engines),
    ]);

    // 버프 시도 (2번 슬롯 가정)
    const buffBranch = new SequenceNode([
        new CanUseSkillBySlotNode(1),
        new FindAllyToBuffNode(),
        new IsSkillInRangeNode(engines),
        new UseSkillNode(engines),
    ]);

    // 안전한 위치로 재배치
    const repositionBranch = new SequenceNode([
        new HasNotMovedNode(),
        new FindSafeRepositionNode(engines),
        new MoveToTargetNode(engines),
    ]);

    const rootNode = new SelectorNode([
        immediateHealBranch,
        moveAndHealBranch,
        buffBranch,
        repositionBranch,
        new SuccessNode(),
    ]);

    return new BehaviorTree(rootNode);
}

export { createHealerAI };
