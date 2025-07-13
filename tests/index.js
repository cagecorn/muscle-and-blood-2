export { runRendererTests } from './unit/rendererTests.js';
export { runGameLoopTests } from './unit/gameLoopTests.js';
export { runEventManagerTests } from './unit/eventManagerUnitTests.js';
export { runGuardianManagerTests } from './unit/guardianManagerUnitTests.js';
export { runMeasureManagerUnitTests } from './unit/measureManagerUnitTests.js';
export { runMapManagerUnitTests } from './unit/mapManagerUnitTests.js';
export { runUIEngineUnitTests } from './unit/uiEngineUnitTests.js';

// new unit tests
export { runSceneEngineUnitTests } from './unit/sceneEngineUnitTests.js';
export { runLogicManagerUnitTests } from './unit/logicManagerUnitTests.js';
export { runCompatibilityManagerUnitTests } from './unit/compatibilityManagerUnitTests.js';
export { runMercenaryPanelManagerUnitTests } from './unit/mercenaryPanelManagerUnitTests.js';
export { runPanelEngineUnitTests } from './unit/panelEngineUnitTests.js';
export { runBattleLogManagerUnitTests } from './unit/battleLogManagerUnitTests.js';
export { runTurnEngineUnitTests } from './unit/turnEngineUnitTests.js';
export { runDelayEngineUnitTests } from './unit/delayEngineUnitTests.js';
export { runTimingEngineUnitTests } from './unit/timingEngineUnitTests.js';
export { runRuleManagerUnitTests } from './unit/ruleManagerUnitTests.js';
export { runTurnOrderManagerUnitTests } from './unit/turnOrderManagerUnitTests.js';
export { runBasicAIManagerUnitTests } from './unit/basicAIManagerUnitTests.js';
export { runClassAIManagerUnitTests } from './unit/classAIManagerUnitTests.js';
export { runBattleSimulationManagerUnitTests } from './unit/battleSimulationManagerUnitTests.js';
export { runAnimationManagerUnitTests } from './unit/animationManagerUnitTests.js';

// ✨ 새로 추가되거나 업데이트된 단위 테스트
export { runValorEngineUnitTests } from './unit/valorEngineUnitTests.js';
export { runWeightEngineUnitTests } from './unit/weightEngineUnitTests.js';
export { runStatManagerUnitTests } from './unit/statManagerUnitTests.js';
export { runVFXManagerUnitTests } from './unit/vfxManagerUnitTests.js';
export { runCanvasBridgeManagerUnitTests } from './unit/canvasBridgeManagerUnitTests.js';
export { runMeasureManagerUnitTests as runUpdatedMeasureManagerUnitTests } from './unit/measureManagerUnitTests.js';
export { runMapManagerUnitTests as runUpdatedMapManagerUnitTests } from './unit/mapManagerUnitTests.js';
export { runUIEngineUnitTests as runUpdatedUIEngineUnitTests } from './unit/uiEngineUnitTests.js';
// ✨ 다이스 관련 테스트 추가
export { runDiceEngineUnitTests } from './unit/diceEngineUnitTests.js';
export { runDiceRollManagerUnitTests } from './unit/diceRollManagerUnitTests.js';
export { runDiceBotManagerUnitTests } from './unit/diceBotManagerUnitTests.js';
export { runTurnCountManagerUnitTests } from './unit/turnCountManagerUnitTests.js';
export { runStatusEffectManagerUnitTests } from './unit/statusEffectManagerUnitTests.js';
export { runWorkflowManagerUnitTests } from './unit/workflowManagerUnitTests.js';
export { runDisarmManagerUnitTests } from './unit/disarmManagerUnitTests.js';

export { runMeasureManagerIntegrationTest } from './integration/measureManagerIntegrationTests.js';
export { runBattleSimulationIntegrationTest } from './integration/battleSimulationIntegrationTest.js';

export { injectRendererFault } from './fault_injection/rendererFaults.js';
export { injectGameLoopFault, getFaultFlags, setFaultFlag } from './fault_injection/gameLoopFaults.js';
export { injectEventManagerFaults } from './fault_injection/eventManagerFaults.js';
export { injectGuardianManagerFaults } from './fault_injection/guardianManagerFaults.js';
export { injectSceneEngineFaults } from './fault_injection/sceneEngineFaults.js';
export { injectLogicManagerFaults } from './fault_injection/logicManagerFaults.js';
export { injectCompatibilityManagerFaults } from './fault_injection/compatibilityManagerFaults.js';

export function runEngineTests(renderer, gameLoop) {
    runRendererTests(renderer);
    runGameLoopTests(gameLoop);
}
