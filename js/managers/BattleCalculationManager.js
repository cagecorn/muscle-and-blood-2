// js/managers/BattleCalculationManager.js
import { DelayEngine } from './DelayEngine.js'; // ✨ DelayEngine 추가

export class BattleCalculationManager {
    constructor(eventManager, battleSimulationManager, diceRollManager, delayEngine) {
        console.log("\ud83d\udcca BattleCalculationManager initialized. Delegating heavy calculations to worker. \ud83d\udcca");
        this.eventManager = eventManager;
        this.battleSimulationManager = battleSimulationManager;
        this.diceRollManager = diceRollManager;
        this.delayEngine = delayEngine; // ✨ delayEngine 저장
        this.worker = new Worker('./js/workers/battleCalculationWorker.js');

        this.worker.onmessage = this._handleWorkerMessage.bind(this);
        this.worker.onerror = (e) => {
            console.error("[BattleCalculationManager] Worker Error:", e);
        };
    }

    async _handleWorkerMessage(event) {
        const { type, unitId, newHp, newBarrier, hpDamageDealt, barrierDamageDealt } = event.data;

        if (type === 'DAMAGE_CALCULATED') {
            console.log(`[BattleCalculationManager] Received damage calculation result for ${unitId}: New HP = ${newHp}, New Barrier = ${newBarrier}, HP Damage = ${hpDamageDealt}, Barrier Damage = ${barrierDamageDealt}`);

            const unitToUpdate = this.battleSimulationManager.unitsOnGrid.find(u => u.id === unitId);
            if (unitToUpdate) {
                unitToUpdate.currentHp = newHp;
                unitToUpdate.currentBarrier = newBarrier;

                if (barrierDamageDealt > 0) {
                    this.eventManager.emit('displayDamage', { unitId: unitId, damage: barrierDamageDealt, color: 'yellow' });
                    if (hpDamageDealt > 0) {
                        await this.delayEngine.waitFor(100);
                    }
                }
                if (hpDamageDealt > 0) {
                    this.eventManager.emit('displayDamage', { unitId: unitId, damage: hpDamageDealt, color: 'red' });
                }

                if (newHp <= 0) {
                    this.eventManager.emit('unitDeath', { unitId: unitId, unitName: unitToUpdate.name, unitType: unitToUpdate.type });
                    console.log(`[BattleCalculationManager] Unit '${unitId}' has died.`);
                }
            } else {
                console.warn(`[BattleCalculationManager] Could not find unit '${unitId}' to update HP.`);
            }
        }
    }

    requestDamageCalculation(attackerUnitId, targetUnitId, skillData = null) {
        const attackerUnit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === attackerUnitId);
        const targetUnit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === targetUnitId);

        if (!attackerUnit || !targetUnit) {
            console.error("[BattleCalculationManager] Cannot request damage calculation: Attacker or target unit not found.");
            return;
        }

        // ✨ DiceRollManager를 사용하여 데미지 굴림 수행 (공격자의 현재 배리어 상태를 전달)
        const finalDamageRoll = this.diceRollManager.performDamageRoll(
            attackerUnit,
            skillData
        );
        console.log(`[BattleCalculationManager] Final damage roll from DiceRollManager: ${finalDamageRoll}`);

        const payload = {
            attackerStats: attackerUnit.fullUnitData ? attackerUnit.fullUnitData.baseStats : attackerUnit.baseStats,
            targetStats: targetUnit.fullUnitData ? targetUnit.fullUnitData.baseStats : targetUnit.baseStats,
            attackerStats: attackerUnit.fullUnitData ? attackerUnit.fullUnitData.baseStats : attackerUnit.baseStats,
            targetStats: targetUnit.fullUnitData ? targetUnit.fullUnitData.baseStats : targetUnit.baseStats,
            currentTargetHp: targetUnit.currentHp,
            currentTargetBarrier: targetUnit.currentBarrier,
            maxBarrier: targetUnit.maxBarrier,
            skillData: skillData,
            targetUnitId: targetUnitId,
            preCalculatedDamageRoll: finalDamageRoll
        };

        this.worker.postMessage({ type: 'CALCULATE_DAMAGE', payload });
        console.log(`[BattleCalculationManager] Requested damage calculation: ${attackerUnitId} attacks ${targetUnitId}.`);
    }

    terminateWorker() {
        if (this.worker) {
            this.worker.terminate();
            console.log("[BattleCalculationManager] Worker terminated.");
        }
    }
}
