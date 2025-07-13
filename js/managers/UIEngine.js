// js/managers/UIEngine.js

export class UIEngine {
    // ✨ resolutionEngine을 매개변수로 추가
    constructor(renderer, measureManager, eventManager, resolutionEngine) {
        console.log("🎛️ UIEngine initialized. Ready to draw interfaces. 🎛️");
        this.renderer = renderer;
        this.measureManager = measureManager;
        this.eventManager = eventManager;
        this.resolutionEngine = resolutionEngine; // ✨ resolutionEngine 인스턴스 저장

        this.canvas = renderer.canvas; // 메인 게임 캔버스
        this.ctx = renderer.ctx;       // 메인 게임 캔버스 컨텍스트

        this._currentUIState = 'mapScreen';

        // UI 요소의 기준 해상도 단위 치수를 계산합니다.
        this.recalculateUIDimensions();

        // battleStartButton은 recalculateUIDimensions 내부에서 정의되므로, 여기서는 초기화만.
        // this.battleStartButton은 recalculateUIDimensions에서 다시 할당됨.

        console.log("[UIEngine] Initialized for overlay UI rendering.");
    }

    /**
     * UI 요소의 기준 해상도 단위 치수를 재계산합니다.
     * 이 메서드는 해상도 변경 시 또는 초기화 시 호출됩니다.
     */
    recalculateUIDimensions() {
        console.log("[UIEngine] Recalculating UI dimensions based on MeasureManager (base units)...");
        // MeasureManager에서 가져오는 값들은 이제 모두 '기준 해상도' 단위입니다.
        // mapPanelWidth/HeightRatio는 이제 resolutionEngine.baseWidth/Height에 대한 비율로 사용됩니다.
        this.mapPanelWidth = this.resolutionEngine.baseWidth * this.measureManager.get('ui.mapPanelWidthRatio');
        this.mapPanelHeight = this.resolutionEngine.baseHeight * this.measureManager.get('ui.mapPanelHeightRatio');
        this.buttonHeight = this.measureManager.get('ui.buttonHeight'); // 기준 해상도 단위
        this.buttonWidth = this.measureManager.get('ui.buttonWidth');   // 기준 해상도 단위
        this.buttonMargin = this.measureManager.get('ui.buttonMargin'); // 기준 해상도 단위

        // 전투 시작 버튼 위치 및 크기 (모두 기준 해상도 단위)
        this.battleStartButton = {
            // 버튼을 중앙 하단에 배치
            x: (this.resolutionEngine.baseWidth - this.buttonWidth) / 2,
            y: this.resolutionEngine.baseHeight - this.buttonHeight - this.buttonMargin,
            width: this.buttonWidth,
            height: this.buttonHeight,
            text: '전투 시작'
        };

        console.log(`[UIEngine Debug] Battle Start Button (Base Units): X=${this.battleStartButton.x}, Y=${this.battleStartButton.y}, Width=${this.battleStartButton.width}, Height=${this.battleStartButton.height}`);
        console.log(`[UIEngine Debug] Canvas Base Dimensions: ${this.resolutionEngine.baseWidth}x${this.resolutionEngine.baseHeight}`);
    }

    getUIState() {
        return this._currentUIState;
    }

    setUIState(newState) {
        this._currentUIState = newState;
        console.log(`[UIEngine] Internal UI state updated to: ${newState}`);
    }

    /**
     * 마우스 클릭이 버튼 영역 내에 있는지 확인합니다.
     * mouseX, mouseY는 InputManager로부터 이미 '기준 해상도' 단위로 변환되어 전달됩니다.
     * @param {number} mouseX - 게임의 기준 해상도 단위 X 좌표
     * @param {number} mouseY - 게임의 기준 해상도 단위 Y 좌표
     * @returns {boolean}
     */
    isClickOnButton(mouseX, mouseY) {
        if (this._currentUIState !== 'mapScreen') {
            return false;
        }

        const button = this.battleStartButton; // button의 x, y, width, height는 이미 기준 해상도 단위입니다.

        return (
            mouseX >= button.x && mouseX <= button.x + button.width &&
            mouseY >= button.y && mouseY <= button.y + button.height
        );
    }

    handleBattleStartClick() {
        console.log("[UIEngine] '전투 시작' 버튼 클릭 처리됨!");
        this.eventManager.emit('battleStart', { mapId: 'currentMap', difficulty: 'normal' });
    }

    /**
     * UI 요소들을 캔버스에 그립니다.
     * @param {CanvasRenderingContext2D} ctx - 그리기 대상이 되는 캔버스 컨텍스트 (ResolutionEngine에 의해 이미 스케일링됨)
     */
    draw(ctx) {
        if (this._currentUIState === 'mapScreen') {
            ctx.fillStyle = 'darkgreen';
            // ✨ 모든 그리기 좌표와 크기에 resolutionEngine.getScaledCoordinate() 적용
            ctx.fillRect(
                this.resolutionEngine.getScaledCoordinate(this.battleStartButton.x),
                this.resolutionEngine.getScaledCoordinate(this.battleStartButton.y),
                this.resolutionEngine.getScaledCoordinate(this.battleStartButton.width),
                this.resolutionEngine.getScaledCoordinate(this.battleStartButton.height)
            );
            ctx.fillStyle = 'white';
            // ✨ 폰트 크기에도 resolutionEngine.getScaledCoordinate() 적용
            ctx.font = `${this.resolutionEngine.getScaledCoordinate(24)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // 텍스트 위치도 스케일링된 값으로 계산
            ctx.fillText(
                this.battleStartButton.text,
                this.resolutionEngine.getScaledCoordinate(this.battleStartButton.x + this.battleStartButton.width / 2),
                this.resolutionEngine.getScaledCoordinate(this.battleStartButton.y + this.battleStartButton.height / 2 + 8)
            );
        } else if (this._currentUIState === 'combatScreen') {
            ctx.fillStyle = 'white';
            // ✨ 폰트 크기에도 resolutionEngine.getScaledCoordinate() 적용
            ctx.font = `${this.resolutionEngine.getScaledCoordinate(48)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // 전투 진행 중! 텍스트 위치도 스케일링된 값으로 계산
            ctx.fillText('전투 진행 중!', 
                this.resolutionEngine.getScaledCoordinate(this.resolutionEngine.baseWidth / 2), 
                this.resolutionEngine.getScaledCoordinate(50)
            );
        }
    }

    getMapPanelDimensions() {
        return {
            width: this.mapPanelWidth, // 기준 해상도 단위
            height: this.mapPanelHeight // 기준 해상도 단위
        };
    }

    getButtonDimensions() {
        return {
            width: this.battleStartButton.width, // 기준 해상도 단위
            height: this.battleStartButton.height // 기준 해상도 단위
        };
    }
}
