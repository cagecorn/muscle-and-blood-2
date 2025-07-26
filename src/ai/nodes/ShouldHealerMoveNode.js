import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { actionPointEngine } from '../../game/utils/ActionPointEngine.js';
import { movementTrackerManager } from '../../game/utils/MovementTrackerManager.js';

/**
 * 힐러 유닛이 이동해야 하는지 판단하는 조건 노드.
 * 생존(카이팅) 또는 임무(치유)를 위해 이동이 필요할 때 SUCCESS를 반환합니다.
 */
class ShouldHealerMoveNode extends Node {
    constructor() {
        super();
        this.dangerZone = 3; // 힐러는 더 넓은 안전거리를 확보합니다.
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);

        // 기본 조건: 이미 움직였거나 AP가 없으면 이동 불가
        if (movementTrackerManager.hasMoved(unit.uniqueId) || actionPointEngine.getPoints(unit.uniqueId) < 1) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '이미 이동했거나 AP가 부족합니다.');
            return NodeState.FAILURE;
        }

        const allies = blackboard.get('allyUnits');
        const enemies = blackboard.get('enemyUnits');
        const healRange = 2; // (임시) 힐 스킬 기본 사거리

        // 판단 1 (생존): 위험한 적이 있는가?
        if (enemies && enemies.length > 0) {
            const isThreatened = enemies.some(enemy => {
                const distance = Math.abs(unit.gridX - enemy.gridX) + Math.abs(unit.gridY - enemy.gridY);
                return distance <= this.dangerZone;
            });
            if (isThreatened) {
                debugAIManager.logNodeResult(NodeState.SUCCESS, `적이 너무 가까워 생존을 위해 이동이 필요합니다.`);
                return NodeState.SUCCESS;
            }
        }

        // 판단 2 (임무): 치유가 필요한데 사거리가 닿지 않는 아군이 있는가?
        if (allies && allies.length > 0) {
            const woundedAllies = allies.filter(a => a.currentHp < a.finalStats.hp);
            if (woundedAllies.length > 0) {
                const isAnyWoundedAllyOutOfRange = woundedAllies.some(ally => {
                    const distance = Math.abs(unit.gridX - ally.gridX) + Math.abs(unit.gridY - ally.gridY);
                    return distance > healRange;
                });
                if (isAnyWoundedAllyOutOfRange) {
                    debugAIManager.logNodeResult(NodeState.SUCCESS, `치유할 아군이 사거리 밖에 있어 이동이 필요합니다.`);
                    return NodeState.SUCCESS;
                }
            }
        }

        // 위 모든 상황에 해당하지 않으면 이동 불필요
        debugAIManager.logNodeResult(NodeState.FAILURE, '현재 위치가 최적이므로 이동이 불필요합니다.');
        return NodeState.FAILURE;
    }
}

export default ShouldHealerMoveNode;
