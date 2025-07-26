import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import SuccessNode from '../nodes/SuccessNode.js';

// 신규 노드 및 재사용 노드 import
import CanUseSkillBySlotNode from '../nodes/CanUseSkillBySlotNode.js';
import FindTargetBySkillTypeNode from '../nodes/FindTargetBySkillTypeNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
import FindPathToSkillRangeNode from '../nodes/FindPathToSkillRangeNode.js';
import FindMeleeStrategicTargetNode from '../nodes/FindMeleeStrategicTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';
import SpendActionPointNode from '../nodes/SpendActionPointNode.js';

/**
 * 근접 유닛(전사)을 위한 행동 트리를 재구성합니다.
 *
 * 행동 우선순위:
 * 1. 스킬 사용: 1~4순위 스킬을 순서대로 확인하여 사용 가능한 스킬이 있다면, 이동해서라도 사용합니다.
 * 2. 이동만 하기: 사용할 스킬이 없다면, 전략적 목표를 향해 이동하고 턴을 마칩니다.
 */
function createMeleeAI(engines = {}) {

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
            new FindPathToSkillRangeNode(engines),
            // ✨ 이동 전 행동력 소모
            new SpendActionPointNode(),
            new MoveToTargetNode(engines),
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ])
    ]);

    // ✨ 이동 페이즈 수정: 이동 경로가 있을 때만 AP를 소모하도록 구조 변경
    const movementPhase = new SelectorNode([
        new SequenceNode([
            new HasNotMovedNode(),
            new FindMeleeStrategicTargetNode(engines),
            new FindPathToTargetNode(engines),
            new SpendActionPointNode(), // 경로 확정 후 AP 소모
            new MoveToTargetNode(engines)
        ]),
        new SuccessNode() // 이동할 필요가 없거나 이동할 수 없어도 페이즈는 성공
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
        // 모든 스킬 사용 시도 후에도 성공/실패 여부와 관계없이 다음으로 진행
        new SuccessNode() 
    ]);

    // ✨ 루트 노드 수정: 이동 후 스킬 페이즈를 여러 번 반복
    const rootNode = new SequenceNode([
        movementPhase,
        new SelectorNode([ // Selector를 사용해 스킬을 쓸 수 있을 때까지 계속 시도
            skillPhase,
            skillPhase,
            skillPhase,
            skillPhase,
            skillPhase,
            new SuccessNode() // 모든 시도가 끝나면 턴 종료
        ])
    ]);

    return new BehaviorTree(rootNode);
}

export { createMeleeAI };
