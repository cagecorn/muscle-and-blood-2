import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import FindBestSkillByScoreNode from '../nodes/FindBestSkillByScoreNode.js';
import FindTargetBySkillTypeNode from '../nodes/FindTargetBySkillTypeNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
import FindPathToSkillRangeNode from '../nodes/FindPathToSkillRangeNode.js';
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';
import FindPriorityTargetNode from '../nodes/FindPriorityTargetNode.js';
import FindLowestHealthEnemyNode from '../nodes/FindLowestHealthEnemyNode.js';
import FindSkillByTagNode from '../nodes/FindSkillByTagNode.js';
import { SKILL_TAGS } from '../../game/utils/SkillTagManager.js';

/**
 * ESTJ: 엄격한 관리자 아키타입 행동 트리 (전사)
 * 우선순위:
 * 1. (점사 대상 선정) 위협적이거나 체력이 낮은 적을 이번 턴의 목표로 고정합니다.
 * 2. (약화 후 공격) 목표에게 [DEBUFF] 스킬을 먼저 사용한 뒤, 다른 공격 스킬을 연계합니다.
 * 3. (일반 공격) 사용할 디버프 스킬이 없다면, 바로 최적의 공격 스킬을 사용합니다.
 * 4. (이동) 위 행동을 위해 필요하다면 이동합니다.
 */
function createESTJ_AI(engines = {}) {
    const executeSkillBranch = new SelectorNode([
        new SequenceNode([
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ]),
        new SequenceNode([
            new HasNotMovedNode(),
            new FindPathToSkillRangeNode(engines),
            new MoveToTargetNode(engines),
            new IsSkillInRangeNode(engines),
            new UseSkillNode(engines)
        ])
    ]);

    const rootNode = new SequenceNode([
        // 1. 점사할 타겟을 먼저 결정 (가장 체력 낮은 적 > 우선순위 적)
        new SelectorNode([
            new FindLowestHealthEnemyNode(engines),
            new FindPriorityTargetNode(engines)
        ]),
        // 2. 결정된 타겟을 대상으로 행동 개시
        new SelectorNode([
            // 2-1. 디버프 -> 공격 연계 시도
            new SequenceNode([
                new FindSkillByTagNode(SKILL_TAGS.DEBUFF, engines),
                new FindTargetBySkillTypeNode(engines),
                executeSkillBranch,
                new FindBestSkillByScoreNode(engines),
                new FindTargetBySkillTypeNode(engines),
                executeSkillBranch
            ]),
            // 2-2. 디버프가 없으면 바로 공격
            new SequenceNode([
                new FindBestSkillByScoreNode(engines),
                new FindTargetBySkillTypeNode(engines),
                executeSkillBranch
            ])
        ])
    ]);

    return new BehaviorTree(rootNode);
}

export { createESTJ_AI };
