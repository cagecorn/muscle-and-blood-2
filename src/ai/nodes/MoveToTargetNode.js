import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { formationEngine } from '../../game/utils/FormationEngine.js';
// ✨ [신규] DebugMoveManager를 import 합니다.
import { debugMoveManager } from '../../game/debug/DebugMoveManager.js';
import { skillInventoryManager } from '../../game/utils/SkillInventoryManager.js';
import { skillEngine } from '../../game/utils/SkillEngine.js';

class MoveToTargetNode extends Node {
    constructor({ animationEngine, cameraControl }) {
        super();
        this.animationEngine = animationEngine;
        this.cameraControl = cameraControl;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const path = blackboard.get('movementPath');
        const movementRange = unit.finalStats.movement || 3;

        // ✨ [수정] 경로가 없는 경우(null)와 이미 도착한 경우(빈 배열)를 분리해서 처리합니다.
        if (!path) { // 경로 탐색 실패
            debugAIManager.logNodeResult(NodeState.FAILURE, '경로가 없음');
            return NodeState.FAILURE;
        }

        if (path.length === 0) { // 이미 목표 위치에 도달함
            debugAIManager.logNodeResult(NodeState.SUCCESS, '이미 목표 위치에 있음');
            return NodeState.SUCCESS;
        }

        // 이동력만큼만 경로를 잘라냅니다.
        const movePath = path.slice(0, movementRange);
        if (movePath.length === 0) {
            return NodeState.SUCCESS;
        }

        // ✨ [신규] 이동 실행 전 이동 스킬(0번 슬롯)을 사용 처리합니다.
        // 이 노드는 0번 슬롯 스킬의 결과로 실행되므로, 여기서 자원을 소모하는 것이 타당합니다.
        const skillData = skillInventoryManager.getSkillData('move');
        skillEngine.recordSkillUse(unit, skillData);

        // 현재 위치의 점유 상태를 해제합니다.
        const originalCell = formationEngine.grid.getCell(unit.gridX, unit.gridY);
        if (originalCell) {
            originalCell.isOccupied = false;
            originalCell.sprite = null;
        }

        // 경로를 따라 한 칸씩 이동합니다.
        for (const step of movePath) {
            const targetCell = formationEngine.grid.getCell(step.col, step.row);
            if (targetCell) {
                await this.animationEngine.moveTo(
                    unit.sprite,
                    targetCell.x,
                    targetCell.y,
                    200,
                    () => {
                        if (this.cameraControl && unit.sprite.active) {
                            this.cameraControl.panTo(unit.sprite.x, unit.sprite.y, 0);
                        }
                    }
                );
                unit.gridX = step.col;
                unit.gridY = step.row;
            }
        }

        // 최종 위치의 점유 상태를 갱신합니다.
        const destination = movePath[movePath.length - 1];
        const finalCell = formationEngine.grid.getCell(destination.col, destination.row);
        if (finalCell) {
            finalCell.isOccupied = true;
            finalCell.sprite = unit.sprite;
        }

        // ✨ [신규] 이동 완료 후 로그를 기록합니다.
        debugMoveManager.logMoveAction(unit, movePath);

        // 이동 완료 플래그 설정
        blackboard.set('hasMovedThisTurn', true);

        debugAIManager.logNodeResult(NodeState.SUCCESS);
        return NodeState.SUCCESS;
    }
}
export default MoveToTargetNode;
