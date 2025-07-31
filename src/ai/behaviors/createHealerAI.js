import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';

import FindBestSkillByScoreNode from '../nodes/FindBestSkillByScoreNode.js';
import FindTargetBySkillTypeNode from '../nodes/FindTargetBySkillTypeNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
import FindSafeHealingPositionNode from '../nodes/FindSafeHealingPositionNode.js';
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';
import FindSafeRepositionNode from '../nodes/FindSafeRepositionNode.js';

function createHealerAI(engines = {}) {
    // --- 공통 사용 브랜치 ---
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
    
    // --- 기본 행동 (최후의 보루) ---
    const basicActionBranch = new SelectorNode([
        // 1. 아군 지원(힐/버프) 또는 적 공격(디버프/공격) 시도
        new SequenceNode([
            new FindBestSkillByScoreNode(engines),
            new FindTargetBySkillTypeNode(engines),
            executeSkillBranch
        ]),
        // 2. 할 수 있는 스킬이 없으면 안전한 위치로 재배치
        new SequenceNode([
            new HasNotMovedNode(),
            new FindSafeRepositionNode(engines),
            new MoveToTargetNode(engines)
        ])
    ]);
    
    // ... MBTI 기반 특수 행동 로직 (필요 시 여기에 추가) ...


    // --- 최종 행동 트리 구성 ---
    const rootNode = new SelectorNode([
        // 1순위: 특수 행동 (예: 생존 본능)
        // ...
        
        // 2순위: 기본 행동 (반드시 실행됨)
        basicActionBranch
    ]);

    return new BehaviorTree(rootNode);
}

export { createHealerAI };
