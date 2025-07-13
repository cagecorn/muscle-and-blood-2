// js/GameEngine.js
import { Renderer } from './Renderer.js';
import { GameLoop } from './GameLoop.js';
import { EventManager } from './managers/EventManager.js';
import { GuardianManager } from './managers/GuardianManager.js';
import { MeasureManager } from './managers/MeasureManager.js';
import { MapManager } from './managers/MapManager.js';
import { UIEngine } from './managers/UIEngine.js';
import { LayerEngine } from './managers/LayerEngine.js';
import { SceneEngine } from './managers/SceneEngine.js';
import { CameraEngine } from './managers/CameraEngine.js';
import { InputManager } from './managers/InputManager.js';
import { LogicManager } from './managers/LogicManager.js';
import { CompatibilityManager } from './managers/CompatibilityManager.js';
import { IdManager } from './managers/IdManager.js';
import { AssetLoaderManager } from './managers/AssetLoaderManager.js';
import { BattleSimulationManager } from './managers/BattleSimulationManager.js';
import { AnimationManager } from './managers/AnimationManager.js';
import { VFXManager } from './managers/VFXManager.js';
import { DisarmManager } from './managers/DisarmManager.js';
import { CanvasBridgeManager } from './managers/CanvasBridgeManager.js';
import { BindingManager } from './managers/BindingManager.js';
import { BattleCalculationManager } from './managers/BattleCalculationManager.js';
import { MercenaryPanelManager } from './managers/MercenaryPanelManager.js';
import { PanelEngine } from './managers/PanelEngine.js';
import { RuleManager } from './managers/RuleManager.js';

import { TurnEngine } from './managers/TurnEngine.js';
import { DelayEngine } from './managers/DelayEngine.js';
import { TimingEngine } from './managers/TimingEngine.js';
import { BattleLogManager } from './managers/BattleLogManager.js';
import { TurnOrderManager } from './managers/TurnOrderManager.js';
import { ClassAIManager } from './managers/ClassAIManager.js';
import { BasicAIManager } from './managers/BasicAIManager.js';
import { ValorEngine } from './managers/ValorEngine.js';
import { WeightEngine } from './managers/WeightEngine.js';
import { StatManager } from './managers/StatManager.js';
import { DiceEngine } from './managers/DiceEngine.js';
import { DiceRollManager } from './managers/DiceRollManager.js';
import { DiceBotManager } from './managers/DiceBotManager.js';
import { TurnCountManager } from './managers/TurnCountManager.js';
import { StatusEffectManager } from './managers/StatusEffectManager.js';
import { WorkflowManager } from './managers/WorkflowManager.js';
// import { STATUS_EFFECTS } from '../data/statusEffects.js'; // 현재 사용되지 않으므로 주석 처리

import { TerritoryManager } from './managers/TerritoryManager.js';
import { BattleStageManager } from './managers/BattleStageManager.js';
import { BattleGridManager } from './managers/BattleGridManager.js';

import { UNITS } from '../data/unit.js';
import { CLASSES } from '../data/class.js';

// ✨ ResolutionEngine 임포트 추가
// GameEngine의 생성자에서 resolutionEngine 인스턴스를 매개변수로 받게 됨
// import { ResolutionEngine } from './ResolutionEngine.js'; // main.js에서 인스턴스를 전달하므로 여기서 import 할 필요 없음

