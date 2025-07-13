// js/managers/InputManager.js

export class InputManager {
    constructor(renderer, cameraEngine, uiEngine) {
        console.log("\ud83c\udfae InputManager initialized. Ready to process user input. \ud83c\udfae");
        this.renderer = renderer;
        this.cameraEngine = cameraEngine;
        this.uiEngine = uiEngine;

        this.canvas = this.renderer.canvas;

        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this._addEventListeners();
    }

    _addEventListeners() {
        this.canvas.addEventListener('mousedown', this._onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this._onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this._onMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this._onMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this._onMouseWheel.bind(this), { passive: false });
        this.canvas.addEventListener('click', this._onClick.bind(this)); // 클릭 이벤트 리스너
    }

    _onMouseDown(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        if (this.uiEngine.getUIState() === 'mapScreen' && this.uiEngine.isClickOnButton(mouseX, mouseY)) {
            this.isDragging = false;
            // ✨ 추가: 마우스 다운 시 버튼 클릭 시도 감지
            console.log(`[InputManager Debug] MouseDown on Button detected: ClientX=${event.clientX}, ClientY=${event.clientY}`);
            return;
        }

        this.isDragging = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        this.canvas.style.cursor = 'grabbing';
    }

    _onMouseMove(event) {
        if (this.isDragging) {
            const dx = event.clientX - this.lastMouseX;
            const dy = event.clientY - this.lastMouseY;
            this.cameraEngine.pan(dx, dy);
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
        }
    }

    _onMouseUp() {
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
    }

    _onMouseWheel(event) {
        event.preventDefault();

        const zoomAmount = event.deltaY > 0 ? -0.1 : 0.1;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        this.cameraEngine.zoomAt(zoomAmount, mouseX, mouseY);
    }

    _onClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left; // 캔버스 내부 논리적 X 좌표
        const mouseY = event.clientY - rect.top;   // 캔버스 내부 논리적 Y 좌표

        // ✨ 추가: 클릭 이벤트 발생 시 상세 로그
        console.log(`[InputManager Debug] Click event received: ClientX=${event.clientX}, ClientY=${event.clientY}`);
        console.log(`[InputManager Debug] Canvas Local Mouse: X=${mouseX}, Y=${mouseY}`);
        console.log(`[InputManager Debug] Current UI State: ${this.uiEngine.getUIState()}`);


        // 이미 계산된 캔버스 내부 좌표를 전달하여 중복 계산을 방지합니다.
        if (this.uiEngine.isClickOnButton(mouseX, mouseY)) {
            // ✨ 추가: isClickOnButton이 true를 반환했는지 확인
            console.log(`[InputManager Debug] isClickOnButton returned TRUE. Attempting to handle battle start.`);
            this.uiEngine.handleBattleStartClick();
        } else {
            // ✨ 추가: isClickOnButton이 false를 반환했는지 확인
            console.log(`[InputManager Debug] isClickOnButton returned FALSE. Not a button click.`);
        }
    }
}
