// js/GameEngine.js

import { AssetEngine } from './engines/AssetEngine.js';
import { BattleEngine } from './engines/BattleEngine.js';
import { RenderEngine } from './engines/RenderEngine.js';
import { GameLoop } from './GameLoop.js';
import { EventManager } from './managers/EventManager.js';
import { MeasureManager } from './managers/MeasureManager.js';
import { RuleManager } from './managers/RuleManager.js';
import { SceneEngine } from './managers/SceneEngine.js';
import { LogicManager } from './managers/LogicManager.js';
import { UnitStatManager } from './managers/UnitStatManager.js';
import { GameDataManager } from './managers/GameDataManager.js';
// GAME_EVENTS와 UI_STATES 상수를 사용합니다.
import { GAME_EVENTS, UI_STATES } from './constants.js';

// 장면과 전투에 필요한 다양한 매니저들을 불러옵니다.
import { TerritoryManager } from './managers/TerritoryManager.js';
import { BattleStageManager } from './managers/BattleStageManager.js';
import { BattleGridManager } from './managers/BattleGridManager.js';
import { BattleLogManager } from './managers/BattleLogManager.js';
import { MercenaryPanelManager } from './managers/MercenaryPanelManager.js';
import { CompatibilityManager } from './managers/CompatibilityManager.js';

export class GameEngine {
    constructor(canvasId) {
        console.log("⚙️ GameEngine initializing...");

        // 1. 핵심 동기 매니저 생성
        this.eventManager = new EventManager();
        this.measureManager = new MeasureManager();
        this.ruleManager = new RuleManager();
        this.sceneEngine = new SceneEngine();
        this.logicManager = new LogicManager(this.measureManager, this.sceneEngine);

        // 2. 주요 엔진 생성
        const mainCanvas = document.getElementById(canvasId);
        this.assetEngine = new AssetEngine(this.eventManager);
        this.renderEngine = new RenderEngine(mainCanvas, this.eventManager, this.measureManager, this.logicManager, this.sceneEngine);
        this.battleEngine = new BattleEngine(this.eventManager, this.measureManager, this.assetEngine, this.renderEngine);

        // 3. 종속성을 가지는 나머지 매니저들 생성
        this.unitStatManager = new UnitStatManager(this.eventManager, this.battleEngine.getBattleSimulationManager());

        // 장면 및 전투 관련 매니저들
        this.territoryManager = new TerritoryManager();
        this.battleStageManager = new BattleStageManager(this.assetEngine.getAssetLoaderManager());
        this.battleGridManager = new BattleGridManager(this.measureManager, this.logicManager);

        // RenderEngine에 필요한 후반 종속성 주입
        this.renderEngine.injectDependencies(this.getBattleSimulationManager(), this.battleEngine.heroManager);

        // 순환 참조 문제를 방지하기 위해 UIEngine 인스턴스를 ButtonEngine에도 전달
        this.renderEngine.inputManager.buttonEngine.uiEngine = this.renderEngine.uiEngine;

        // MercenaryPanelManager를 생성하고 UIEngine과 연결
        const battleSim = this.getBattleSimulationManager();
        this.mercenaryPanelManager = new MercenaryPanelManager(this.measureManager, battleSim, this.logicManager, this.eventManager);
        this.getUIEngine().mercenaryPanelManager = this.mercenaryPanelManager;

        // BattleLogManager 생성 및 이벤트 리스너 설정
        const combatLogCanvas = document.getElementById('combatLogCanvas');
        if (combatLogCanvas) {
            this.battleLogManager = new BattleLogManager(combatLogCanvas, this.eventManager, this.measureManager);
            this.battleLogManager._setupEventListeners();
        }

        // 호환성 매니저 생성
        this.compatibilityManager = new CompatibilityManager(
            this.measureManager,
            this.renderEngine.renderer,
            this.getUIEngine(),
            null,
            this.logicManager,
            this.mercenaryPanelManager,
            this.battleLogManager
        );

        // 4. 게임 루프 설정
        this.gameLoop = new GameLoop(this._update.bind(this), this._draw.bind(this));

        // 5. 비동기 초기화 실행
        this.initializeGame();
    }

