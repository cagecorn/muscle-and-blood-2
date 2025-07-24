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
            // ✨ 이동하기 전에 아직 움직이지 않았는지 확인합니다.
            new HasNotMovedNode(),
            new FindPathToSkillRangeNode(engines),
            new MoveToTargetNode(engines),
            new IsSkillInRangeNode(engines), // 이동 후 사거리 재확인
            new UseSkillNode(engines)
        ])
    ]);

    const rootNode = new SelectorNode([
        // 우선순위 1: 1번 슬롯 스킬 사용 시도
        new SequenceNode([
            new CanUseSkillBySlotNode(0),
            new FindTargetBySkillTypeNode(engines),
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
        // 우선순위 4: 4번 슬롯 스킬 사용 시도 (보통 일반 공격)
        new SequenceNode([
            new CanUseSkillBySlotNode(3),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),

        // 우선순위 5: 사용할 스킬이 없을 경우, 이동만 실행
        new SequenceNode([
            // ✨ 이동하기 전에 아직 움직이지 않았는지 확인합니다.
            new HasNotMovedNode(),
            new FindMeleeStrategicTargetNode(engines),
            new FindPathToTargetNode(engines),
            new MoveToTargetNode(engines)
        ]),

        // 최후의 보루: 아무것도 할 수 없을 때 성공으로 턴 종료
        new SuccessNode(),
    ]);

    return new BehaviorTree(rootNode);
}

export { createMeleeAI };
