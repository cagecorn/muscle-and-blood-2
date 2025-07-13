// js/managers/CompatibilityManager.js

export class CompatibilityManager {
    // ✨ resolutionEngine을 매개변수로 추가
    constructor(measureManager, renderer, uiEngine, mapManager, logicManager, mercenaryPanelManager, battleLogManager, resolutionEngine) {
        console.log("📱 CompatibilityManager initialized. Adapting to screen changes. 📱");
        this.measureManager = measureManager;
        this.renderer = renderer;
        this.uiEngine = uiEngine;
        this.mapManager = mapManager;
        this.logicManager = logicManager;
        this.mercenaryPanelManager = mercenaryPanelManager;
        this.battleLogManager = battleLogManager;
        this.resolutionEngine = resolutionEngine; // ✨ resolutionEngine 인스턴스 저장

        // 캔버스 참조는 각 매니저에서 가져옵니다.
        // this.mercenaryPanelCanvas = mercenaryPanelManager ? mercenaryPanelManager.canvas : null; // 이제 직접 참조하지 않음
        // this.combatLogCanvas = battleLogManager ? battleLogManager.canvas : null; // 이제 직접 참조하지 않음

        // 기준 해상도 비율은 resolutionEngine에서 가져옵니다.
        this.baseGameWidth = this.resolutionEngine.baseWidth;
        this.baseGameHeight = this.resolutionEngine.baseHeight;
        this.baseAspectRatio = this.baseGameWidth / this.baseGameHeight;

        this._setupEventListeners();
        // 초기 adjustResolution 호출은 이제 resolutionEngine의 setupCanvas에서 대부분 처리됩니다.
        // 여기서는 보조 캔버스들의 초기 크기만 조정하도록 합니다.
        this.adjustAuxiliaryCanvases();
    }

    _setupEventListeners() {
        // ✨ window.resize 이벤트를 직접 듣는 대신, ResolutionEngine이 발생시키는 resolutionChanged 이벤트를 수신합니다.
        window.addEventListener('resolutionChanged', this._handleResolutionChange.bind(this));
        console.log("[CompatibilityManager] Listening for resolutionChanged events from ResolutionEngine.");
    }

    /**
     * ResolutionEngine에서 발생한 해상도 변경 이벤트를 처리합니다.
     * 이 함수는 메인 캔버스의 크기가 변경되었을 때, 다른 캔버스들도 조정합니다.
     * @param {CustomEvent} event - resolutionChanged 이벤트 객체
     */
    _handleResolutionChange(event) {
        const { currentWidth: mainGameCanvasWidth, currentHeight: mainGameCanvasHeight } = event.detail;
        console.log(`[CompatibilityManager] Received resolutionChanged event. Main canvas now: ${mainGameCanvasWidth}x${mainGameCanvasHeight}`);
        
        // 보조 캔버스들의 크기를 메인 캔버스에 비례하여 조정합니다.
        this.adjustAuxiliaryCanvases(mainGameCanvasWidth, mainGameCanvasHeight);

        // 모든 관련 매니저들의 내부 치수 재계산 호출
        this.callRecalculateDimensions();
    }

    /**
     * 보조 캔버스들 (용병 패널, 전투 로그)의 CSS 크기를 조정합니다.
     * @param {number} [mainGameCanvasWidth=this.resolutionEngine.displayWidth] - 메인 게임 캔버스의 현재 CSS 너비
     * @param {number} [mainGameCanvasHeight=this.resolutionEngine.displayHeight] - 메인 게임 캔버스의 현재 CSS 높이
     */
    adjustAuxiliaryCanvases(mainGameCanvasWidth = this.resolutionEngine.displayWidth, mainGameCanvasHeight = this.resolutionEngine.displayHeight) {
        const mercenaryPanelExpectedHeightRatio = this.measureManager.get('mercenaryPanel.heightRatio');
        const combatLogExpectedHeightRatio = this.measureManager.get('combatLog.heightRatio');

        const mercenaryPanelCanvas = this.resolutionEngine.getCanvasElement('mercenaryPanelCanvas');
        const combatLogCanvas = this.resolutionEngine.getCanvasElement('combatLogCanvas');

        // 2. 용병 패널 캔버스 해상도 업데이트
        if (mercenaryPanelCanvas) {
            const mercenaryPanelHeight = Math.floor(mainGameCanvasHeight * mercenaryPanelExpectedHeightRatio);
            mercenaryPanelCanvas.style.width = `${mainGameCanvasWidth}px`;
            mercenaryPanelCanvas.style.height = `${mercenaryPanelHeight}px`;
            // MercenaryPanelManager가 자신의 캔버스 내부 해상도를 자체적으로 조정하도록 호출
            if (this.mercenaryPanelManager && this.mercenaryPanelManager.resizeCanvas) {
                this.mercenaryPanelManager.resizeCanvas();
            }
            console.log(`[CompatibilityManager] Mercenary Panel Canvas adjusted to: ${mainGameCanvasWidth}x${mercenaryPanelHeight}`);
        }

        // 3. 전투 로그 캔버스 해상도 업데이트
        if (combatLogCanvas) {
            const combatLogHeight = Math.floor(mainGameCanvasHeight * combatLogExpectedHeightRatio);
            combatLogCanvas.style.width = `${mainGameCanvasWidth}px`;
            combatLogCanvas.style.height = `${combatLogHeight}px`;
            // BattleLogManager가 자신의 캔버스 내부 해상도를 자체적으로 조정하도록 호출
            if (this.battleLogManager && this.battleLogManager.resizeCanvas) {
                this.battleLogManager.resizeCanvas();
            }
            console.log(`[CompatibilityManager] Combat Log Canvas adjusted to: ${mainGameCanvasWidth}x${combatLogHeight}`);
        }
    }

    // 모든 매니저의 재계산 메서드를 호출하는 헬퍼 함수
    callRecalculateDimensions() {
        if (this.uiEngine && this.uiEngine.recalculateUIDimensions) {
            this.uiEngine.recalculateUIDimensions();
        }
        if (this.mapManager && this.mapManager.recalculateMapDimensions) {
            this.mapManager.recalculateMapDimensions();
        }
        // MercenaryPanelManager와 BattleLogManager는 resizeCanvas 내에서 recalculatePanelDimensions/recalculateLogDimensions를 호출하도록 수정되었으므로, 여기서 다시 호출할 필요는 없습니다.
        // 그러나 혹시 다른 로직이 있다면 이 곳에서 호출될 수 있습니다.
        // if (this.mercenaryPanelManager && this.mercenaryPanelManager.recalculatePanelDimensions) {
        //     this.mercenaryPanelManager.recalculatePanelDimensions();
        // }
        // if (this.battleLogManager && this.battleLogManager.recalculateLogDimensions) {
        //     this.battleLogManager.recalculateLogDimensions();
        // }
        console.log("[CompatibilityManager] All relevant managers' dimensions recalculated.");
    }

    // 기존 adjustResolution 메서드는 이제 사용하지 않습니다.
    // ResolutionEngine이 메인 캔버스의 크기를 관리하며, CompatibilityManager는 보조 캔버스만 조정합니다.
    // GuardianManager의 최소 해상도 요구 사항은 ResolutionEngine이나 GuardianManager 자체에서 처리되어야 합니다.
    // adjustResolution() { /* ... */ }
}
