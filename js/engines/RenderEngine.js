// js/engines/RenderEngine.js

import { Renderer } from '../Renderer.js';
import { CameraEngine } from '../managers/CameraEngine.js';
import { LayerEngine } from '../managers/LayerEngine.js';
import { AnimationManager } from '../managers/AnimationManager.js';
import { ParticleEngine } from '../managers/ParticleEngine.js';
import { InputManager } from '../managers/InputManager.js';
import { UIEngine } from '../managers/UIEngine.js';
import { ButtonEngine } from '../managers/ButtonEngine.js';

/**
 * 렌더링과 시각 효과를 담당하는 엔진입니다.
 */
export class RenderEngine {
    // GameEngine에서 실제 Canvas DOM 요소를 전달받아 초기화합니다.
    constructor(canvasElement, eventManager, measureManager, logicManager, sceneManager) {
        console.log("🎨 RenderEngine initialized.");
        // Renderer는 캔버스 ID를 사용해 초기화하므로 전달된 요소의 id를 사용합니다.
        this.renderer = new Renderer(canvasElement.id);
        // 생성 시점에 CameraEngine에 logicManager와 sceneManager를 주입합니다.
        this.cameraEngine = new CameraEngine(this.renderer, logicManager, sceneManager);
        this.layerEngine = new LayerEngine(this.renderer, this.cameraEngine);

        this.particleEngine = new ParticleEngine(measureManager, this.cameraEngine, null);
        this.animationManager = new AnimationManager(measureManager, null, this.particleEngine);

        this.buttonEngine = new ButtonEngine();
        // heroManager는 추후 GameEngine에서 주입됩니다.
        this.uiEngine = new UIEngine(this.renderer, measureManager, eventManager, null, this.buttonEngine, null);
        this.inputManager = new InputManager(this.renderer, this.cameraEngine, this.uiEngine, this.buttonEngine, eventManager);
        // UIEngine과 ButtonEngine이 상호작용할 수 있도록 연결합니다.
        this.inputManager.buttonEngine.uiEngine = this.uiEngine;
    }

    // 전투 관련 매니저와 영웅 매니저를 주입합니다.
    injectDependencies(battleSim, heroManager) {
        this.particleEngine.battleSimulationManager = battleSim;
        this.animationManager.battleSimulationManager = battleSim;

        if (this.uiEngine) {
            this.uiEngine.heroManager = heroManager;
        }

        // BattleSimulationManager가 LogicManager에 접근할 수 있도록 주입합니다.
        if (battleSim) {
            battleSim.logicManager = this.cameraEngine.logicManager;
        }
    }

    draw() {
        this.layerEngine.draw();
    }

    update(deltaTime) {
        this.animationManager.update(deltaTime);
        this.particleEngine.update(deltaTime);
    }

    getAnimationManager() { return this.animationManager; }
    getLayerEngine() { return this.layerEngine; }
}
