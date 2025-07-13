// js/ResolutionEngine.js

class ResolutionEngine {
    constructor(canvasId, baseWidth, baseHeight) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.baseWidth = baseWidth;
        this.baseHeight = baseHeight;
        this.scaleRatio = 1;

        // 고해상도 지원을 위해 캔버스 해상도 보정
        this.devicePixelRatio = window.devicePixelRatio || 1; 

        this.setupCanvas();
        window.addEventListener('resize', this.setupCanvas.bind(this));
    }

    setupCanvas() {
        // CSS 픽셀 크기 설정 (화면을 꽉 채우도록)
        const displayWidth = window.innerWidth;
        const displayHeight = window.innerHeight;

        // 캔버스의 내부 해상도를 CSS 픽셀 크기 * 장치 픽셀 비율로 설정
        this.canvas.width = displayWidth * this.devicePixelRatio;
        this.canvas.height = displayHeight * this.devicePixelRatio;

        // 캔버스 요소의 실제 표시 크기를 CSS 픽셀 크기로 설정
        this.canvas.style.width = displayWidth + 'px';
        this.canvas.style.height = displayHeight + 'px';

        // 기준 해상도 대비 현재 화면 크기의 스케일 비율 계산
        // 너비와 높이 중 더 작은 스케일 비율을 사용하여 화면에 잘리지 않도록 합니다.
        const widthRatio = displayWidth / this.baseWidth;
        const heightRatio = displayHeight / this.baseHeight;
        this.scaleRatio = Math.min(widthRatio, heightRatio);

        // 캔버스 렌더링 컨텍스트에 스케일 적용 (고해상도 지원)
        this.ctx.setTransform(this.devicePixelRatio, 0, 0, this.devicePixelRatio, 0, 0);

        // 게임 요소들을 그릴 때 사용될 스케일 비율을 설정 (게임 로직에서 활용)
        // 이 스케일 비율은 게임 내부의 좌표나 크기를 조절하는 데 사용됩니다.
        this.ctx.scale(this.scaleRatio, this.scaleRatio);

        console.log(`Canvas resized to: ${displayWidth}x${displayHeight} (CSS) / ${this.canvas.width}x${this.canvas.height} (Internal)`);
        console.log(`Scale Ratio: ${this.scaleRatio.toFixed(2)}`);

        // 해상도 변경 이벤트를 발생시켜 다른 게임 모듈에 알립니다.
        const event = new CustomEvent('resolutionChanged', {
            detail: {
                currentWidth: displayWidth,
                currentHeight: displayHeight,
                scaleRatio: this.scaleRatio,
                baseWidth: this.baseWidth,
                baseHeight: this.baseHeight
            }
        });
        window.dispatchEvent(event);
    }

    // 현재 캔버스의 표시 너비를 가져옵니다.
    get displayWidth() {
        return parseInt(this.canvas.style.width);
    }

    // 현재 캔버스의 표시 높이를 가져옵니다.
    get displayHeight() {
        return parseInt(this.canvas.style.height);
    }

    // 현재 스케일 비율을 가져옵니다.
    get currentScaleRatio() {
        return this.scaleRatio;
    }

    // 캔버스 컨텍스트를 반환합니다.
    get context() {
        return this.ctx;
    }

    // 게임 요소를 그릴 때 이 함수를 사용하여 스케일링된 좌표를 얻을 수 있습니다.
    getScaledCoordinate(value) {
        return value * this.scaleRatio;
    }
}

// 게임 시작 시 해상도 엔진을 초기화합니다.
// 게임의 '아주 아주 고해상도'를 반영하여 기준 해상도를 높게 설정합니다.
// 예시로 1920x1080을 사용했지만, 필요에 따라 더 높게 설정할 수 있습니다.
window.onload = () => {
    const BASE_GAME_WIDTH = 1920; 
    const BASE_GAME_HEIGHT = 1080;
    window.resolutionEngine = new ResolutionEngine('gameCanvas', BASE_GAME_WIDTH, BASE_GAME_HEIGHT);

    // 이제 resolutionEngine 인스턴스를 통해 캔버스 및 스케일 정보에 접근할 수 있습니다.
    // 예: const ctx = window.resolutionEngine.context;
    //     ctx.fillRect(resolutionEngine.getScaledCoordinate(50), resolutionEngine.getScaledCoordinate(50), resolutionEngine.getScaledCoordinate(100), resolutionEngine.getScaledCoordinate(100));

    // 해상도 변경 이벤트 리스너 (다른 모듈에서 사용 예시)
    window.addEventListener('resolutionChanged', (event) => {
        console.log('Resolution changed event received:', event.detail);
        // 여기서 게임의 다른 시각적 요소들을 업데이트하는 로직을 추가할 수 있습니다.
        // 예를 들어, 배경 이미지 크기를 조정하거나 UI 요소의 위치를 재계산합니다.
    });

    // 초기 렌더링을 위해 한 번 호출 (테스트용)
    const ctx = window.resolutionEngine.context;
    const scaledX = window.resolutionEngine.getScaledCoordinate(50);
    const scaledY = window.resolutionEngine.getScaledCoordinate(50);
    const scaledSize = window.resolutionEngine.getScaledCoordinate(100);
    
    ctx.fillStyle = 'blue';
    ctx.fillRect(scaledX, scaledY, scaledSize, scaledSize);
    
    ctx.fillStyle = 'white';
    ctx.font = `${window.resolutionEngine.getScaledCoordinate(30)}px Arial`;
    ctx.fillText("게임 준비 중...", window.resolutionEngine.getScaledCoordinate(100), window.resolutionEngine.getScaledCoordinate(200));

    // TODO: 여기에 실제 게임 초기화 및 로딩 로직을 추가하세요.
};
