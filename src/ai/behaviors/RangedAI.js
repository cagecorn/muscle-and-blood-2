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
import FindPathToSkillRangeNode from '../nodes/FindPathToSkillRangeNode.js';

// 기존 Ranged AI의 핵심 로직 노드들
import IsTargetTooCloseNode from '../nodes/IsTargetTooCloseNode.js';
import FindKitingPositionNode from '../nodes/FindKitingPositionNode.js';
import FindMeleeStrategicTargetNode from '../nodes/FindMeleeStrategicTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';
// ✨ HasNotMovedNode를 import합니다.
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';

/**
 * 원거리 유닛(거너)을 위한 행동 트리를 재구성합니다.
 *
 * 행동 우선순위:
 * 1. (생존) 가장 가까운 적이 너무 가까우면, 먼저 안전한 위치로 이동(카이팅)합니다.
 *    - 이동 후, 그 자리에서 사용할 수 있는 가장 우선순위 높은 스킬을 사용합니다.
 * 2. (공격) 위협적이지 않다면, 1~4순위 스킬을 순서대로 확인하여 가장 먼저 사용 가능한 스킬을 사용합니다.
 *    - 필요하다면 적에게 다가가서 스킬을 사용합니다.
 * 3. (이동) 사용할 스킬이 없다면, 다음 턴을 위해 전략적으로 유리한 위치로 이동만 합니다.
 */
function createRangedAI(engines = {}) {

    // 스킬 하나를 실행하는 공통 로직 (이동 포함)
    const executeSkillBranch = new SelectorNode([
        // A. 제자리에서 즉시 사용
        new SequenceNode([
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ]),
        // B. 이동 후 사용 (카이팅 AI는 적에게 다가갈 때도 사용)
        new SequenceNode([
            // ✨ 이동하기 전에 아직 움직이지 않았는지 확인합니다.
            new HasNotMovedNode(),
            new FindPathToSkillRangeNode(engines),
            new MoveToTargetNode(engines),
            new IsSkillInRangeNode(engines), // 이동 후 사거리 재확인
            new UseSkillNode(engines)
        ])
    ]);
    
    // 사용 가능한 가장 높은 우선순위의 스킬을 찾아 실행하는 로직
    const findAndUseBestSkillSequence = new SelectorNode([
        // 1순위 스킬
        new SequenceNode([
            new CanUseSkillBySlotNode(0),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        // 2순위 스킬
        new SequenceNode([
            new CanUseSkillBySlotNode(1),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        // 3순위 스킬
        new SequenceNode([
            new CanUseSkillBySlotNode(2),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        // 4순위 스킬 (보통 일반 공격)
        new SequenceNode([
            new CanUseSkillBySlotNode(3),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
    ]);

    const rootNode = new SelectorNode([
        // 최우선 순위 1: 생존 - 적이 너무 가까우면 카이팅부터 실행
        new SequenceNode([
            // ✨ 이동하기 전에 아직 움직이지 않았는지 확인합니다.
            new HasNotMovedNode(),
            new IsTargetTooCloseNode({ ...engines, dangerZone: 2 }), // 위험 거리 설정
            new FindKitingPositionNode(engines),
            new MoveToTargetNode(engines),
            // 이동 후, 그 자리에서 공격할 기회가 있다면 공격
            new SelectorNode([
                findAndUseBestSkillSequence,
                new SuccessNode() // 공격할 스킬이 없어도 카이팅 자체는 성공
            ])
        ]),

        // 우선순위 2: 공격 - 위협적이지 않다면 스킬 사용 시도
        findAndUseBestSkillSequence,

        // 우선순위 3: 이동 - 공격할 스킬이 없다면, 다음 턴을 위해 이동만 실행
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

export { createRangedAI };