    // SceneEngine과 RenderEngine의 레이어 구성을 설정합니다.
    _registerScenesAndLayers() {
        const battleSim = this.getBattleSimulationManager();

        // 각 장면에 필요한 매니저들을 등록
        this.sceneEngine.registerScene('territoryScene', [this.territoryManager]);
        this.sceneEngine.registerScene('battleScene', [
            this.battleStageManager,
            this.battleGridManager,
            battleSim,
        ]);

        const layerEngine = this.renderEngine.getLayerEngine();
        layerEngine.registerLayer('sceneLayer', (ctx) => this.sceneEngine.draw(ctx), 10);
        if (this.battleLogManager) {
            layerEngine.registerLayer('battleLogLayer', (ctx) => this.battleLogManager.draw(ctx), 50);
        }
        layerEngine.registerLayer('uiLayer', (ctx) => this.getUIEngine().draw(ctx), 100);
    }

    /**
     * 게임에 필요한 모든 비동기 작업을 순서대로 실행하는 초기화 매니저 역할의 함수.
     * 이 함수가 완료되어야만 게임이 시작됩니다.
     */
    async initializeGame() {
        try {
            console.log("--- Game Initialization Start ---");

        const idManager = this.assetEngine.getIdManager();

        // 단계 1: 데이터베이스 시스템 초기화
        console.log("Initialization Step 1: Initializing IdManager (DB)...");
        await idManager.initialize();
        // 디버그 환경에서 남아 있을 수 있는 이전 세션 데이터를 정리합니다.
        await idManager.clearAllData();
        console.log("✅ IdManager Initialized.");

            // 단계 2: 기본 게임 데이터 등록 (클래스, 아이템 등)
            console.log("Initialization Step 2: Registering base game data...");
            await GameDataManager.registerBaseClasses(idManager);
            console.log("✅ Base game data registered.");

            // 단계 3: 전투 엔진 설정 (유닛 생성 등)
            // 이 단계는 반드시 클래스 데이터가 등록된 후에 실행되어야 합니다.
            console.log("Initialization Step 3: Setting up battle units...");
            await this.battleEngine.setupBattle();
            console.log("✅ Battle setup complete.");

            // 단계 4: 장면과 레이어 등록
            console.log("Initialization Step 4: Registering scenes and layers...");
            this._registerScenesAndLayers();

            // BATTLE_START 이벤트가 오면 전투 장면으로 전환합니다.
            this.eventManager.subscribe(GAME_EVENTS.BATTLE_START, () => {
                console.log("Battle Start event received by GameEngine. Changing scene...");
                this.sceneEngine.setCurrentScene('battleScene');
                this.getUIEngine().setUIState(UI_STATES.COMBAT_SCREEN);
                this.battleEngine.startBattle();
            });

            this.sceneEngine.setCurrentScene('territoryScene');
            this.getUIEngine().setUIState(UI_STATES.MAP_SCREEN);
            console.log("✅ Scenes and layers registered. Initial scene set to 'territoryScene'.");

            console.log("--- ✅ All Initialization Steps Completed ---");

            // 모든 준비가 끝났으므로 게임 시작
            this.start();

        } catch (error) {
            console.error('Fatal Error: Game initialization failed.', error);
            // 사용자에게 오류를 알리는 UI를 표시할 수 있습니다.
        }
    }

    _update(deltaTime) {
        // 현재 활성화된 Scene의 매니저들만 업데이트하도록 구성
        this.sceneEngine.update(deltaTime);
        this.renderEngine.update(deltaTime);
        this.battleEngine.update(deltaTime);
        this.getUIEngine().update(deltaTime);
    }

    _draw() {
        this.renderEngine.draw();
    }

    start() {
        console.log("🚀 Starting Game Loop!");
        this.gameLoop.start();
        // 전투 시작 신호를 여기서 보내거나, UI 버튼 클릭 등으로 시작할 수 있습니다.
        this.eventManager.emit(GAME_EVENTS.BATTLE_START, {});
    }

    // --- Getter helpers ---
    getEventManager() { return this.eventManager; }
    getMeasureManager() { return this.measureManager; }
    getRuleManager() { return this.ruleManager; }
    getSceneEngine() { return this.sceneEngine; }
    getLogicManager() { return this.logicManager; }
    getAssetEngine() { return this.assetEngine; }
    getRenderEngine() { return this.renderEngine; }
    getBattleEngine() { return this.battleEngine; }
    getUnitStatManager() { return this.unitStatManager; }

    // UIEngine 접근을 위한 편의 메서드
    getUIEngine() {
        return this.renderEngine.uiEngine;
    }

    // BattleSimulationManager 접근용 메서드
    getBattleSimulationManager() {
        return this.battleEngine.getBattleSimulationManager();
    }
}
