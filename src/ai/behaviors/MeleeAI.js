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

// 스킬 관련 노드 import
import FindBestSkillNode from '../nodes/FindBestSkillNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
import FindPathToSkillRangeNode from '../nodes/FindPathToSkillRangeNode.js';

/**
 * 근접 유닛(전사)을 위한 행동 트리를 생성합니다.
 * 행동 로직이 명확한 우선순위를 가지도록 재구성되었습니다.
 *
 * 행동 우선순위:
 * 1. (최우선) 스킬 사용: 사용 가능한 스킬이 있다면, 이동해서라도 반드시 사용을 시도합니다.
 * 2. (차선) 일반 공격: 사용할 스킬이 없다면, 이동해서라도 일반 공격을 시도합니다.
 * 3. (최후) 이동만 하기: 공격이나 스킬을 사용할 경로가 없다면, 적에게 최대한 가까이 이동하고 턴을 마칩니다.
 */
function createMeleeAI(engines = {}) {
    const rootNode = new SequenceNode([
        // [1단계] 유효한 타겟 설정 (없으면 새로 찾기)
        new SelectorNode([
            new IsTargetValidNode(),
            new FindPreferredTargetNode(engines),
        ]),

        // [2단계] 행동 결정 (위에서부터 순서대로 시도)
        new SelectorNode([
            // (우선순위 1) 스킬 사용 시도
            new SequenceNode([
                new FindBestSkillNode(engines), // 사용 가능한 스킬 찾기
                new SelectorNode([
                    // A. 제자리에서 즉시 사용
                    new SequenceNode([
                        new IsSkillInRangeNode(engines),
                        new UseSkillNode(engines),
                    ]),
                    // B. 이동 후 사용
                    new SequenceNode([
                        new FindPathToSkillRangeNode(engines),
                        new MoveToTargetNode(engines),
                        new IsSkillInRangeNode(engines),
                        new UseSkillNode(engines),
                    ]),
                ]),
            ]),

            // (우선순위 2) 일반 공격 시도
            new SequenceNode([
                 // A. 제자리에서 즉시 공격
                new SequenceNode([
                    new IsTargetInRangeNode(),
                    new AttackTargetNode(engines),
                ]),
                // B. 이동 후 공격
                new SequenceNode([
                    new FindPathToTargetNode(engines),
                    new MoveToTargetNode(engines),
                    new IsTargetInRangeNode(),
                    new AttackTargetNode(engines),
                ]),
            ]),
            
            // (우선순위 3) 이동만 하고 턴 종료
            new SequenceNode([
                new FindPathToTargetNode(engines), // 이동할 경로를 찾고
                new MoveToTargetNode(engines),     // 이동만 실행
            ]),

            // (최후의 보루) 아무것도 할 수 없을 때 성공으로 턴 종료
            new SuccessNode(),
        ]),
    ]);

    return new BehaviorTree(rootNode);
}

export { createMeleeAI };
