import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import IsTargetValidNode from '../nodes/IsTargetValidNode.js';
import FindPreferredTargetNode from '../nodes/FindPreferredTargetNode.js';
import IsTargetInRangeNode from '../nodes/IsTargetInRangeNode.js';
import AttackTargetNode from '../nodes/AttackTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import SuccessNode from '../nodes/SuccessNode.js';

// 스킬 및 추가 이동을 위한 노드
import FindBestSkillNode from '../nodes/FindBestSkillNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
import FindPathToSkillRangeNode from '../nodes/FindPathToSkillRangeNode.js';
import CanExtraMoveNode from '../nodes/CanExtraMoveNode.js';
import SpendTokenForExtraMoveNode from '../nodes/SpendTokenForExtraMoveNode.js';

function createMeleeAI(engines = {}) {
    const rootNode = new SequenceNode([
        // [1단계] 유효한 타겟 설정
        new SelectorNode([
            new IsTargetValidNode(),
            new FindPreferredTargetNode(engines),
        ]),

        // [2단계] 주 행동 페이즈
        new SelectorNode([
            // (A) 제자리 스킬 사용
            new SequenceNode([
                new FindBestSkillNode(engines),
                new IsSkillInRangeNode(engines),
                new UseSkillNode(engines),
            ]),
            // (B) 이동 후 스킬 사용
            new SequenceNode([
                new FindBestSkillNode(engines),
                new FindPathToSkillRangeNode(engines),
                new MoveToTargetNode(engines),
                new IsSkillInRangeNode(engines),
                new UseSkillNode(engines),
            ]),
            // (C) 제자리 일반 공격
            new SequenceNode([
                new IsTargetInRangeNode(),
                new AttackTargetNode(engines),
            ]),
            // (D) 이동 후 일반 공격
            new SequenceNode([
                new FindPathToTargetNode(engines),
                new MoveToTargetNode(engines),
                new AttackTargetNode(engines),
            ]),
        ]),

        // [3단계] 추가 행동 페이즈 (선택적)
        new SelectorNode([
            new SequenceNode([
                new CanExtraMoveNode(engines),
                new SpendTokenForExtraMoveNode(engines),
                new SelectorNode([
                    // (A) 아직 사용 안한 다른 스킬 사용
                    new SequenceNode([
                        new FindBestSkillNode(engines),
                        new FindPathToSkillRangeNode(engines),
                        new MoveToTargetNode(engines),
                        new IsSkillInRangeNode(engines),
                        new UseSkillNode(engines),
                    ]),
                    // (B) 일반 공격
                    new SequenceNode([
                        new FindPathToTargetNode(engines),
                        new MoveToTargetNode(engines),
                        new AttackTargetNode(engines),
                    ]),
                    // 이동만 하고 턴 종료
                    new SuccessNode(),
                ]),
            ]),
            new SuccessNode(),
        ]),
    ]);

    return new BehaviorTree(rootNode);
}

export { createMeleeAI };
