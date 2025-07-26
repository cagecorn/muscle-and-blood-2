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
            // ✨ 이동 전 행동력 소모
            new SpendActionPointNode(),
            new MoveToTargetNode(engines),
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ])
    ]);

    // ✨ 이동 페이즈 수정: 안전 확보(카이팅)를 최우선으로 고려하고, 이동 결정 후 AP 소모
    const movementPhase = new SelectorNode([
        new SequenceNode([
            new ShouldHealerMoveNode(),
            // 안전 위치 탐색을 우선
            new SelectorNode([
                new FindKitingPositionNode(engines), // 위협적일 때
                new FindSafeHealingPositionNode(engines) // 아군을 치유해야 할 때
            ]),
            new SpendActionPointNode(), // 경로 확보 후 AP 소모
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

    // ✨ 루트 노드 수정: 이동 후 스킬 페이즈를 여러 번 반복
    const rootNode = new SequenceNode([
        movementPhase,
        new SelectorNode([
            skillPhase,
            skillPhase,
            skillPhase,
            skillPhase,
            skillPhase,
            new SuccessNode()
        ])
    ]);

    return new BehaviorTree(rootNode);
}

export { createHealerAI };
