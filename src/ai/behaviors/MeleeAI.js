import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';

// ✨ [추가] 턴 당 행동을 반복하고, 이동 가능 여부를 체크하는 새 노드를 import합니다.
import RepeaterNode from '../nodes/RepeaterNode.js';
import CanMoveNode from '../nodes/CanMoveNode.js';

// 기존 노드 import
import FindBestSkillNode from '../nodes/FindBestSkillNode.js';
import FindTargetBySkillTypeNode from '../nodes/FindTargetBySkillTypeNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
import FindPathToSkillRangeNode from '../nodes/FindPathToSkillRangeNode.js';
import FindMeleeStrategicTargetNode from '../nodes/FindMeleeStrategicTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';

/**
 * 근접 유닛(전사)을 위한 행동 트리를 재구성합니다.
 *
 * 행동 우선순위:
 * 1. 스킬 사용: 1~4순위 스킬을 순서대로 확인하여 사용 가능한 스킬이 있다면, 이동해서라도 사용합니다.
 * 2. 이동만 하기: 사용할 스킬이 없다면, 전략적 목표를 향해 이동하고 턴을 마칩니다.
 */
function createMeleeAI(engines = {}) {

    // 한 턴에 수행할 수 있는 단일 행동(스킬 사용 또는 이동)을 정의하는 서브트리입니다.
    const takeOneAction = new SelectorNode([
        // 우선순위 1: 사용 가능한 스킬(공격, 버프 등)을 찾아 실행합니다.
        new SequenceNode([
            new FindBestSkillNode(engines),
            new FindTargetBySkillTypeNode(engines),
            new SelectorNode([
                // A. 제자리에서 즉시 사용
                new SequenceNode([
                    new IsSkillInRangeNode(engines),
                    new UseSkillNode(engines)
                ]),
                // B. 이동 후 사용 (아직 이동하지 않았을 경우에만)
                new SequenceNode([
                    new CanMoveNode(),
                    new FindPathToSkillRangeNode(engines),
                    new MoveToTargetNode(engines),
                    new IsSkillInRangeNode(engines),
                    new UseSkillNode(engines)
                ])
            ])
        ]),

        // 우선순위 2: 사용할 스킬이 없을 때, 이동만 합니다. (아직 이동하지 않았을 경우에만)
        new SequenceNode([
            new CanMoveNode(),
            new FindMeleeStrategicTargetNode(engines),
            new FindPathToTargetNode(engines),
            new MoveToTargetNode(engines)
        ])
    ]);

    // 루트 노드는 Repeater로, takeOneAction을 계속 반복 실행합니다.
    const rootNode = new RepeaterNode(takeOneAction);

    return new BehaviorTree(rootNode);
}

export { createMeleeAI };
