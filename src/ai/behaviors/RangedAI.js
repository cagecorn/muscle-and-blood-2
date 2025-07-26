import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import SuccessNode from '../nodes/SuccessNode.js';

// 스킬 우선순위 로직에 필요한 노드들
import CanUseSkillBySlotNode from '../nodes/CanUseSkillBySlotNode.js';
import FindTargetBySkillTypeNode from '../nodes/FindTargetBySkillTypeNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
// ✨ FindPathToSkillRangeNode 대신 FindKitingPositionNode를 공격 이동에도 사용합니다.
import FindKitingPositionNode from '../nodes/FindKitingPositionNode.js';

// 기존 Ranged AI의 핵심 로직 노드들
import IsTargetTooCloseNode from '../nodes/IsTargetTooCloseNode.js';
import FindMeleeStrategicTargetNode from '../nodes/FindMeleeStrategicTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';
// ✨ HasNotMovedNode를 import합니다.
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';
import SpendActionPointNode from '../nodes/SpendActionPointNode.js';

/**
 * 원거리 유닛(거너)을 위한 행동 트리를 재구성합니다.
 *
 * 행동 우선순위:
 * 1. (생존) 가장 가까운 적이 너무 가까우면, 먼저 안전한 위치로 이동(카이팅)합니다.
 *    - 이동 후, 그 자리에서 사용할 수 있는 가장 우선순위 높은 스킬을 사용합니다.
 * 2. (공격) 위협적이지 않다면, 1~4순위 스킬을 순서대로 확인하여 가장 먼저 사용 가능한 스킬을 사용합니다.
 *    - ✨ [변경] 이때, 이동이 필요하다면 단순 접근이 아닌 '안전한 공격 위치'를 탐색합니다.
 * 3. (이동) 사용할 스킬이 없다면, 다음 턴을 위해 전략적으로 유리한 위치로 이동만 합니다.
 */
function createRangedAI(engines = {}) {

    // 스킬 하나를 실행하는 공통 로직 (이동 포함)
    const executeSkillBranch = new SelectorNode([
        new SequenceNode([
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ]),
        new SequenceNode([
            new HasNotMovedNode(),
            new FindKitingPositionNode(engines),
            new MoveToTargetNode(engines),
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ])
    ]);

    const movementPhase = new SelectorNode([
        new SequenceNode([
            new HasNotMovedNode(),
            new SpendActionPointNode(),
            new IsTargetTooCloseNode({ ...engines, dangerZone: 2 }),
            new FindKitingPositionNode(engines),
            new MoveToTargetNode(engines)
        ]),
        new SequenceNode([
            new HasNotMovedNode(),
            new SpendActionPointNode(),
            new FindMeleeStrategicTargetNode(engines),
            new FindPathToTargetNode(engines),
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

    const rootNode = new SelectorNode([
        new SequenceNode([
            movementPhase,
            skillPhase
        ])
    ]);

    return new BehaviorTree(rootNode);
}

export { createRangedAI };