export class GameEngine {
    // ✨ canvasId 대신 resolutionEngine 인스턴스를 매개변수로 받습니다.
    constructor(resolutionEngine) {
        console.log("\u2699\ufe0f GameEngine initializing... \u2699\ufe0f");

        if (!resolutionEngine) {
            console.error("GameEngine: ResolutionEngine instance is required.");
            throw new Error("ResolutionEngine not provided.");
        }
        this.resolutionEngine = resolutionEngine;

        // ✨ Renderer 초기화 시 resolutionEngine 인스턴스를 전달합니다.
        this.renderer = new Renderer(this.resolutionEngine);
        if (!this.renderer.canvas) {
            console.error("GameEngine: Failed to initialize Renderer. Game cannot proceed.");
            throw new Error("Renderer initialization failed.");
        }
        
        this.eventManager = new EventManager();
        this.guardianManager = new GuardianManager();
        // ✨ MeasureManager에 resolutionEngine을 전달하여 스케일링 정보를 활용하도록 합니다.
        this.measureManager = new MeasureManager(this.resolutionEngine); 
        // 게임 규칙을 관리하는 RuleManager 초기화
        this.ruleManager = new RuleManager();

        // SceneEngine 초기화 (LogicManager보다 먼저 초기화되어야 함)
        this.sceneEngine = new SceneEngine();

        // LogicManager 초기화
        // ResolutionEngine을 함께 전달하여 화면 크기 계산에 사용합니다.
        this.logicManager = new LogicManager(
            this.measureManager,
            this.sceneEngine,
            this.resolutionEngine
        );

        // IdManager 및 AssetLoaderManager 초기화
        this.idManager = new IdManager();
        this.assetLoaderManager = new AssetLoaderManager();

        // AnimationManager는 BattleSimulationManager의 렌더링에 사용됩니다.
        // ✨ AnimationManager에 resolutionEngine을 전달합니다.
        this.animationManager = new AnimationManager(this.measureManager, this.resolutionEngine); 

        // ✨ ValorEngine을 먼저 초기화하여 BattleSimulationManager에 전달합니다.
        this.valorEngine = new ValorEngine();

        // 전투 시뮬레이션 매니저 초기화
        this.battleSimulationManager = new BattleSimulationManager(
            this.measureManager,
            this.assetLoaderManager,
            this.idManager,
            this.logicManager,
            this.animationManager,
            this.valorEngine,
            this.resolutionEngine // ✨ resolutionEngine 추가
        );
        // 생성 후 상호 참조 설정
        this.animationManager.battleSimulationManager = this.battleSimulationManager;

        // 패널과 로그 캔버스 요소 준비 및 매니저 초기화
        // ✨ resolutionEngine을 통해 캔버스 요소를 가져옵니다.
        const mercenaryPanelCanvasElement = this.resolutionEngine.getCanvasElement('mercenaryPanelCanvas');
        if (!mercenaryPanelCanvasElement) {
            console.error("GameEngine: Mercenary Panel Canvas not found. Game cannot proceed without it.");
            throw new Error("Mercenary Panel Canvas initialization failed.");
        }
        // ✨ MercenaryPanelManager에 resolutionEngine을 전달합니다.
        this.mercenaryPanelManager = new MercenaryPanelManager(
            mercenaryPanelCanvasElement,
            this.measureManager,
            this.battleSimulationManager,
            this.logicManager,
            this.resolutionEngine 
        );

        // ✨ resolutionEngine을 통해 캔버스 요소를 가져옵니다.
        const combatLogCanvasElement = this.resolutionEngine.getCanvasElement('combatLogCanvas');
        if (!combatLogCanvasElement) {
            console.error("GameEngine: Combat Log Canvas not found. Game cannot proceed without it.");
            throw new Error("Combat Log Canvas initialization failed.");
        }
        // ✨ BattleLogManager에 resolutionEngine을 전달합니다.
        this.battleLogManager = new BattleLogManager(
            combatLogCanvasElement,
            this.eventManager,
            this.measureManager,
            this.resolutionEngine
        );
        // 이벤트 리스너는 명시적으로 설정
        this.battleLogManager._setupEventListeners();

        // PanelEngine 초기화 및 패널 등록
        // ✨ PanelEngine에 resolutionEngine을 전달합니다.
        this.panelEngine = new PanelEngine(this.resolutionEngine);
        this.panelEngine.registerPanel('mercenaryPanel', this.mercenaryPanelManager);

        // UIEngine과 MapManager를 먼저 초기화
        // ✨ MapManager에 resolutionEngine을 전달합니다.
        this.mapManager = new MapManager(this.measureManager, this.resolutionEngine);
        // ✨ UIEngine에 resolutionEngine을 전달합니다.
        this.uiEngine = new UIEngine(this.renderer, this.measureManager, this.eventManager, this.resolutionEngine);

        // CompatibilityManager 초기화 (필요 매니저들을 모두 전달)
        // ✨ CompatibilityManager에 resolutionEngine을 전달하고,
        // ✨ Renderer의 resizeCanvas 로직이 이제 resolutionEngine에 의해 주도되므로 해당 로직을 CompatibilityManager에서 제거하거나 조정해야 합니다.
        // ✨ 현재는 CompatibilityManager가 캔버스 크기를 직접 제어하지 않고 resolutionEngine에 위임하는 방향으로 고려합니다.
        this.compatibilityManager = new CompatibilityManager(
            this.measureManager,
            this.renderer,
            this.uiEngine,
            this.mapManager,
            this.logicManager,
            this.mercenaryPanelManager,
            this.battleLogManager,
            this.resolutionEngine // ✨ resolutionEngine 추가
        );

        // ✨ CameraEngine에 resolutionEngine을 전달합니다.
        this.cameraEngine = new CameraEngine(this.renderer, this.logicManager, this.sceneEngine, this.resolutionEngine);
        // ✨ InputManager에 resolutionEngine을 전달합니다.
        this.inputManager = new InputManager(this.renderer, this.cameraEngine, this.uiEngine, this.resolutionEngine);

        // ✨ resolutionEngine을 통해 메인 게임 캔버스 요소를 가져옵니다.
        const mainGameCanvasElement = this.resolutionEngine.mainCanvas;
        this.canvasBridgeManager = new CanvasBridgeManager(
            mainGameCanvasElement,
            mercenaryPanelCanvasElement,
            combatLogCanvasElement,
            this.eventManager,
            this.measureManager,
            this.resolutionEngine // ✨ resolutionEngine 추가
        );

        // ✨ LayerEngine에 resolutionEngine을 전달합니다.
        this.layerEngine = new LayerEngine(this.renderer, this.cameraEngine, this.resolutionEngine);

        this.territoryManager = new TerritoryManager();
        this.battleStageManager = new BattleStageManager();
        // ✨ BattleGridManager에 resolutionEngine을 전달합니다.
        this.battleGridManager = new BattleGridManager(this.measureManager, this.logicManager, this.resolutionEngine);
        // VFXManager에 AnimationManager를 전달하여 HP 바 위치를 애니메이션과 동기화합니다.
        // ✨ VFXManager에 resolutionEngine을 전달합니다.
        this.vfxManager = new VFXManager(
            this.renderer,
            this.measureManager,
            this.cameraEngine,
            this.battleSimulationManager,
            this.animationManager,
            this.eventManager,
            this.resolutionEngine // ✨ resolutionEngine 추가
        );
        this.bindingManager = new BindingManager();

        // ✨ 새로운 엔진들 초기화
        this.delayEngine = new DelayEngine();
        this.timingEngine = new TimingEngine(this.delayEngine);
        this.weightEngine = new WeightEngine();
        this.statManager = new StatManager(this.valorEngine, this.weightEngine);

        // ✨ DiceEngine 및 관련 매니저 초기화
        this.diceEngine = new DiceEngine();
        this.diceRollManager = new DiceRollManager(this.diceEngine, this.valorEngine);
        this.diceBotManager = new DiceBotManager(this.diceEngine);

        // BattleCalculationManager는 DiceRollManager가 준비된 이후에 초기화합니다.
        this.battleCalculationManager = new BattleCalculationManager(
            this.eventManager,
            this.battleSimulationManager,
            this.diceRollManager,
            this.delayEngine
        );

        // Status effect 관련 매니저 초기화
        this.turnCountManager = new TurnCountManager();
        this.statusEffectManager = new StatusEffectManager(
            this.eventManager,
            this.idManager,
            this.turnCountManager,
            this.battleCalculationManager
        );
        this.workflowManager = new WorkflowManager(
            this.eventManager,
            this.statusEffectManager,
            this.battleSimulationManager
        );

        // ✨ DisarmManager 초기화 (StatusEffectManager가 먼저 초기화되어야 함)
        this.disarmManager = new DisarmManager(
            this.eventManager,
            this.statusEffectManager,
            this.battleSimulationManager,
            this.measureManager
        );

        // ✨ BasicAIManager 초기화
        this.basicAIManager = new BasicAIManager(this.battleSimulationManager);

        // ✨ 새로운 매니저 초기화
        this.turnOrderManager = new TurnOrderManager(
            this.eventManager,
            this.battleSimulationManager,
            this.weightEngine // ✨ weightEngine 추가
        );
        this.classAIManager = new ClassAIManager(this.idManager, this.battleSimulationManager, this.measureManager, this.basicAIManager);

        // ✨ TurnEngine에 새로운 의존성 전달
        this.turnEngine = new TurnEngine(
            this.eventManager,
            this.battleSimulationManager,
            this.turnOrderManager,
            this.classAIManager,
            this.delayEngine,
            this.timingEngine,
            this.animationManager,
            this.battleCalculationManager,
            this.statusEffectManager
        );

        this.sceneEngine.registerScene('territoryScene', [this.territoryManager]);
        this.sceneEngine.registerScene('battleScene', [
            this.battleStageManager,
            this.battleGridManager,
            this.battleSimulationManager,
            this.vfxManager
        ]);

        this.sceneEngine.setCurrentScene('territoryScene');

        // ✨ LayerEngine의 draw 호출 시, Renderer의 컨텍스트를 사용하도록 명시
        this.layerEngine.registerLayer('sceneLayer', (ctx) => {
            this.sceneEngine.draw(ctx);
        }, 10);

        this.layerEngine.registerLayer('uiLayer', (ctx) => {
            this.uiEngine.draw(ctx);
        }, 100);


        this._update = this._update.bind(this);
        this._draw = this._draw.bind(this);

        this.gameLoop = new GameLoop(this._update, this._draw);

        // 초기화 과정의 비동기 처리
        this._initAsyncManagers().then(() => {
            const initialGameData = {
                units: [
                    { id: 'u1', name: 'Knight', hp: 100 },
                    { id: 'u2', name: 'Archer', hp: 70 }
                ],
                // ✨ config에서 resolution 정보를 resolutionEngine으로부터 가져옵니다.
                config: {
                    resolution: {
                        baseWidth: this.resolutionEngine.baseWidth,
                        baseHeight: this.resolutionEngine.baseHeight,
                        currentWidth: this.resolutionEngine.displayWidth,
                        currentHeight: this.resolutionEngine.displayHeight,
                        scaleRatio: this.resolutionEngine.currentScaleRatio
                    },
                    difficulty: 'normal'
                }
            };

            try {
                this.guardianManager.enforceRules(initialGameData);
                console.log("[GameEngine] Initial game data passed GuardianManager rules. \u2728");
            } catch (e) {
                if (e.name === "ImmutableRuleViolationError") {
                    console.error("[GameEngine] CRITICAL ERROR: Game initialization failed due to immutable rule violation!", e.message);
                    throw e;
                } else {
                    console.error("[GameEngine] An unexpected error occurred during rule enforcement:", e);
                    throw e;
                }
            }

            // 초기 카메라 위치와 줌을 설정하여 모든 콘텐츠가 화면에 들어오도록 합니다.
            this.cameraEngine.reset();
            // ✨ 추가: 카메라 엔진의 초기 상태 확인
            console.log(`[GameEngine Debug] Camera Initial State: X=${this.cameraEngine.x}, Y=${this.cameraEngine.y}, Zoom=${this.cameraEngine.zoom}`);

            this.eventManager.subscribe('unitDeath', (data) => {
                console.log(`[GameEngine] Notification: Unit ${data.unitId} (${data.unitName}) has died.`);
            });
            this.eventManager.subscribe('skillExecuted', (data) => {
                console.log(`[GameEngine] Notification: Skill '${data.skillName}' was executed.`);
            });
            this.eventManager.subscribe('battleStart', async (data) => {
                console.log(`[GameEngine] Battle started for map: ${data.mapId}, difficulty: ${data.difficulty}`);
                this.sceneEngine.setCurrentScene('battleScene');
                this.uiEngine.setUIState('combatScreen');
                this.cameraEngine.reset();

                // 전투 시작 후 TurnEngine 구동
                await this.turnEngine.startBattleTurns();
            });

            console.log("\u2699\ufe0f GameEngine initialized successfully. \u2699\ufe0f");
        }).catch(error => {
            console.error("Fatal Error: Async manager initialization failed.", error);
            alert("\uAC8C\uC784 \uC2DC\uC791 \uC911 \uCE58\uBA85\uC801\uB4E0 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uCF58\uC194\uC744 \uD655\uC778\uD574\uC8FC\uC138\uC694.");
        });
    }

