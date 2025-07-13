// js/managers/MercenaryPanelManager.js

// Renderer는 이제 PanelEngine 또는 상위 GameEngine에서 관리되므로 여기서는 필요 없습니다.

export class MercenaryPanelManager {
    // 생성자에서 캔버스 ID 대신 캔버스 요소를 직접 받도록 변경합니다.
    constructor(mercenaryCanvasElement, measureManager, battleSimulationManager, logicManager) {
        console.log("\uD83D\uDC65 MercenaryPanelManager initialized. Ready to display mercenary details. \uD83D\uDC65");
        this.canvas = mercenaryCanvasElement; // ✨ 캔버스 요소를 직접 받습니다.
        this.ctx = this.canvas.getContext('2d'); // ✨ 컨텍스트를 직접 얻습니다.
        this.measureManager = measureManager;
        this.battleSimulationManager = battleSimulationManager; // 유닛 데이터를 가져오기 위함
        this.logicManager = logicManager; // ✨ LogicManager 추가

        // ✨ MeasureManager에서 그리드 행/열 정보를 가져옴
        this.gridRows = this.measureManager.get('mercenaryPanel.gridRows');
        this.gridCols = this.measureManager.get('mercenaryPanel.gridCols');
        this.numSlots = this.gridRows * this.gridCols;

        this.pixelRatio = window.devicePixelRatio || 1;

        // 초기 내부 해상도 설정 후 패널 치수 계산
        this.resizeCanvas();
        this.recalculatePanelDimensions();

        // ✨ window.resize 이벤트 리스너 제거 (CompatibilityManager가 크기 제어)
    }

    /**
     * 패널의 내부 치수(슬롯 크기 등)를 재계산합니다.
     * 이 메서드는 CompatibilityManager가 캔버스 크기를 조정한 후 호출해야 합니다.
     */
    recalculatePanelDimensions() {
        // ✨ 캔버스 요소의 현재 크기를 기반으로 내부 슬롯 크기 계산
        this.slotWidth = (this.canvas.width / this.pixelRatio) / this.gridCols;
        this.slotHeight = (this.canvas.height / this.pixelRatio) / this.gridRows;
        console.log(`[MercenaryPanelManager] Panel dimensions recalculated. Canvas size: ${this.canvas.width}x${this.canvas.height}, Slot size: ${this.slotWidth}x${this.slotHeight}`);
        this.resizeCanvas();
    }

    /**
     * 캔버스 내부 해상도를 CSS 크기와 pixelRatio에 맞춰 조정합니다.
     */
    resizeCanvas() {
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;

        if (this.canvas.width !== displayWidth * this.pixelRatio ||
            this.canvas.height !== displayHeight * this.pixelRatio) {
            this.canvas.width = displayWidth * this.pixelRatio;
            this.canvas.height = displayHeight * this.pixelRatio;
            this.ctx = this.canvas.getContext('2d');
            this.ctx.scale(this.pixelRatio, this.pixelRatio);
            console.log(`[MercenaryPanelManager] Canvas internal resolution set to: ${this.canvas.width}x${this.canvas.height} (Display: ${displayWidth}x${displayHeight}, Ratio: ${this.pixelRatio})`);
        }
    }

    /**
     * 용병 패널과 그리드를 그립니다.
     * 이 메서드는 PanelEngine에 의해 호출되며, 해당 패널 캔버스의 컨텍스트를 받습니다.
     * @param {CanvasRenderingContext2D} ctx - 패널 캔버스의 2D 렌더링 컨텍스트
     */
    draw(ctx) {
        ctx.clearRect(0, 0, this.canvas.width / this.pixelRatio, this.canvas.height / this.pixelRatio);
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(0, 0, this.canvas.width / this.pixelRatio, this.canvas.height / this.pixelRatio);

        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;

        for (let i = 0; i <= this.gridCols; i++) {
            ctx.beginPath();
            ctx.moveTo(i * this.slotWidth, 0);
            ctx.lineTo(i * this.slotWidth, this.canvas.height / this.pixelRatio);
            ctx.stroke();
        }
        for (let i = 0; i <= this.gridRows; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * this.slotHeight);
            ctx.lineTo(this.canvas.width / this.pixelRatio, i * this.slotHeight);
            ctx.stroke();
        }

        const units = this.battleSimulationManager ? this.battleSimulationManager.unitsOnGrid : [];
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < this.numSlots; i++) {
            const row = Math.floor(i / this.gridCols);
            const col = i % this.gridCols;
            const x = col * this.slotWidth + this.slotWidth / 2;
            const y = row * this.slotHeight + this.slotHeight / 2;

            if (units[i]) {
                const unit = units[i];
                ctx.fillText(`${unit.name}`, x, y - 10);
                ctx.fillText(`HP: ${unit.currentHp}/${unit.baseStats.hp}`, x, y + 10);
                if (unit.image) {
                    const imgSize = Math.min(this.slotWidth, this.slotHeight) * 0.7;
                    const imgX = col * this.slotWidth + (this.slotWidth - imgSize) / 2;
                    const imgY = row * this.slotHeight + (this.slotHeight - imgSize) / 2 - 25;
                    ctx.drawImage(unit.image, imgX, imgY, imgSize, imgSize);
                }
            } else {
                ctx.fillText(`Slot ${i + 1}`, x, y);
            }
        }
    }
}
