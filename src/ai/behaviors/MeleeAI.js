import BehaviorTree from '../BehaviorTree.js';
import SelectorNode from '../nodes/SelectorNode.js';
import SequenceNode from '../nodes/SequenceNode.js';
import MoveToTargetNode from '../nodes/MoveToTargetNode.js';
import SuccessNode from '../nodes/SuccessNode.js';
import { NodeState } from '../nodes/Node.js';

import CanUseSkillBySlotNode from '../nodes/CanUseSkillBySlotNode.js';
import FindTargetBySkillTypeNode from '../nodes/FindTargetBySkillTypeNode.js';
import IsSkillInRangeNode from '../nodes/IsSkillInRangeNode.js';
import UseSkillNode from '../nodes/UseSkillNode.js';
import FindPathToSkillRangeNode from '../nodes/FindPathToSkillRangeNode.js';
import FindMeleeStrategicTargetNode from '../nodes/FindMeleeStrategicTargetNode.js';
import FindPathToTargetNode from '../nodes/FindPathToTargetNode.js';
import HasNotMovedNode from '../nodes/HasNotMovedNode.js';
import MBTIActionNode from '../nodes/MBTIActionNode.js';
import IsHealthBelowThresholdNode from '../nodes/IsHealthBelowThresholdNode.js';
import FleeNode from '../nodes/FleeNode.js';
import FindNearestAllyInDangerNode from '../nodes/FindNearestAllyInDangerNode.js';
import FindPathToAllyNode from '../nodes/FindPathToAllyNode.js';
import JustRecoveredFromStunNode from '../nodes/JustRecoveredFromStunNode.js';
import SetTargetToStunnerNode from '../nodes/SetTargetToStunnerNode.js';
import FindAllyClusterNode from '../nodes/FindAllyClusterNode.js';
import FindBuffedEnemyNode from '../nodes/FindBuffedEnemyNode.js';
import FindEnemyMedicNode from '../nodes/FindEnemyMedicNode.js';
import { debugMBTIManager } from '../../game/debug/DebugMBTIManager.js';

