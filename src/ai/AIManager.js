import { debugLogEngine } from '../game/utils/DebugLogEngine.js';

/**
 * 게임 내 모든 AI 유닛을 관리하고, 각 유닛의 행동 트리를 실행합니다.
 */
class AIManager {
    constructor() {
        // key: unit.uniqueId, value: { instance: unit, behaviorTree: tree }
        this.unitData = new Map();
        debugLogEngine.log('AIManager', 'AI 매니저가 초기화되었습니다.');
    }

    /**
     * 등록된 모든 AI 유닛 정보를 초기화합니다.
     */
    clear() {
        this.unitData.clear();
        debugLogEngine.log('AIManager', '모든 AI 유닛 데이터가 초기화되었습니다.');
    }

    /**
     * 새로운 AI 유닛과 해당 유닛이 사용할 행동 트리를 등록합니다.
     * @param {object} unitInstance - AI에 의해 제어될 유닛
     * @param {BehaviorTree} behaviorTree - 이 유닛이 사용할 BehaviorTree 인스턴스
     */
    registerUnit(unitInstance, behaviorTree) {
        if (!unitInstance || !unitInstance.uniqueId || this.unitData.has(unitInstance.uniqueId)) {
            debugLogEngine.warn('AIManager', '이미 등록되었거나 유효하지 않은 유닛입니다.');
            return;
        }

        this.unitData.set(unitInstance.uniqueId, {
            instance: unitInstance,
            behaviorTree: behaviorTree,
        });
        debugLogEngine.log('AIManager', `유닛 ID ${unitInstance.uniqueId} (${unitInstance.instanceName}) 등록 완료.`);
    }

    /**
     * 특정 유닛의 턴을 실행합니다.
     * @param {object} unit - 턴을 실행할 유닛
     * @param {Array<object>} allUnits - 전장의 모든 유닛
     * @param {Array<object>} enemyUnits - 해당 유닛의 적 목록
     */
    async executeTurn(unit, allUnits, enemyUnits) {
        const data = this.unitData.get(unit.uniqueId);
        if (!data) return;

        // 턴 시작 시 블랙보드 플래그 초기화
        data.behaviorTree.blackboard.set('hasMovedThisTurn', false);
        data.behaviorTree.blackboard.set('usedSkillsThisTurn', new Set());

        console.group(`[AIManager] --- ${data.instance.instanceName} (ID: ${unit.uniqueId}) 턴 시작 ---`);

        await data.behaviorTree.execute(unit, allUnits, enemyUnits);

        console.groupEnd();
    }
}

// 싱글턴으로 관리
export const aiManager = new AIManager();
