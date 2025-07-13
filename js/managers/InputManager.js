// js/managers/InputManager.js

export class InputManager {
    // ✨ resolutionEngine을 매개변수로 추가
    constructor(renderer, cameraEngine, uiEngine, resolutionEngine) {
        console.log("🎮 InputManager initialized. Ready to process user input. 🎮");
        this.renderer = renderer;
        this.cameraEngine = cameraEngine;
        this.uiEngine = uiEngine;
        this.resolutionEngine = resolutionEngine; // ✨ resolutionEngine 인스턴스 저장

        this.canvas = this.renderer.canvas; // 메인 게임 캔버스

        this.isDragging = false;
        this.lastMouseX_base = 0; // 기준 해상도 단위
        this.lastMouseY_base = 0; // 기준 해상도 단위

        this._addEventListeners();
    }

    _addEventListeners() {
        this.canvas.addEventListener('mousedown', this._onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this._onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this._onMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this._onMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this._onMouseWheel.bind(this), { passive: false });
        this.canvas.addEventListener('click', this._onClick.bind(this));
    }

    /**
     * 브라우저 클라이언트 좌표를 게임의 기준 해상도 좌표로 변환합니다.
     * @param {number} clientX - 브라우저 뷰포트 기준 X 좌표
     * @param {number} clientY - 브라우저 뷰포트 기준 Y 좌표
     * @returns {{x: number, y: number}} 게임의 기준 해상도 단위 좌표
     */
    _getGameCoordinates(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        // 캔버스 CSS 픽셀 기준 상대 좌표
        const cssX = clientX - rect.left;
        const cssY = clientY - rect.top;

        // ResolutionEngine의 현재 스케일 비율을 사용하여 기준 해상도 좌표로 역변환
        // 이 때, ResolutionEngine은 mainCtx에 devicePixelRatio와 gameScaleRatio를 모두 적용하므로,
        // 이를 되돌리기 위해 두 스케일 비율을 모두 고려해야 합니다.
        // 하지만 getScaledCoordinate는 논리적 좌표를 스케일된 픽셀로 바꾸므로,
        // 반대는 스케일된 픽셀을 논리적 좌표로 바꾸는 getInverseScaledCoordinate가 필요합니다.
        // 현재 resolutionEngine에 getInverseScaledCoordinate가 없으므로 임시로 직접 계산합니다.
        // 이 부분은 ResolutionEngine에 getInverseScaledCoordinate 메서드를 추가하는 것이 좋습니다.
        
        // ResolutionEngine의 최종 스케일은 devicePixelRatio * gameScaleRatio 이므로,
        // 역변환 시에는 (값 / devicePixelRatio) / gameScaleRatio 를 해야 합니다.
        // getScaledCoordinate(value) => value * devicePixelRatio * gameScaleRatio
        // inverseScaledCoordinate(value) => value / (devicePixelRatio * gameScaleRatio)

        const totalScale = this.resolutionEngine.devicePixelRatio * this.resolutionEngine.currentScaleRatio;
        const gameX = cssX / totalScale;
        const gameY = cssY / totalScale;
        
        return { x: gameX, y: gameY };
    }


    _onMouseDown(event) {
        const { x: gameMouseX, y: gameMouseY } = this._getGameCoordinates(event.clientX, event.clientY);

        if (this.uiEngine.getUIState() === 'mapScreen' && this.uiEngine.isClickOnButton(gameMouseX, gameMouseY)) {
            this.isDragging = false;
            console.log(`[InputManager Debug] MouseDown on Button detected: ClientX=${event.clientX}, ClientY=${event.clientY}, GameX=${gameMouseX.toFixed(2)}, GameY=${gameMouseY.toFixed(2)}`);
            return;
        }

        this.isDragging = true;
        this.lastMouseX_base = gameMouseX; // 기준 해상도 단위로 저장
        this.lastMouseY_base = gameMouseY; // 기준 해상도 단위로 저장
        this.canvas.style.cursor = 'grabbing';
    }

    _onMouseMove(event) {
        if (this.isDragging) {
            const { x: currentGameMouseX, y: currentGameMouseY } = this._getGameCoordinates(event.clientX, event.clientY);
            
            // 기준 해상도 단위의 이동량
            const dx_base = currentGameMouseX - this.lastMouseX_base;
            const dy_base = currentGameMouseY - this.lastMouseY_base;
            
            // CameraEngine.pan은 기준 해상도 단위의 이동량을 받습니다.
            this.cameraEngine.pan(dx_base, dy_base);
            
            this.lastMouseX_base = currentGameMouseX;
            this.lastMouseY_base = currentGameMouseY;
        }
    }

    _onMouseUp() {
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
    }

    _onMouseWheel(event) {
        event.preventDefault();

        const zoomAmount = event.deltaY > 0 ? -0.1 : 0.1;
        // 마우스 휠 위치도 기준 해상도 단위로 변환하여 전달
        const { x: gameMouseX, y: gameMouseY } = this._getGameCoordinates(event.clientX, event.clientY);

        // CameraEngine.zoomAt은 기준 해상도 단위의 마우스 좌표를 받습니다.
        this.cameraEngine.zoomAt(zoomAmount, gameMouseX, gameMouseY);
    }

    _onClick(event) {
        // 클릭 위치를 게임의 기준 해상도 좌표로 변환
        const { x: gameMouseX, y: gameMouseY } = this._getGameCoordinates(event.clientX, event.clientY);

        console.log(`[InputManager Debug] Click event received: ClientX=${event.clientX}, ClientY=${event.clientY}`);
        console.log(`[InputManager Debug] Game World Mouse: X=${gameMouseX.toFixed(2)}, Y=${gameMouseY.toFixed(2)}`);
        console.log(`[InputManager Debug] Current UI State: ${this.uiEngine.getUIState()}`);

        // UIEngine.isClickOnButton은 기준 해상도 단위의 좌표를 받습니다.
        if (this.uiEngine.isClickOnButton(gameMouseX, gameMouseY)) {
            console.log(`[InputManager Debug] isClickOnButton returned TRUE. Attempting to handle battle start.`);
            this.uiEngine.handleBattleStartClick();
        } else {
            console.log(`[InputManager Debug] isClickOnButton returned FALSE. Not a button click.`);
        }
    }
}
