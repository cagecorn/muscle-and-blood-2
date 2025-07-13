// js/managers/PanelEngine.js

export class PanelEngine {
    // ✨ resolutionEngine을 매개변수로 추가
    constructor(resolutionEngine) {
        console.log("🔳 PanelEngine initialized. Ready to manage various game panels. 🔳");
        this.panels = new Map();
        this.resolutionEngine = resolutionEngine; // ✨ resolutionEngine 인스턴스 저장
    }

    /**
     * 패널을 등록합니다.
     * @param {string} name - 패널의 고유 이름 (예: 'mercenaryPanel')
     * @param {object} panelInstance - 그리기 메서드(draw)를 가진 패널 매니저 인스턴스
     */
    registerPanel(name, panelInstance) {
        if (!panelInstance || typeof panelInstance.draw !== 'function') {
            console.error(`[PanelEngine] Cannot register panel '${name}'. It must have a 'draw' method.`);
            return;
        }
        this.panels.set(name, panelInstance);
        console.log(`[PanelEngine] Panel '${name}' registered.`);
    }

    /**
     * 특정 패널을 그립니다. LayerEngine에 의해 호출됩니다.
     * PanelEngine은 패널 자체 캔버스에 그리는 책임을 패널 인스턴스에 위임합니다.
     * @param {string} panelName - 그리는 패널의 이름
     * @param {CanvasRenderingContext2D} [ctx] - (선택 사항) 패널 캔버스의 2D 렌더링 컨텍스트.
     * 이제 대부분의 패널은 자체 컨텍스트에 그리므로 이 인자는 사용되지 않을 수 있습니다.
     */
    drawPanel(panelName, ctx = null) { // ctx는 이제 사용되지 않을 가능성이 높지만, 하위 호환성을 위해 유지
        const panel = this.panels.get(panelName);
        if (panel) {
            // panel.draw() 메서드가 인자를 받지 않거나, 필요에 따라 resolutionEngine을 직접 활용하도록 가정합니다.
            // MercenaryPanelManager와 BattleLogManager는 이미 자체 컨텍스트에 그리도록 수정되었습니다.
            panel.draw();
        } else {
            console.warn(`[PanelEngine] Panel '${panelName}' not found.`);
        }
    }
}
