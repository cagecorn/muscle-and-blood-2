import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import SuccessNode from '../nodes/SuccessNode.js';

// 기존 노드들
import CanUseSkillBySlotNode from '../nodes/CanUseSkillBySlotNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
import FindTargetBySkillTypeNode from '../nodes/FindTargetBySkillTypeNode.js';

// 힐러 전용 이동 노드
import FindSafeHealingPositionNode from '../nodes/FindSafeHealingPositionNode.js';
import FindSafeRepositionNode from '../nodes/FindSafeRepositionNode.js';

/**
 * 힐러 유닛을 위한 행동 트리를 생성합니다.
 * SKILL-SYSTEM.md 규칙에 따라 스킬 슬롯 순서대로 우선순위를 결정합니다.
 */
function createHealerAI(engines = {}) {
    // 스킬 하나를 실행하는 공통 로직 (이동 포함)
    const executeSkillBranch = new SelectorNode([
        new SequenceNode([
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ]),
        new SequenceNode([
            new FindSafeHealingPositionNode(engines),
            new MoveToTargetNode(engines),
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ])
    ]);

    const rootNode = new SelectorNode([
        // ✨ [신규] 최우선 순위 0: 안전한 위치로 이동
        new SequenceNode([
            new CanUseSkillBySlotNode(0),
            new FindSafeRepositionNode(engines),
            new MoveToTargetNode(engines),
        ]),

        // ✨ [변경] 기존 스킬 순위 +1
        new SequenceNode([ new CanUseSkillBySlotNode(1), new FindTargetBySkillTypeNode(engines), executeSkillBranch ]),
        new SequenceNode([ new CanUseSkillBySlotNode(2), new FindTargetBySkillTypeNode(engines), executeSkillBranch ]),
        new SequenceNode([ new CanUseSkillBySlotNode(3), new FindTargetBySkillTypeNode(engines), executeSkillBranch ]),
        new SequenceNode([ new CanUseSkillBySlotNode(4), new FindTargetBySkillTypeNode(engines), executeSkillBranch ]),
        new SequenceNode([ new CanUseSkillBySlotNode(5), new FindTargetBySkillTypeNode(engines), executeSkillBranch ]),

        new SuccessNode(),
    ]);

    return new BehaviorTree(rootNode);
}

export { createHealerAI };
