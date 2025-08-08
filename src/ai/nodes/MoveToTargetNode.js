// src/ai/nodes/MoveToTargetNode.js

import Node, { NodeState } from './Node.js';
import { debugLogEngine } from '../../game/utils/DebugLogEngine.js';
// ✨ GameSystem을 통해 다른 엔진에 안전하게 접근합니다.
import { gameSystem } from '../../game/GameSystem.js';

class MoveToTargetNode extends Node {
    constructor() {
        super();
        // 생성자에서 직접 엔진을 참조하지 않고, 필요할 때 GameSystem을 통해 가져옵니다.
    }

    async evaluate(unit, blackboard) {
        debugLogEngine.logNodeEvaluation(this, unit);

        // 'movementPath' 블랙보드 값은 이제 경로가 아니라 최종 목적지 {col, row} 입니다.
        const destination = blackboard.get('movementPath');

        // 1. 데이터 유효성 검사
        if (!destination || typeof destination.col === 'undefined' || typeof destination.row === 'undefined') {
            debugLogEngine.logNodeResult(NodeState.FAILURE, '유효하지 않은 이동 목적지');
            return NodeState.FAILURE;
        }

        const startPos = { col: unit.gridX, row: unit.gridY };

        // 2. 이미 목적지에 있는지 확인 (이동이 불필요한 경우)
        if (startPos.col === destination.col && startPos.row === destination.row) {
            debugLogEngine.logNodeResult(NodeState.SUCCESS, '이동 불필요, 이미 목적지에 있음');
            return NodeState.SUCCESS;
        }

        // 3. 경로 탐색 (PathfinderEngine.js의 함수 시그니처에 맞게 호출)
        const path = await gameSystem.pathfinderEngine.findPath(unit, startPos, destination);

        // 4. 경로 유효성 검사 (경로가 배열이 아니거나 비어있으면 실패 처리)
        if (!path || !Array.isArray(path) || path.length === 0) {
            debugLogEngine.logNodeResult(
                NodeState.FAILURE,
                `목적지까지의 경로 없음: (${startPos.col},${startPos.row}) -> (${destination.col},${destination.row})`
            );
            return NodeState.FAILURE;
        }

        // 5. 유닛 이동 실행
        try {
            // path.slice(1)은 시작점(현재 위치)을 제외한 실제 이동 경로입니다.
            // 이제 path는 항상 배열이므로 이 라인에서 에러가 발생하지 않습니다.
            const movementSteps = path.slice(1);

            // 유닛 이동 명령
            await gameSystem.scene.moveUnitAlongPath(unit, movementSteps);

            debugLogEngine.logNodeResult(NodeState.SUCCESS, '목적지로 이동 완료');
            return NodeState.SUCCESS;
        } catch (error) {
            // moveUnitAlongPath 함수 자체에서 에러가 발생할 경우를 대비한 방어 코드
            console.error('MoveToTargetNode에서 유닛 이동 중 오류 발생:', error);
            debugLogEngine.logNodeResult(NodeState.FAILURE, '유닛 이동 중 심각한 오류 발생');
            return NodeState.FAILURE;
        }
    }
}

export default MoveToTargetNode;

