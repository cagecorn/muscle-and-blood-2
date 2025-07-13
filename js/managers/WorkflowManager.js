// js/managers/WorkflowManager.js

export class WorkflowManager {
    constructor(eventManager, statusEffectManager, battleSimulationManager) {
        console.log("\uD83D\uDCCA WorkflowManager initialized. Streamlining complex processes. \uD83D\uDCCA");
        this.eventManager = eventManager;
        this.statusEffectManager = statusEffectManager;
        this.battleSimulationManager = battleSimulationManager;
        this.eventManager.subscribe('requestStatusEffectApplication', this._processStatusEffectApplication.bind(this));
        console.log("[WorkflowManager] Subscribed to 'requestStatusEffectApplication' event.");
    }

    _processStatusEffectApplication(data) {
        const { unitId, statusEffectId } = data;
        if (!unitId || !statusEffectId) {
            console.warn("[WorkflowManager] Missing unitId or statusEffectId for application workflow.");
            return;
        }
        const targetUnit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === unitId);
        if (!targetUnit) {
            console.warn(`[WorkflowManager] Target unit '${unitId}' not found for status effect application.`);
            return;
        }
        console.log(`[WorkflowManager] Processing application of status effect '${statusEffectId}' to unit '${unitId}'.`);
        this.statusEffectManager.applyStatusEffect(unitId, statusEffectId);
        this.eventManager.emit('logMessage', { message: `${targetUnit.name}에게 '${statusEffectId}' 상태 효과가 적용되었습니다!` });
        console.log(`[WorkflowManager] Workflow for status effect '${statusEffectId}' on unit '${unitId}' completed.`);
    }

    triggerStatusEffectApplication(unitId, statusEffectId) {
        this.eventManager.emit('requestStatusEffectApplication', { unitId, statusEffectId });
        console.log(`[WorkflowManager] Triggered status effect application for unit '${unitId}' with effect '${statusEffectId}'.`);
    }
}
