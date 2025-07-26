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
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';

// 힐러 전용 이동 노드
import FindSafeHealingPositionNode from '../nodes/FindSafeHealingPositionNode.js';
import FindSafeRepositionNode from '../nodes/FindSafeRepositionNode.js';

/**
 * 힐러 유닛을 위한 행동 트리를 생성합니다.
 *
 * 행동 우선순위 (사용자님의 원래 의도대로 복원):
 * 1. 재배치: (아직 이동 안 했으면) 0순위 이동 스킬을 사용해 안전한 위치로 이동합니다.
 * 2. 스킬 사용: 1~5순위 스킬(힐, 버프 등)을 확인하여 사용합니다.
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
        // ✨ 최우선 순위 0: 안전한 위치로 이동 (단, 턴에 한 번만 실행되도록 수정)
        new SequenceNode([
            // ✨ [핵심 수정] 이 노드가 이동을 한 번만 하도록 막아주는 관문 역할을 합니다.
            new HasNotMovedNode(engines),
            new CanUseSkillBySlotNode(0),
            new FindSafeRepositionNode(engines),
            new MoveToTargetNode(engines),
        ]),

        // 우선순위 1~5: 힐, 버프 등 주요 스킬 사용 시도
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
