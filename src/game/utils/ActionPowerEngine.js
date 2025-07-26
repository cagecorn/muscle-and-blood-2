import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 전투 중 유닛의 행동력(AP)을 관리하는 엔진 (싱글턴)
 */
class ActionPowerEngine {
    constructor() {
        this.actionPowerData = new Map();
        this.maxActionPower = 10; // 최대 행동력 보유량 (나노술사를 위해)
        debugLogEngine.log('ActionPowerEngine', '행동력 엔진이 초기화되었습니다.');
    }

    /**
     * 전투 시작 시 모든 유닛의 행동력 정보를 등록하고 초기화합니다.
     */
    initializeUnits(units) {
        this.actionPowerData.clear();
        units.forEach(unit => {
            this.actionPowerData.set(unit.uniqueId, {
                currentPower: 0,
                unitName: unit.instanceName
            });
        });
    }

    /**
     * 새로운 턴이 시작될 때 모든 유닛에게 행동력 1을 지급합니다.
     */
    addForNewTurn() {
        for (const [unitId, data] of this.actionPowerData.entries()) {
            if (data.currentPower < this.maxActionPower) {
                data.currentPower += 1;
                // TODO: DebugActionPowerManager 만들어서 로그 남기기
            }
        }
    }

    /**
     * 특정 유닛의 행동력을 사용합니다.
     */
    spend(unitId, amount) {
        const data = this.actionPowerData.get(unitId);
        if (data && data.currentPower >= amount) {
            data.currentPower -= amount;
            // TODO: DebugActionPowerManager 만들어서 로그 남기기
            return true;
        }
        return false;
    }

    /**
     * 특정 유닛의 현재 행동력을 반환합니다.
     */
    getActionPower(unitId) {
        return this.actionPowerData.get(unitId)?.currentPower || 0;
    }
}

export const actionPowerEngine = new ActionPowerEngine();