function createMeleeAI(engines = {}) {
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

    const survivalBehavior = new SequenceNode([
        new IsHealthBelowThresholdNode(0.35),
        {
            async evaluate(unit) {
                debugMBTIManager.logDecisionStart('생존 본능 발동', unit);
                return NodeState.SUCCESS;
            }
        },
        new SelectorNode([
            new SequenceNode([
                new MBTIActionNode('I'),
                { async evaluate() { debugMBTIManager.logAction('후퇴 선택'); return NodeState.SUCCESS; } },
                new FleeNode(engines),
                new MoveToTargetNode(engines)
            ]),
            new SequenceNode([
                new MBTIActionNode('E'),
                { async evaluate() { debugMBTIManager.logAction('최후의 발악 선택'); return NodeState.SUCCESS; } },
                new CanUseSkillBySlotNode(0),
                new FindTargetBySkillTypeNode(engines),
                new UseSkillNode(engines)
            ]),
            new SuccessNode()
        ]),
        { async evaluate() { debugMBTIManager.logDecisionEnd(); return NodeState.SUCCESS; } }
    ]);

    const postStunRecoveryBehavior = new SequenceNode([
        new JustRecoveredFromStunNode(),
        {
            async evaluate(unit) {
                debugMBTIManager.logDecisionStart('기절 회복 후 반응', unit);
                return NodeState.SUCCESS;
            }
        },
        new SelectorNode([
            new SequenceNode([
                new MBTIActionNode('S'),
                { async evaluate() { debugMBTIManager.logAction('복수 선택 (S)'); return NodeState.SUCCESS; } },
                new SetTargetToStunnerNode(),
                new CanUseSkillBySlotNode(3),
                new FindPathToSkillRangeNode(engines),
                new MoveToTargetNode(engines),
                new IsSkillInRangeNode(engines),
                new UseSkillNode(engines)
            ]),
            new SequenceNode([
                new MBTIActionNode('J'),
                { async evaluate() { debugMBTIManager.logAction('위치 정비 선택 (J)'); return NodeState.SUCCESS; } },
                new HasNotMovedNode(),
                new FleeNode(engines),
                new MoveToTargetNode(engines)
            ]),
            new SuccessNode()
        ]),
        { async evaluate() { debugMBTIManager.logDecisionEnd(); return NodeState.SUCCESS; } }
    ]);

    const allyCareBehavior = new SequenceNode([
        new FindNearestAllyInDangerNode(),
        {
            async evaluate(unit) {
                debugMBTIManager.logDecisionStart('아군 보호 판단', unit);
                return NodeState.SUCCESS;
            }
        },
        new SelectorNode([
            new SequenceNode([
                new MBTIActionNode('F'),
                { async evaluate() { debugMBTIManager.logAction('아군에게 이동'); return NodeState.SUCCESS; } },
                new HasNotMovedNode(),
                new FindPathToAllyNode(engines),
                new MoveToTargetNode(engines)
            ]),
            new SuccessNode()
        ]),
        { async evaluate() { debugMBTIManager.logDecisionEnd(); return NodeState.SUCCESS; } }
    ]);

    // 상황 1: 아군 밀집 시 대응
    const allyClusterResponse = new SequenceNode([
        new FindAllyClusterNode(),
        new SelectorNode([
            new SequenceNode([
                new MBTIActionNode('J'),
                { async evaluate() { debugMBTIManager.logAction('진형 합류 선택 (J)'); return NodeState.SUCCESS; } },
                new HasNotMovedNode(),
                new FindPathToAllyNode(engines),
                new MoveToTargetNode(engines)
            ]),
            new SequenceNode([
                new MBTIActionNode('P'),
                { async evaluate() { debugMBTIManager.logAction('위험 분산 선택 (P)'); return NodeState.SUCCESS; } },
                new HasNotMovedNode(),
                new FleeNode(engines),
                new MoveToTargetNode(engines)
            ]),
            new SuccessNode()
        ])
    ]);

    // 상황 2: 적이 위협 버프 사용 시 대응
    const enemyBuffResponse = new SequenceNode([
        new FindBuffedEnemyNode(),
        new SelectorNode([
            new SequenceNode([
                new MBTIActionNode('S'),
                { async evaluate(unit, blackboard) {
                    const target = blackboard.get('buffedEnemy');
                    blackboard.set('skillTarget', target);
                    debugMBTIManager.logAction('위협 집중 타격 (S)');
                    return NodeState.SUCCESS;
                }},
                new CanUseSkillBySlotNode(3),
                executeSkillBranch
            ]),
            new SequenceNode([
                new MBTIActionNode('T'),
                { async evaluate(unit, blackboard) {
                    const target = blackboard.get('buffedEnemy');
                    blackboard.set('skillTarget', target);
                    debugMBTIManager.logAction('디버프로 대응 (T)');
                    return NodeState.SUCCESS;
                }},
                new CanUseSkillBySlotNode(2),
                executeSkillBranch
            ]),
            new SequenceNode([
                new MBTIActionNode('F'),
                { async evaluate() { debugMBTIManager.logAction('아군 보호 태세 (F)'); return NodeState.SUCCESS; } },
                new CanUseSkillBySlotNode(1),
                new FindTargetBySkillTypeNode(engines),
                executeSkillBranch
            ]),
            new SequenceNode([
                new MBTIActionNode('N'),
                { async evaluate() { debugMBTIManager.logAction('원래 목표 유지 (N)'); return NodeState.SUCCESS; } },
                { async evaluate() { return NodeState.FAILURE; } }
            ]),
            new SuccessNode()
        ])
    ]);

    // 상황 3: 적 메딕 발견 시 대응
    const enemyMedicResponse = new SequenceNode([
        new FindEnemyMedicNode(),
        new SelectorNode([
            new SequenceNode([
                new MBTIActionNode('E'),
                { async evaluate(unit, blackboard) {
                    const target = blackboard.get('enemyMedic');
                    blackboard.set('skillTarget', target);
                    debugMBTIManager.logAction('메딕 돌격 제거 (E)');
                    return NodeState.SUCCESS;
                }},
                new CanUseSkillBySlotNode(3),
                executeSkillBranch
            ]),
            new SequenceNode([
                new MBTIActionNode('I'),
                { async evaluate(unit, blackboard) {
                    if (Math.random() < 0.5) {
                        const target = blackboard.get('enemyMedic');
                        blackboard.set('skillTarget', target);
                        debugMBTIManager.logAction('메딕 신중하게 공격 (I)');
                        return NodeState.SUCCESS;
                    }
                    debugMBTIManager.logAction('메딕 공격 안함 (I)');
                    return NodeState.FAILURE;
                }},
                new CanUseSkillBySlotNode(3),
                executeSkillBranch
            ]),
            new SuccessNode()
        ])
    ]);

    const attackSequence = new SelectorNode([
        new SequenceNode([ new CanUseSkillBySlotNode(0), new FindTargetBySkillTypeNode(engines), executeSkillBranch ]),
        new SequenceNode([ new CanUseSkillBySlotNode(1), new FindTargetBySkillTypeNode(engines), executeSkillBranch ]),
        new SequenceNode([ new CanUseSkillBySlotNode(2), new FindTargetBySkillTypeNode(engines), executeSkillBranch ]),
        new SequenceNode([ new CanUseSkillBySlotNode(3), new FindTargetBySkillTypeNode(engines), executeSkillBranch ]),
        new SequenceNode([ new CanUseSkillBySlotNode(4), new FindTargetBySkillTypeNode(engines), executeSkillBranch ]),
        new SequenceNode([ new CanUseSkillBySlotNode(5), new FindTargetBySkillTypeNode(engines), executeSkillBranch ]),
        new SequenceNode([ new CanUseSkillBySlotNode(6), new FindTargetBySkillTypeNode(engines), executeSkillBranch ]),
        new SequenceNode([ new CanUseSkillBySlotNode(7), new FindTargetBySkillTypeNode(engines), executeSkillBranch ])
    ]);

    const basicMovement = new SequenceNode([
        new HasNotMovedNode(),
        new FindMeleeStrategicTargetNode(engines),
        new FindPathToTargetNode(engines),
        new MoveToTargetNode(engines)
    ]);

    const rootNode = new SelectorNode([
        survivalBehavior,
        postStunRecoveryBehavior,
        enemyBuffResponse,
        enemyMedicResponse,
        allyClusterResponse,
        allyCareBehavior,
        attackSequence,
        basicMovement,
        new SuccessNode()
    ]);

    return new BehaviorTree(rootNode);
}

export { createMeleeAI };
