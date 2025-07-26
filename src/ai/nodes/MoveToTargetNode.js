import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { formationEngine } from '../../game/utils/FormationEngine.js';
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

        if (!path) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '경로가 없음');
            return NodeState.FAILURE;
        }

        if (path.length === 0) {
            debugAIManager.logNodeResult(NodeState.SUCCESS, '이미 목표 위치에 있음');
            return NodeState.SUCCESS;
        }

        const movePath = path.slice(0, movementRange);
        if (movePath.length === 0) {
            return NodeState.SUCCESS;
        }

        // ✨ [핵심 수정] 블랙보드에서 현재 스킬 정보를 가져옵니다.
        const skillData = blackboard.get('currentSkillData');
        const instanceId = blackboard.get('currentSkillInstanceId');

        // 스킬 사용을 SkillEngine에 기록합니다 (자원 소모 등).
        if (skillData) {
            skillEngine.recordSkillUse(unit, skillData);
        }

        // ✨ [핵심 추가] AIManager가 알 수 있도록 블랙보드에도 스킬 사용을 기록합니다.
        if (instanceId) {
            const usedSkills = blackboard.get('usedSkillsThisTurn') || new Set();
            usedSkills.add(instanceId);
            blackboard.set('usedSkillsThisTurn', usedSkills);
        }

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

        debugMoveManager.logMoveAction(unit, movePath);

        // 이동 완료 플래그 설정
        blackboard.set('hasMovedThisTurn', true);

        debugAIManager.logNodeResult(NodeState.SUCCESS);
        return NodeState.SUCCESS;
    }
}
export default MoveToTargetNode;