    /**
     * 비동기로 초기화되어야 하는 매니저를 처리합니다.
     */
    async _initAsyncManagers() {
        await this.idManager.initialize();

        // 1. IdManager에 전사 유닛과 클래스 ID 등록
        await this.idManager.addOrUpdateId(UNITS.WARRIOR.id, UNITS.WARRIOR);
        await this.idManager.addOrUpdateId(CLASSES.WARRIOR.id, CLASSES.WARRIOR);
        // ✨ 새롭게 추가된 해골 클래스도 등록
        await this.idManager.addOrUpdateId(CLASSES.SKELETON.id, CLASSES.SKELETON);

        // 2. AssetLoaderManager로 전사 스프라이트 로드
        await this.assetLoaderManager.loadImage(
            UNITS.WARRIOR.spriteId,
            'assets/images/warrior.png'
        );

        console.log(`[GameEngine] Registered unit ID: ${UNITS.WARRIOR.id}`);
        console.log(`[GameEngine] Loaded warrior sprite: ${UNITS.WARRIOR.spriteId}`);

        // 샘플 ID 조회 및 이미지 로드 (동기적 접근을 위해)
        const warriorData = await this.idManager.get(UNITS.WARRIOR.id);
        const warriorImage = this.assetLoaderManager.getImage(UNITS.WARRIOR.spriteId);

        // ✨ BattleSimulationManager에 유닛 배치 시 currentHp 초기화
        // 전사를 그리드의 더 왼쪽에 배치 (gridX: 3)
        this.battleSimulationManager.addUnit({ ...warriorData, currentHp: warriorData.baseStats.hp }, warriorImage, 3, 4);

        const mockEnemyUnitData = {
            id: 'unit_zombie_001', // ID 변경
            name: '좀비', // 이름 변경
            classId: 'class_skeleton', // 기존 해골 클래스 재사용
            type: 'enemy',
            baseStats: {
                hp: 80,
                attack: 15,
                defense: 5,
                speed: 30,
                valor: 10,
                strength: 10,
                endurance: 8,
                agility: 12,
                intelligence: 5,
                wisdom: 5,
                luck: 15,
                weight: 10
            },
            spriteId: 'sprite_zombie_default'
        };
        await this.idManager.addOrUpdateId(mockEnemyUnitData.id, mockEnemyUnitData);
        // ✨ 좀비 기본 이미지 로드
        await this.assetLoaderManager.loadImage(mockEnemyUnitData.spriteId, 'assets/images/zombie.png');
        // ✨ 무장해제 상태의 좀비 이미지 로드
        await this.assetLoaderManager.loadImage('sprite_zombie_empty_default', 'assets/images/zombie-empty.png');
        // ✨ 좀비 무기 이미지 로드
        await this.assetLoaderManager.loadImage('sprite_zombie_weapon_default', 'assets/images/zombie-weapon.png');

        const enemyData = await this.idManager.get(mockEnemyUnitData.id);
        const enemyImage = this.assetLoaderManager.getImage(mockEnemyUnitData.spriteId);
        // 좀비를 그리드의 더 오른쪽에 배치 (gridX: 10)
        this.battleSimulationManager.addUnit({ ...enemyData, currentHp: enemyData.baseStats.hp }, enemyImage, 10, 4);
    }

