import { debugLogEngine } from './DebugLogEngine.js';

class ComboManager {
    constructor() {
        this.name = 'ComboManager';
        // key: attackerId, value: { targetId, count }
        this.comboData = new Map();
        this.comboVFX = null;
        debugLogEngine.log(this.name, '콤보 매니저가 초기화되었습니다.');
    }

    startTurn(unitId) {
        this.comboData.set(unitId, { targetId: null, count: 0 });
        if (this.comboVFX) {
            this.comboVFX.destroy();
            this.comboVFX = null;
        }
    }

    recordAttack(attackerId, targetId) {
        const current = this.comboData.get(attackerId) || { targetId: null, count: 0 };
        if (current.targetId === targetId) {
            current.count++;
        } else {
            current.targetId = targetId;
            current.count = 1;
        }
        this.comboData.set(attackerId, current);
        debugLogEngine.log(this.name, `유닛 ${attackerId} -> ${targetId}, 콤보: ${current.count}`);
        return current.count;
    }

    getDamageMultiplier(comboCount) {
        if (comboCount <= 1) return 1.0;
        return Math.max(0.7, 1.0 - (comboCount - 1) * 0.1);
    }
}

export const comboManager = new ComboManager();
