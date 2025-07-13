// js/managers/MercenaryPanelManager.js

export class MercenaryPanelManager {
    // ✨ resolutionEngine을 매개변수로 추가
    constructor(mercenaryCanvasElement, measureManager, battleSimulationManager, logicManager, resolutionEngine) {
        console.log("👥 MercenaryPanelManager initialized. Ready to display mercenary details. 👥");
        this.canvas = mercenaryCanvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.measureManager = measureManager;
        this.battleSimulationManager = battleSimulationManager;
        this.logicManager = logicManager;
        this.resolutionEngine = resolutionEngine; // ✨ resolutionEngine 인스턴스 저장

        this.gridRows = this.measureManager.get('mercenaryPanel.gridRows');
        this.gridCols = this.measureManager.get('mercenaryPanel.gridCols');
        this.numSlots = this.gridRows * this.gridCols;

        this.pixelRatio = window.devicePixelRatio || 1; // 이 캔버스 자체의 devicePixelRatio

        // 이 캔버스는 CSS에 의해 크기가 조절되므로, 내부 해상도와 컨텍스트 스케일을 자체적으로 관리합니다.
        this.resizeCanvas(); // 초기 크기 조정
        // recalculatePanelDimensions는 resizeCanvas 내부에서 호출되도록 변경

        // 윈도우 크기 변경 시에도 패널의 크기를 업데이트합니다.
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }

    /**
     * 패널의 내부 치수(슬롯 크기 등)를 재계산합니다.
     * 이 메서드는 캔버스 크기가 변경될 때 호출되어야 합니다.
     * 여기서 계산되는 slotWidth와 slotHeight는 CSS 픽셀 단위입니다 (devicePixelRatio 적용 후).
     */
    recalculatePanelDimensions() {
        // ✨ 캔버스 요소의 현재 내부 픽셀 크기 (devicePixelRatio가 적용된)를 사용합니다.
        // 그리고 이를 CSS 픽셀 기준으로 나누어 슬롯 크기를 계산합니다.
        this.slotWidth = (this.canvas.width / this.pixelRatio) / this.gridCols;
        this.slotHeight = (this.canvas.height / this.pixelRatio) / this.gridRows;
        console.log(`[MercenaryPanelManager] Panel dimensions recalculated. Canvas size: ${this.canvas.width}x${this.canvas.height}, Slot size: ${this.slotWidth.toFixed(2)}x${this.slotHeight.toFixed(2)} (CSS Pixels)`);
    }

    /**
     * 캔버스 내부 해상도를 CSS 크기와 pixelRatio에 맞춰 조정합니다.
     * 이 캔버스는 메인 게임 캔버스와 별개로 자신의 해상도를 관리합니다.
     */
    resizeCanvas() {
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;

        if (this.canvas.width !== displayWidth * this.pixelRatio ||
            this.canvas.height !== displayHeight * this.pixelRatio) {
            this.canvas.width = displayWidth * this.pixelRatio;
            this.canvas.height = displayHeight * this.pixelRatio;
            this.ctx = this.canvas.getContext('2d');
            // 이 캔버스 컨텍스트에는 자체적으로 devicePixelRatio만 스케일링합니다.
            // 게임 콘텐츠의 전역 스케일 비율은 그리기 함수에서 getScaledCoordinate를 통해 적용됩니다.
            this.ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
            console.log(`[MercenaryPanelManager] Canvas internal resolution set to: ${this.canvas.width}x${this.canvas.height} (Display: ${displayWidth}x${displayHeight}, Ratio: ${this.pixelRatio})`);
            this.recalculatePanelDimensions(); // 크기 변경 후 패널 치수 다시 계산
        }
    }

    /**
     * 용병 패널과 그리드를 그립니다.
     * 이 메서드는 PanelEngine에 의해 호출되며, 이제 인자를 받지 않고 내부 this.ctx를 사용합니다.
     */
    draw() {
        // 캔버스 전체를 지우고 배경을 그립니다. (이미 pixelRatio 스케일이 적용된 컨텍스트)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#1A1A1A';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 선 굵기도 스케일링 (전역 스케일 비율에 따름)
        this.ctx.strokeStyle = '#555';
        this.ctx.lineWidth = this.resolutionEngine.getScaledCoordinate(1);

        for (let i = 0; i <= this.gridCols; i++) {
            this.ctx.beginPath();
            // ✨ 모든 좌표에 resolutionEngine의 getScaledCoordinate() 적용
            const x = this.resolutionEngine.getScaledCoordinate(i * this.slotWidth);
            const y1 = this.resolutionEngine.getScaledCoordinate(0);
            const y2 = this.resolutionEngine.getScaledCoordinate(this.canvas.height / this.pixelRatio); // 이 높이는 CSS 픽셀 기준
            this.ctx.moveTo(x, y1);
            this.ctx.lineTo(x, y2);
            this.ctx.stroke();
        }
        for (let i = 0; i <= this.gridRows; i++) {
            this.ctx.beginPath();
            // ✨ 모든 좌표에 resolutionEngine의 getScaledCoordinate() 적용
            const x1 = this.resolutionEngine.getScaledCoordinate(0);
            const x2 = this.resolutionEngine.getScaledCoordinate(this.canvas.width / this.pixelRatio); // 이 너비는 CSS 픽셀 기준
            const y = this.resolutionEngine.getScaledCoordinate(i * this.slotHeight);
            this.ctx.moveTo(x1, y);
            this.ctx.lineTo(x2, y);
            this.ctx.stroke();
        }

        const units = this.battleSimulationManager ? this.battleSimulationManager.unitsOnGrid : [];
        this.ctx.fillStyle = 'white';
        // 폰트 크기도 스케일링
        this.ctx.font = `${this.resolutionEngine.getScaledCoordinate(14)}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        for (let i = 0; i < this.numSlots; i++) {
            const row = Math.floor(i / this.gridCols);
            const col = i % this.gridCols;
            // ✨ 슬롯 위치도 스케일링된 값으로 계산
            const x = this.resolutionEngine.getScaledCoordinate(col * this.slotWidth + this.slotWidth / 2);
            const y = this.resolutionEngine.getScaledCoordinate(row * this.slotHeight + this.slotHeight / 2);

            if (units[i]) {
                const unit = units[i];
                // 텍스트 위치도 스케일링된 값으로 조정
                this.ctx.fillText(`${unit.name}`, x, y - this.resolutionEngine.getScaledCoordinate(10));
                this.ctx.fillText(`HP: ${unit.currentHp}/${unit.baseStats.hp}`, x, y + this.resolutionEngine.getScaledCoordinate(10));
                if (unit.image) {
                    // 이미지 크기와 위치도 스케일링된 값으로 조정
                    const imgSize = this.resolutionEngine.getScaledCoordinate(Math.min(this.slotWidth, this.slotHeight) * 0.7);
                    const imgX = this.resolutionEngine.getScaledCoordinate(col * this.slotWidth + (this.slotWidth - imgSize / this.resolutionEngine.currentScaleRatio) / 2); // 이미지 사이즈는 이미 스케일링된 크기이므로 역변환하여 계산
                    const imgY = this.resolutionEngine.getScaledCoordinate(row * this.slotHeight + (this.slotHeight - imgSize / this.resolutionEngine.currentScaleRatio) / 2 - 25);
                    this.ctx.drawImage(unit.image, imgX, imgY, imgSize, imgSize);
                }
            } else {
                this.ctx.fillText(`Slot ${i + 1}`, x, y);
            }
        }
    }
}
