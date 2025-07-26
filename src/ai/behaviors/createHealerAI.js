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
        // A. 제자리에서 즉시 사용
        new SequenceNode([
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ]),
        // B. 이동 후 사용
        new SequenceNode([
            new HasNotMovedNode(),
            // ✨ 힐러는 공격 위치가 아닌 '안전한 치유/버프 위치'를 탐색합니다.
            new FindSafeHealingPositionNode(engines),
            new MoveToTargetNode(engines),
            new IsSkillInRangeNode(engines), // 이동 후 사거리 재확인
            new UseSkillNode(engines)
        ])
    ]);

    const rootNode = new SelectorNode([
        // 우선순위 1: 1번 슬롯 스킬 사용 시도
        new SequenceNode([
            new CanUseSkillBySlotNode(0),
            new FindTargetBySkillTypeNode(engines), // 스킬 타입에 맞는 대상(아군)을 찾습니다.
            executeSkillBranch
        ]),
        // 우선순위 2: 2번 슬롯 스킬 사용 시도
        new SequenceNode([
            new CanUseSkillBySlotNode(1),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        // 우선순위 3: 3번 슬롯 스킬 사용 시도
        new SequenceNode([
            new CanUseSkillBySlotNode(2),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        // 우선순위 4: 4번 슬롯 스킬 사용 시도
        new SequenceNode([
            new CanUseSkillBySlotNode(3),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        // ✨ [신규] 우선순위 5: 5번 슬롯(소환) 스킬 사용 시도
        new SequenceNode([
            new CanUseSkillBySlotNode(4),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        // 최후의 수단 1: 사용할 스킬이 없을 경우, 안전한 위치로 이동
        new SequenceNode([
            new HasNotMovedNode(),
            new FindSafeRepositionNode(engines),
            new MoveToTargetNode(engines),
        ]),

        // 최후의 수단 2: 아무것도 할 수 없을 때 성공으로 턴 종료
        new SuccessNode(),
    ]);

    return new BehaviorTree(rootNode);
}

export { createHealerAI };
