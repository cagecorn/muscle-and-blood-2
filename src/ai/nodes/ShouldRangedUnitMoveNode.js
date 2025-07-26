import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { actionPointEngine } from '../../game/utils/ActionPointEngine.js';
import { movementTrackerManager } from '../../game/utils/MovementTrackerManager.js';
import { targetManager } from '../../game/utils/TargetManager.js';

/**
 * 원거리 유닛이 이동해야 하는지 판단하는 조건 노드.
 * 카이팅(후퇴) 또는 교전(접근)이 필요할 때 SUCCESS를 반환합니다.
 */
class ShouldRangedUnitMoveNode extends Node {
    constructor() {
        super();
        this.dangerZone = 2; // 이 거리 안으로 적이 들어오면 위험하다고 판단
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);

        // 기본 조건: 이미 움직였거나 AP가 없으면 이동 불가
        if (movementTrackerManager.hasMoved(unit.uniqueId) || actionPointEngine.getPoints(unit.uniqueId) < 1) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '이미 이동했거나 AP가 부족합니다.');
            return NodeState.FAILURE;
        }

        const enemyUnits = blackboard.get('enemyUnits');
        if (!enemyUnits || enemyUnits.length === 0) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '주변에 적이 없어 이동이 불필요합니다.');
            return NodeState.FAILURE;
        }

        // 판단 1: 카이팅이 필요한가? (적이 너무 가까운가?)
        const nearestEnemy = targetManager.findNearestEnemy(unit, enemyUnits);
        if (nearestEnemy) {
            const distance = Math.abs(unit.gridX - nearestEnemy.gridX) + Math.abs(unit.gridY - nearestEnemy.gridY);
            if (distance <= this.dangerZone) {
                blackboard.set('threateningUnit', nearestEnemy); // 카이팅 대상을 블랙보드에 기록
                debugAIManager.logNodeResult(NodeState.SUCCESS, `적이 위험지역 내에 있어 카이팅이 필요합니다.`);
                return NodeState.SUCCESS;
            }
        }

        // 판단 2: 교전이 필요한가? (모든 적이 사거리 밖에 있는가?)
        const attackRange = unit.finalStats.attackRange || 3;
        const enemiesInRange = enemyUnits.filter(e => {
            const distance = Math.abs(unit.gridX - e.gridX) + Math.abs(unit.gridY - e.gridY);
            return e.currentHp > 0 && distance <= attackRange;
        });

        if (enemiesInRange.length === 0) {
            debugAIManager.logNodeResult(NodeState.SUCCESS, '모든 적이 사거리 밖에 있어 교전을 위해 이동이 필요합니다.');
            return NodeState.SUCCESS;
        }

        // 위 모든 상황에 해당하지 않으면, 현재 위치가 최적이므로 이동 불필요
        debugAIManager.logNodeResult(NodeState.FAILURE, '현재 위치가 최적이므로 이동이 불필요합니다.');
        return NodeState.FAILURE;
    }
}

export default ShouldRangedUnitMoveNode;
