// js/ResolutionEngine.js

export class ResolutionEngine {
    constructor(mainCanvasId, baseWidth, baseHeight) {
        this.mainCanvas = document.getElementById(mainCanvasId);
        if (!this.mainCanvas) {
            console.error(`ResolutionEngine: Main canvas with ID "${mainCanvasId}" not found.`);
            throw new Error("Main canvas not found.");
        }
        this.mainCtx = this.mainCanvas.getContext('2d');
        this.baseWidth = baseWidth;
        this.baseHeight = baseHeight;
        this.scaleRatio = 1;

        // 고해상도 지원을 위한 장치 픽셀 비율
        this.devicePixelRatio = window.devicePixelRatio || 1; 

        // 윈도우 크기 변경 시 캔버스도 함께 조정되도록 이벤트 리스너 추가
        window.addEventListener('resize', this.setupCanvas.bind(this));
        
        // 초기 캔버스 설정 호출
        this.setupCanvas();

        console.log("ResolutionEngine initialized.");
    }

    /**
     * 메인 캔버스의 크기를 설정하고 그리기 컨텍스트에 스케일을 적용합니다.
     * 이 함수는 윈도우 크기가 변경될 때마다 호출됩니다.
     */
    setupCanvas() {
        // CSS 픽셀 크기 설정 (화면을 꽉 채우도록)
        const displayWidth = window.innerWidth;
        const displayHeight = window.innerHeight;

        // 메인 캔버스 요소의 실제 표시 크기를 CSS 픽셀 크기로 설정
        this.mainCanvas.style.width = displayWidth + 'px';
        this.mainCanvas.style.height = displayHeight + 'px';

        // 캔버스의 내부 해상도를 CSS 픽셀 크기 * 장치 픽셀 비율로 설정
        // 이렇게 하면 고해상도 디스플레이에서 이미지가 뭉개지지 않고 선명하게 보입니다.
        this.mainCanvas.width = displayWidth * this.devicePixelRatio;
        this.mainCanvas.height = displayHeight * this.devicePixelRatio;

        // 기준 해상도 대비 현재 화면 크기의 스케일 비율 계산
        // 너비와 높이 중 더 작은 스케일 비율을 사용하여 화면에 잘리지 않도록 합니다.
        const widthRatio = displayWidth / this.baseWidth;
        const heightRatio = displayHeight / this.baseHeight;
        this.scaleRatio = Math.min(widthRatio, heightRatio);

        // 캔버스 렌더링 컨텍스트의 변환 행렬을 재설정하고 스케일을 적용합니다.
        // 이전에 적용된 스케일을 초기화하고, devicePixelRatio와 계산된 scaleRatio를 적용합니다.
        this.mainCtx.setTransform(1, 0, 0, 1, 0, 0); // 기존 변환 초기화
        this.mainCtx.scale(this.devicePixelRatio, this.devicePixelRatio); // 장치 픽셀 비율 적용
        this.mainCtx.scale(this.scaleRatio, this.scaleRatio); // 게임 스케일 비율 적용

        console.log(`[ResolutionEngine] Canvas resized to: ${displayWidth}x${displayHeight} (CSS) / ${this.mainCanvas.width}x${this.mainCanvas.height} (Internal)`);
        console.log(`[ResolutionEngine] Scale Ratio (Game Content): ${this.scaleRatio.toFixed(2)}`);
        console.log(`[ResolutionEngine] Device Pixel Ratio: ${this.devicePixelRatio}`);

        // 해상도 변경 이벤트를 발생시켜 다른 게임 모듈에 알립니다.
        const event = new CustomEvent('resolutionChanged', {
            detail: {
                currentWidth: displayWidth,
                currentHeight: displayHeight,
                scaleRatio: this.scaleRatio,
                baseWidth: this.baseWidth,
                baseHeight: this.baseHeight,
                devicePixelRatio: this.devicePixelRatio
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * 현재 메인 캔버스의 표시 너비 (CSS 픽셀)를 가져옵니다.
     */
    get displayWidth() {
        return parseInt(this.mainCanvas.style.width);
    }

    /**
     * 현재 메인 캔버스의 표시 높이 (CSS 픽셀)를 가져옵니다.
     */
    get displayHeight() {
        return parseInt(this.mainCanvas.style.height);
    }

    /**
     * 게임 콘텐츠 스케일 비율을 가져옵니다. (기준 해상도 대비 현재 표시 해상도의 비율)
     */
    get currentScaleRatio() {
        return this.scaleRatio;
    }

    /**
     * 메인 캔버스 컨텍스트를 반환합니다.
     */
    get mainContext() {
        return this.mainCtx;
    }

    /**
     * 기준 해상도 값을 현재 화면 해상도에 맞춰 스케일링된 값으로 변환합니다.
     * 게임 내 모든 좌표, 크기 계산에 사용되어야 합니다.
     * @param {number} value - 기준 해상도에서의 값
     * @returns {number} - 스케일링된 값
     */
    getScaledCoordinate(value) {
        return value * this.scaleRatio;
    }

    /**
     * 지정된 ID의 캔버스 요소를 가져옵니다.
     * @param {string} id - 캔버스 요소의 ID
     * @returns {HTMLCanvasElement|null} - 해당 ID의 캔버스 요소 또는 null
     */
    getCanvasElement(id) {
        return document.getElementById(id);
    }
}
