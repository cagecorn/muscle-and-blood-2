// js/managers/ClassAIManager.js

export class ClassAIManager {
    constructor(idManager, battleSimulationManager, measureManager, basicAIManager) {
        console.log("\ud83d\udcbb ClassAIManager initialized. Ready to define class-based AI. \ud83d\udcbb");
        this.idManager = idManager;
        this.battleSimulationManager = battleSimulationManager;
        this.measureManager = measureManager;
        this.basicAIManager = basicAIManager;
    }

    /**
     * 주어진 유닛의 클래스에 따른 기본 행동을 결정합니다.
     * @param {object} unit - 현재 턴을 진행하는 유닛 (fullUnitData 포함)
     * @param {object[]} allUnits - 현재 전장에 있는 모든 유닛
     * @returns {{actionType: string, targetId?: string, moveTargetX?: number, moveTargetY?: number} | null}
     */
    async getBasicClassAction(unit, allUnits) {
        const unitClass = await this.idManager.get(unit.classId);
        if (!unitClass) {
            console.warn(`[ClassAIManager] Class data not found for unit ${unit.name} (${unit.classId}). Cannot determine action.`);
            return null;
        }

        switch (unitClass.id) {
            case 'class_warrior':
                return this._getWarriorAction(unit, allUnits, unitClass);
            default:
                console.warn(`[ClassAIManager] No specific AI defined for class: ${unitClass.name} (${unitClass.id}).`);
                const defaultMoveRange = unitClass.moveRange || 1;
                const defaultAttackRange = unitClass.attackRange || 1;
                return this.basicAIManager.determineMoveAndTarget(unit, allUnits, defaultMoveRange, defaultAttackRange);
        }
    }

    /**
     * 전사 클래스의 AI 로직을 구현합니다. 가까운 적에게 근접하여 공격합니다.
     * @param {object} warriorUnit
     * @param {object[]} allUnits
     * @param {object} warriorClassData
     * @returns {{actionType: string, targetId?: string, moveTargetX?: number, moveTargetY?: number}}
     */
    _getWarriorAction(warriorUnit, allUnits, warriorClassData) {
        const moveRange = warriorClassData.moveRange || 1;
        const attackRange = 1;

        const action = this.basicAIManager.determineMoveAndTarget(warriorUnit, allUnits, moveRange, attackRange);

        return action;
    }
}