    _update(deltaTime) {
        this.sceneEngine.update(deltaTime);
        this.animationManager.update(deltaTime);
        this.vfxManager.update(deltaTime);
    }

    _draw() {
        // ✨ LayerEngine이 메인 캔버스에 그리도록 명시적으로 컨텍스트를 전달
        this.layerEngine.draw(this.renderer.mainContext);
        
        // 메인 캔버스와는 별도로 관리되는 패널도 그립니다.
        // 각 패널 매니저가 자신의 캔버스 컨텍스트를 관리하고 그리도록 합니다.
        if (this.panelEngine) {
            // PanelEngine 내에서 MercenaryPanelManager의 draw 메서드를 호출할 때
            // 해당 MercenaryPanelManager가 자신의 컨텍스트에 그리도록 구현되어야 합니다.
            // MercenaryPanelManager의 draw 메서드에 컨텍스트를 인자로 넘기는 대신,
            // MercenaryPanelManager가 내부적으로 자신의 컨텍스트에 그리도록 설정되었다고 가정합니다.
            this.panelEngine.drawPanel('mercenaryPanel'); 
        }
        if (this.battleLogManager) {
            this.battleLogManager.draw(); // BattleLogManager도 자신의 컨텍스트에 직접 그리도록 합니다.
        }
    }

