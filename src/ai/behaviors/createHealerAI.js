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
import SpendActionPointNode from '../nodes/SpendActionPointNode.js';
import FindTargetBySkillTypeNode from '../nodes/FindTargetBySkillTypeNode.js';

// 힐러 전용 이동 노드
import FindSafeHealingPositionNode from '../nodes/FindSafeHealingPositionNode.js';
import FindKitingPositionNode from '../nodes/FindKitingPositionNode.js';
import ShouldHealerMoveNode from '../nodes/ShouldHealerMoveNode.js';

/**
 * 힐러 유닛을 위한 행동 트리를 생성합니다.
 * SKILL-SYSTEM.md 규칙에 따라 스킬 슬롯 순서대로 우선순위를 결정합니다.
 */
function createHealerAI(engines = {}) {
    const executeSkillBranch = new SelectorNode([
        new SequenceNode([
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ]),
        new SequenceNode([
            new HasNotMovedNode(),
            new FindSafeHealingPositionNode(engines),
            new MoveToTargetNode(engines),
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ])
    ]);

    const movementPhase = new SelectorNode([
        new SequenceNode([
            new ShouldHealerMoveNode(),
            new SpendActionPointNode(),
            new SelectorNode([
                new FindKitingPositionNode(engines),
                new FindSafeHealingPositionNode(engines)
            ]),
            new MoveToTargetNode(engines)
        ]),
        new SuccessNode()
    ]);

    const skillPhase = new SelectorNode([
        new SequenceNode([
            new CanUseSkillBySlotNode(0),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        new SequenceNode([
            new CanUseSkillBySlotNode(1),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        new SequenceNode([
            new CanUseSkillBySlotNode(2),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        new SequenceNode([
            new CanUseSkillBySlotNode(3),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        new SequenceNode([
            new CanUseSkillBySlotNode(4),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        new SuccessNode()
    ]);

    // 토큰이 남아 있다면 여러 스킬을 연속으로 사용할 수 있도록 스킬 단계를 반복합니다.
    const rootNode = new SelectorNode([
        new SequenceNode([
            movementPhase,
            new SelectorNode([
                skillPhase,
                skillPhase,
                skillPhase,
                skillPhase,
                skillPhase,
                new SuccessNode()
            ])
        ])
    ]);

    return new BehaviorTree(rootNode);
}

export { createHealerAI };
