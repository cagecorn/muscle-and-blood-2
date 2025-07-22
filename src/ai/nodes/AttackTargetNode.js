import Node, { NodeState } from './Node.js';
import { combatCalculationEngine } from '../../game/utils/CombatCalculationEngine.js';
import { debugLogEngine } from '../../game/utils/DebugLogEngine.js';

/**
 * 블랙보드에 저장된 타겟을 공격하는 행동 노드입니다.
 */
class AttackTargetNode extends Node {
    async evaluate(unit, blackboard) {
        const target = blackboard.get('currentTargetUnit');
        if (!target) {
            return NodeState.FAILURE;
        }

        debugLogEngine.log('AttackTargetNode', `${unit.instanceName}이(가) ${target.instanceName}을(를) 공격합니다.`);

        const damage = combatCalculationEngine.calculateDamage(unit, target);
        target.currentHp -= damage;

        console.log(`[Attack] ${target.instanceName}이(가) ${damage}의 피해를 입었습니다. 남은 체력: ${target.currentHp}`);

        if (target.currentHp <= 0) {
            console.log(`[Attack] ${target.instanceName}이(가) 쓰러졌습니다!`);
        }

        return NodeState.SUCCESS;
    }
}

export default AttackTargetNode;