    start() {
        console.log("\ud83d\ude80 GameEngine starting game loop... \ud83d\ude80");
        this.gameLoop.start();
    }

    // 기존 getter 메서드들은 그대로 유지됩니다.
    getRenderer() { return this.renderer; }
    getEventManager() { return this.eventManager; }
    getGuardianManager() { return this.guardianManager; }
    getRuleManager() { return this.ruleManager; }
    getMeasureManager() { return this.measureManager; }
    getMapManager() { return this.mapManager; }
    getUIEngine() { return this.uiEngine; }
    getLayerEngine() { return this.layerEngine; }
    getSceneEngine() { return this.sceneEngine; }
    getCameraEngine() { return this.cameraEngine; }
    getInputManager() { return this.inputManager; }
    getLogicManager() { return this.logicManager; }
    getCompatibilityManager() { return this.compatibilityManager; }
    getIdManager() { return this.idManager; }
    getAssetLoaderManager() { return this.assetLoaderManager; }
    getBattleSimulationManager() { return this.battleSimulationManager; }
    getBattleCalculationManager() { return this.battleCalculationManager; }
    getMercenaryPanelManager() { return this.mercenaryPanelManager; }
    getPanelEngine() { return this.panelEngine; }
    getBattleLogManager() { return this.battleLogManager; }
    getBindingManager() { return this.bindingManager; }

    // 새로운 엔진들에 대한 getter 메서드
    getDelayEngine() { return this.delayEngine; }
    getTimingEngine() { return this.timingEngine; }
    getValorEngine() { return this.valorEngine; }
    getWeightEngine() { return this.weightEngine; }
    getStatManager() { return this.statManager; }
    getTurnEngine() { return this.turnEngine; }
    getTurnOrderManager() { return this.turnOrderManager; }
    getBasicAIManager() { return this.basicAIManager; }
    getClassAIManager() { return this.classAIManager; }
    getAnimationManager() { return this.animationManager; }
    getCanvasBridgeManager() { return this.canvasBridgeManager; }
    getTurnCountManager() { return this.turnCountManager; }
    getStatusEffectManager() { return this.statusEffectManager; }
    getWorkflowManager() { return this.workflowManager; }
    getDisarmManager() { return this.disarmManager; }

    // Dice 관련 엔진/매니저에 대한 getter
    getDiceEngine() { return this.diceEngine; }
    getDiceRollManager() { return this.diceRollManager; }
    getDiceBotManager() { return this.diceBotManager; }
}
