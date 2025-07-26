import { debugLogEngine } from './DebugLogEngine.js';

/**
 * \uac01 \uc720\ub2c8\uac00 \ud574\ub2f9 \ud134\uc5d0 \uc774\ub3d9\ud588\ub294\uc9c0 \uc5d0\ub7ec\ub9ac\ub9c1\ud558\ub294 \ub9e4\ub2c8\uc800 (\uc2f1\uae00\ud134)
 */
class MovementTrackerManager {
    constructor() {
        this.hasMovedThisTurn = new Map();
        debugLogEngine.log('MovementTrackerManager', '이동 추적 매니저가 초기화되었습니다.');
    }

    /**
     * \uc804\ud22c \uc2dc\uc791 \uc2dc \ubaa8\ub4e0 \uc720\ub2c8\uc758 \uc774\ub3d9 \uc0c1\ud0dc\ub97c \ucd08\uae30\ud654\ud569\ub2c8\ub2e4.
     * @param {Array<object>} units - \uc804\ud22c \ucc38\uc5ec \uc720\ub2c8 \ubaa9\ub85d
     */
    initializeUnits(units) {
        this.hasMovedThisTurn.clear();
        units.forEach(unit => {
            this.hasMovedThisTurn.set(unit.uniqueId, false);
        });
    }

    /**
     * \uc0c8 \ud134 \uc2dc\uc791 \uc2dc \ubaa8\ub4e0 \uc720\ub2c8\uc758 \uc774\ub3d9 \uc0c1\ud0dc\ub97c 'false'\ub85c \ubaa8\ub450 \ucd08\uae30\ud654\ud569\ub2c8\ub2e4.
     */
    resetForNewTurn() {
        for (const unitId of this.hasMovedThisTurn.keys()) {
            this.hasMovedThisTurn.set(unitId, false);
        }
        debugLogEngine.log('MovementTrackerManager', '새 턴 시작, 모든 유닛 이동 기록 초기화.');
    }

    /**
     * \ud2b9\uc815 \uc720\ub2c8\uc758 \uc774\ub3d9\uc744 \uae30\ub85d\ud569\ub2c8\ub2e4.
     * @param {number} unitId - \uc774\ub3d9\ud55c \uc720\ub2c8\uc758 ID
     */
    recordMovement(unitId) {
        if (this.hasMovedThisTurn.has(unitId)) {
            this.hasMovedThisTurn.set(unitId, true);
            debugLogEngine.log('MovementTrackerManager', `유닛(ID:${unitId})의 이번 턴 이동이 기록되었습니다.`);
        }
    }

    /**
     * \ud2b9\uc815 \uc720\ub2c8\uac00 \uc774\ub2e4\uc639 \ud5c8\uc6a9\ub418\uc5c8\ub294\uc9c0 \ud655\uc778\ud569\ub2c8\ub2e4.
     * @param {number} unitId - \ud655\uc778\ud560 \uc720\ub2c8 ID
     * @returns {boolean}
     */
    hasMoved(unitId) {
        return this.hasMovedThisTurn.get(unitId) || false;
    }
}

export const movementTrackerManager = new MovementTrackerManager();
