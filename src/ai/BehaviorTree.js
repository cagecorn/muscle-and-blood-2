import Blackboard from './Blackboard.js';
import { debugLogEngine } from '../game/utils/DebugLogEngine.js';

/**
 * 행동 트리와 블랙보드를 함께 캡슐화하는 클래스입니다.
 */
class BehaviorTree {
    /**
     * @param {Node} rootNode - 행동 트리의 최상위 루트 노드
     */
    constructor(rootNode) {
        this.root = rootNode;
        this.blackboard = new Blackboard();
        debugLogEngine.log('BehaviorTree', '새로운 행동 트리가 생성되었습니다.');
    }

    /**
     * 이 행동 트리의 한 턴을 실행합니다.
     * @param {object} unit - 이 트리를 실행하는 유닛
     * @param {Array<object>} allUnits - 전장에 있는 모든 유닛 목록
     * @param {Array<object>} enemyUnits - 적 유닛 목록
     */
    async execute(unit, allUnits, enemyUnits) {
        // 매 턴 시작 시, 블랙보드에 최신 전장 정보를 업데이트합니다.
        this.blackboard.set('allUnits', allUnits);
        this.blackboard.set('enemyUnits', enemyUnits);

        // 루트 노드부터 평가를 시작합니다.
        await this.root.evaluate(unit, this.blackboard);
    }
}

export default BehaviorTree;
