// js/Renderer.js
export class Renderer {
    // ResolutionEngine 인스턴스를 받아 캔버스 ID 대신 컨텍스트를 직접 참조합니다.
    constructor(resolutionEngine) {
        if (!resolutionEngine || !resolutionEngine.mainCanvas || !resolutionEngine.mainContext) {
            console.error("Renderer: Invalid ResolutionEngine instance provided.");
            throw new Error("Renderer requires a valid ResolutionEngine instance.");
        }
        this.resolutionEngine = resolutionEngine;
        this.canvas = resolutionEngine.mainCanvas; // ResolutionEngine이 관리하는 메인 캔버스
        this.ctx = resolutionEngine.mainContext;   // ResolutionEngine이 스케일링한 컨텍스트

        // Renderer는 이제 자체적으로 픽셀 비율 스케일을 적용하지 않습니다.
        // 모든 스케일링은 ResolutionEngine에 의해 관리됩니다.

        console.log("Renderer initialized with ResolutionEngine.");
    }

    /**
     * 캔버스를 지웁니다. 매 프레임마다 새로운 내용을 그리기 전에 호출됩니다.
     */
    clear() {
        // ResolutionEngine에 의해 설정된 캔버스 너비/높이를 사용합니다.
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * 배경을 그립니다.
     */
    drawBackground() {
        this.ctx.fillStyle = '#333'; // 배경 색상 (조절 가능)
        // ResolutionEngine에 의해 설정된 캔버스 너비/높이를 사용합니다.
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 향후 유닛, 스프라이트 등을 그리는 메서드들이 추가될 예정입니다.
    // 예를 들어, drawImage(image, x, y, width, height) 등.
    // 이러한 메서드들은 ResolutionEngine의 getScaledCoordinate()를 사용하여 좌표를 계산해야 합니다.
    // 예: drawImage(img, this.resolutionEngine.getScaledCoordinate(x), this.resolutionEngine.getScaledCoordinate(y), ...)
}
