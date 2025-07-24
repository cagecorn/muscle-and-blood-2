import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import IsTargetValidNode from '../nodes/IsTargetValidNode.js';
import FindPreferredTargetNode from '../nodes/FindPreferredTargetNode.js';
import IsTargetInRangeNode from '../nodes/IsTargetInRangeNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import IsTargetTooCloseNode from '../nodes/IsTargetTooCloseNode.js';
import FindKitingPositionNode from '../nodes/FindKitingPositionNode.js';
import SuccessNode from '../nodes/SuccessNode.js';
// ✨ [추가] '공격' 스킬을 사용하기 위해 필요한 노드들을 import합니다.
import FindBestSkillNode from '../nodes/FindBestSkillNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';

/**
 * 원거리 유닛(거너)을 위한 카이팅 행동 트리를 생성합니다.
 * 행동 로직:
 * 1. 생존: 가장 가까운 적이 위험 거리 안에 있으면 카이팅 위치로 후퇴 후 가능하다면 공격한다.
 * 2. 타겟팅: 사거리 내의 적 중 체력이 가장 낮은 대상을 우선 삼고, 없다면 가장 가까운 적을 선택한다.
 * 3. 공격: 사거리 내에 있으면 즉시 공격하고, 사거리 밖이면 이동 후 공격을 시도한다.
 * @param {object} engines - AI 노드들이 사용할 엔진 및 매니저 모음
 * @returns {BehaviorTree}
 */
function createRangedAI(engines) {
    // ✨ '공격' 스킬을 찾아 사용하는 시퀀스를 정의합니다.
    const attackWithSkill = new SequenceNode([
        new FindBestSkillNode(engines), // '공격' 스킬을 찾습니다.
        new UseSkillNode(engines),      // 찾은 스킬로 공격합니다.
    ]);

    const rootNode = new SequenceNode([
        // 단계 1: 유효한 타겟 설정 (사거리 내의 체력이 낮은 적을 우선)
        new SelectorNode([
            new IsTargetValidNode(),
            new FindPreferredTargetNode(engines),
        ]),
        // 단계 2: 상황에 따른 행동 결정
        new SelectorNode([
            // 2a. (최우선) 생존: "가장 가까운 적"이 너무 가까우면 카이팅 위치로 이동
            new SequenceNode([
                new IsTargetTooCloseNode({ ...engines, dangerZone: 2 }),
                new FindKitingPositionNode(engines),
                new MoveToTargetNode(engines),
                new SelectorNode([
                    new SequenceNode([
                        new IsTargetInRangeNode(),
                        // ✨ [수정] AttackTargetNode 대신 새로운 공격 시퀀스 사용
                        attackWithSkill,
                    ]),
                    new SuccessNode(),
                ]),
            ]),
            // 2b. 공격: 사거리 내에 있으면 즉시 공격
            new SequenceNode([
                new IsTargetInRangeNode(),
                // ✨ [수정] AttackTargetNode 대신 새로운 공격 시퀀스 사용
                attackWithSkill,
            ]),
            // 2c. 이동 후 공격: 사거리 밖이면 적절한 위치로 이동 후 공격
            new SequenceNode([
                new FindPathToTargetNode(engines),
                new MoveToTargetNode(engines),
                new SelectorNode([
                    new SequenceNode([
                        new IsTargetInRangeNode(),
                        // ✨ [수정] AttackTargetNode 대신 새로운 공격 시퀀스 사용
                        attackWithSkill,
                    ]),
                    new SuccessNode(),
                ]),
            ]),
            // 2d. 어떤 행동도 할 수 없을 때
            new SuccessNode(),
        ]),
    ]);

    return new BehaviorTree(rootNode);
}

export { createRangedAI };
