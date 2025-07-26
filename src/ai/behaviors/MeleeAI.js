import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import SuccessNode from '../nodes/SuccessNode.js';

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
 * 행동 우선순위 (사용자님의 원래 의도대로 복원):
 * 1. 이동: (아직 이동 안 했으면) 0순위 이동 스킬을 사용해 전략적 목표를 향해 이동합니다.
 * 2. 스킬 사용: 1~5순위 스킬을 순서대로 확인하여 사용 가능한 스킬이 있다면 사용합니다.
 */
function createMeleeAI(engines = {}) {

    const executeSkillBranch = new SelectorNode([
        new SequenceNode([
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ]),
        new SequenceNode([
            new HasNotMovedNode(engines),
            new FindPathToSkillRangeNode(engines),
            new MoveToTargetNode(engines),
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ])
    ]);

    const rootNode = new SelectorNode([
        // ✨ 최우선 순위 0: 이동 (단, 턴에 한 번만 실행되도록 수정)
        new SequenceNode([
            // ✨ [핵심 수정] 이 노드가 이동을 한 번만 하도록 막아주는 관문 역할을 합니다.
            new HasNotMovedNode(engines),
            new CanUseSkillBySlotNode(0),
            new FindMeleeStrategicTargetNode(engines),
            new FindPathToTargetNode(engines),
            new MoveToTargetNode(engines)
        ]),

        // 우선순위 1~5: 공격, 버프, 디버프 등 주요 스킬 사용 시도
        new SequenceNode([ new CanUseSkillBySlotNode(1), new FindTargetBySkillTypeNode(engines), executeSkillBranch ]),
        new SequenceNode([ new CanUseSkillBySlotNode(2), new FindTargetBySkillTypeNode(engines), executeSkillBranch ]),
        new SequenceNode([ new CanUseSkillBySlotNode(3), new FindTargetBySkillTypeNode(engines), executeSkillBranch ]),
        new SequenceNode([ new CanUseSkillBySlotNode(4), new FindTargetBySkillTypeNode(engines), executeSkillBranch ]),
        new SequenceNode([ new CanUseSkillBySlotNode(5), new FindTargetBySkillTypeNode(engines), executeSkillBranch ]),

        // 이동을 이미 했거나, 할 수 없을 때, 그리고 다른 스킬도 못 쓸 때
        new SuccessNode(),
    ]);

    return new BehaviorTree(rootNode);
}

export { createMeleeAI };
