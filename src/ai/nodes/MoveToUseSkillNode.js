import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { getReachableTiles } from '../../game/utils/GridEngine.js';
import MoveToTargetNode from './MoveToTargetNode.js';

class MoveToUseSkillNode extends Node {
    constructor(engines = {}) {
        super();
        this.pathfinderEngine = engines.pathfinderEngine;
        this.formationEngine = engines.formationEngine;
        this.moveNode = new MoveToTargetNode(engines);
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const skill = blackboard.get('currentSkillData');
        const target = blackboard.get('skillTarget');
        if (!skill || !target) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '스킬 또는 타겟 없음');
            return NodeState.FAILURE;
        }

        const skillRange = skill.range ?? 1;
        const moveRange = unit.finalStats.movement || 0;
        const start = { col: unit.gridX, row: unit.gridY };
        const targetPos = { col: target.gridX, row: target.gridY };

        const reachableTiles = getReachableTiles(start, moveRange, this.formationEngine.grid);

        const potentialDestinations = [];
        for (const tile of reachableTiles) {
            const distance = Math.abs(tile.col - targetPos.col) + Math.abs(tile.row - targetPos.row);
            if (distance <= skillRange) {
                const pathLength = Math.abs(tile.col - start.col) + Math.abs(tile.row - start.row);
                potentialDestinations.push({ tile, distance, pathLength });
            }
        }

        if (potentialDestinations.length === 0) {
            debugAIManager.logNodeResult(NodeState.FAILURE, `스킬 [${skill.name}] 사용 위치 없음`);
            return NodeState.FAILURE;
        }

        potentialDestinations.sort((a, b) => {
            if (a.pathLength !== b.pathLength) {
                return a.pathLength - b.pathLength;
            }
            return a.distance - b.distance;
        });

        const best = potentialDestinations[0].tile;
        const path = this.pathfinderEngine.findPath(unit, start, { col: best.col, row: best.row });

        if (path) {
            blackboard.set('movementPath', path);
            const result = await this.moveNode.evaluate(unit, blackboard);
            if (result === NodeState.SUCCESS) {
                debugAIManager.logNodeResult(NodeState.SUCCESS, `스킬 [${skill.name}] 사용 위치로 이동`);
                return NodeState.SUCCESS;
            }
        }

        debugAIManager.logNodeResult(NodeState.FAILURE, '경로 탐색 실패');
        return NodeState.FAILURE;
    }
}

export default MoveToUseSkillNode;
