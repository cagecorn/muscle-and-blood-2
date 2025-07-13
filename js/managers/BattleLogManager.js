// js/managers/BattleLogManager.js

export class BattleLogManager {
    // ✨ resolutionEngine을 매개변수로 추가
    constructor(canvasElement, eventManager, measureManager, resolutionEngine) {
        console.log("📝 BattleLogManager initialized. Ready to record battle events. 📝");
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.eventManager = eventManager;
        this.measureManager = measureManager;
        this.resolutionEngine = resolutionEngine; // ✨ resolutionEngine 인스턴스 저장

        this.pixelRatio = window.devicePixelRatio || 1; // 이 캔버스 자체의 devicePixelRatio는 유지

        this.logMessages = [];
        
        // 이 캔버스는 CSS에 의해 크기가 조절되므로, 내부 해상도와 컨텍스트 스케일을 자체적으로 관리합니다.
        this.resizeCanvas();
        this.recalculateLogDimensions();

        // 윈도우 크기 변경 시에도 로그 패널의 크기를 업데이트합니다.
        // GameEngine의 ResolutionEngine에서 resolutionChanged 이벤트를 수신하여 처리하는 것이 더 통합적일 수 있습니다.
        // 현재는 BattleLogManager가 자신의 캔버스 크기를 직접 감지합니다.
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.recalculateLogDimensions();
        });
    }

    /**
     * 로그 패널의 내부 치수를 재계산합니다.
     * 이 메서드는 캔버스 크기가 변경될 때 호출되어야 합니다.
     */
    recalculateLogDimensions() {
        // measureManager에서 가져온 값은 기준 해상도 단위이므로, resolutionEngine으로 스케일링합니다.
        const measuredLineHeight = this.resolutionEngine.getScaledCoordinate(this.measureManager.get('combatLog.lineHeight'));
        const measuredPadding = this.resolutionEngine.getScaledCoordinate(this.measureManager.get('combatLog.padding'));

        this.padding = measuredPadding;
        this.lineHeight = measuredLineHeight;
        // 캔버스 height는 이미 devicePixelRatio가 적용된 내부 픽셀 단위이므로, pixelRatio로 다시 나누어 CSS 픽셀 기준으로 계산합니다.
        this.maxLogLines = Math.floor(((this.canvas.height / this.pixelRatio) - 2 * this.padding) / this.lineHeight);
        
        while (this.logMessages.length > this.maxLogLines) {
            this.logMessages.shift();
        }
        console.log(`[BattleLogManager] Log dimensions recalculated. Canvas size: ${this.canvas.width}x${this.canvas.height}, Max lines: ${this.maxLogLines}`);
        // resizeCanvas()는 이미 윈도우 리사이즈 이벤트에서 호출되거나 초기화 시 호출되므로 여기서는 제거합니다.
        // this.resizeCanvas();
    }

    /**
     * 캔버스 내부의 그리기 버퍼 해상도를 실제 표시 크기와 픽셀 비율에 맞춰 조정합니다.
     * 이 캔버스는 메인 게임 캔버스와 별개로 자신의 해상도를 관리합니다.
     */
    resizeCanvas() {
        // 캔버스의 실제 표시 크기 (CSS 픽셀)를 가져옵니다.
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;

        // 현재 캔버스 내부 해상도가 다르면 업데이트합니다.
        if (this.canvas.width !== displayWidth * this.pixelRatio ||
            this.canvas.height !== displayHeight * this.pixelRatio) {
            this.canvas.width = displayWidth * this.pixelRatio;
            this.canvas.height = displayHeight * this.pixelRatio;
            this.ctx = this.canvas.getContext('2d');
            // 이 캔버스는 자체적으로 devicePixelRatio 스케일을 적용합니다.
            // GameEngine의 메인 컨텍스트에 적용된 gameScaleRatio는 여기에 적용되지 않습니다.
            this.ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0); 
            console.log(`[BattleLogManager] Canvas internal resolution set to: ${this.canvas.width}x${this.canvas.height} (Display: ${displayWidth}x${displayHeight}, Ratio: ${this.pixelRatio})`);
            this.recalculateLogDimensions(); // 크기 변경 후 로그 치수 다시 계산
        }
    }

    /**
     * 이벤트 리스너를 설정하는 메서드. 이제 GameEngine에서 명시적으로 호출됩니다.
     */
    _setupEventListeners() {
        // 전투 관련 이벤트를 구독하여 로그에 추가
        this.eventManager.subscribe('unitAttackAttempt', (data) => {
            this.addLog(`${data.attackerId}가 ${data.targetId}를 공격 시도!`);
        });
        this.eventManager.subscribe('DAMAGE_CALCULATED', (data) => { // BattleCalculationWorker에서 발생
            this.addLog(`${data.unitId}가 ${data.damageDealt} 피해를 입고 HP ${data.newHp}가 됨.`);
        });
        this.eventManager.subscribe('unitDeath', (data) => {
            this.addLog(`${data.unitName} (ID: ${data.unitId})이(가) 쓰러졌습니다!`);
        });
        this.eventManager.subscribe('turnStart', (data) => {
            this.addLog(`--- 턴 ${data.turn} 시작 ---`);
        });
        this.eventManager.subscribe('battleStart', (data) => {
            this.addLog(`[전투 시작] 맵: ${data.mapId}, 난이도: ${data.difficulty}`);
        });
        this.eventManager.subscribe('battleEnd', (data) => {
            this.addLog(`[전투 종료] 이유: ${data.reason}`);
        });
    }

    addLog(message) {
        const timestamp = new Date().toLocaleTimeString();
        this.logMessages.push(`[${timestamp}] ${message}`);
        if (this.logMessages.length > this.maxLogLines) {
            this.logMessages.shift();
        }
        console.log(`[BattleLog] ${message}`);
    }

    // draw 메서드는 이제 인자로 ctx를 받지 않고, 내부적으로 this.ctx를 사용합니다.
    draw() {
        // 캔버스 전체를 지우고 배경을 그립니다. (이미 pixelRatio 스케일이 적용된 컨텍스트)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = 'white';
        // 폰트 크기 계산 시에도 resolutionEngine의 스케일링을 적용합니다.
        // Math.floor는 픽셀이 아닌 논리적 크기를 기준으로 합니다.
        this.ctx.font = `${Math.floor(this.resolutionEngine.getScaledCoordinate(this.lineHeight * 0.8))}px Arial`;
        this.ctx.textBaseline = 'top';

        for (let i = 0; i < this.logMessages.length; i++) {
            const message = this.logMessages[i];
            // 텍스트 위치도 resolutionEngine의 스케일링을 적용합니다.
            const x = this.resolutionEngine.getScaledCoordinate(this.padding);
            const y = this.resolutionEngine.getScaledCoordinate(this.padding + i * this.lineHeight);
            this.ctx.fillText(message, x, y);
        }
    }
}
