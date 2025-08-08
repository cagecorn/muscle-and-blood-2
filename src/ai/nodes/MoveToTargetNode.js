// src/ai/nodes/MoveToTargetNode.js

import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { gameSystem } from '../../game/GameSystem.js'; // GameSystem을 통해 엔진에 접근

class MoveToTargetNode extends Node {
    constructor() {
        super();
        // 생성자에서 직접 엔진을 참조하지 않고, 필요할 때 GameSystem을 통해 가져옵니다.
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);

        // 이제 'movementPath'에는 경로가 아닌 최종 목적지 {col, row}가 담겨 있습니다.
        const destination = blackboard.get('movementPath');

        // 1. 데이터 유효성 검사
        if (!destination) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '이동 목적지 없음');
            return NodeState.FAILURE;
        }

        const startPos = { col: unit.gridX, row: unit.gridY };

        // 2. 이미 목적지에 있는지 확인
        if (startPos.col === destination.col && startPos.row === destination.row) {
            debugAIManager.logNodeResult(NodeState.SUCCESS, '이동 불필요, 이미 목적지에 있음');
            return NodeState.SUCCESS; // 이동이 필요 없으므로 성공 처리
        }

        // 3. 이 노드가 직접 경로를 탐색하도록 수정
        // GameSystem을 통해 pathfinderEngine에 접근합니다.
        const path = await gameSystem.pathfinderEngine.findPath(startPos, destination);

        if (!path || path.length <= 1) { // 경로가 없거나, 시작점만 있는 경우
            debugAIManager.logNodeResult(NodeState.FAILURE, '목적지까지의 유효한 경로 없음');
            return NodeState.FAILURE;
        }

        // 4. 유닛 이동 실행 (GameSystem을 통해 scene의 메서드 호출)
        try {
            // 경로의 첫 번째 지점은 현재 위치이므로 제외하고 실제 이동 경로를 전달
            const movementPath = path.slice(1);
            await gameSystem.scene.moveUnitAlongPath(unit, movementPath);

            // 이동 후 유닛 상태는 moveUnitAlongPath 내부에서 업데이트된다고 가정합니다.
            // 만약 자동으로 업데이트되지 않는다면 아래 코드가 필요합니다.
            // const finalPos = path[path.length - 1];
            // unit.gridX = finalPos.col;
            // unit.gridY = finalPos.row;

            debugAIManager.logNodeResult(NodeState.SUCCESS, '목적지로 이동 완료');
            return NodeState.SUCCESS;
        } catch (error) {
            console.error('MoveToTargetNode에서 유닛 이동 중 오류 발생:', error);
            debugAIManager.logNodeResult(NodeState.FAILURE, '유닛 이동 중 오류');
            return NodeState.FAILURE;
        }
    }
}

export default MoveToTargetNode;
