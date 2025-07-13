// js/managers/LayerEngine.js

export class LayerEngine {
    // ✨ resolutionEngine을 매개변수로 추가
    constructor(renderer, cameraEngine, resolutionEngine) {
        console.log("🎨 LayerEngine initialized. Ready to manage rendering layers. 🎨");
        this.renderer = renderer;
        this.cameraEngine = cameraEngine;
        this.resolutionEngine = resolutionEngine; // ✨ resolutionEngine 인스턴스 저장 (직접 사용은 안 하지만 일관성을 위해)
        this.layers = [];
    }

    registerLayer(name, drawFunction, zIndex) {
        const existingLayerIndex = this.layers.findIndex(layer => layer.name === name);
        if (existingLayerIndex !== -1) {
            console.warn(`[LayerEngine] Layer '${name}' already exists. Overwriting.`);
            this.layers[existingLayerIndex] = { name, drawFunction, zIndex };
        } else {
            this.layers.push({ name, drawFunction, zIndex });
        }
        this.layers.sort((a, b) => a.zIndex - b.zIndex);
        console.log(`[LayerEngine] Registered layer: ${name} with zIndex: ${zIndex}`);
    }

    /**
     * 모든 레이어를 순서대로 그립니다.
     * @param {CanvasRenderingContext2D} ctx - 그리기 대상이 되는 캔버스 컨텍스트 (메인 컨텍스트를 GameEngine에서 전달받음)
     */
    draw(ctx) {
        // ✨ Renderer.clear()와 Renderer.drawBackground()는 이제 ctx를 받지 않고,
        // ✨ Renderer 내부적으로 자신의 this.ctx (resolutionEngine.mainContext)에 그립니다.
        this.renderer.clear();
        this.renderer.drawBackground();

        for (const layer of this.layers) {
            ctx.save(); // 각 레이어의 변환이 다른 레이어에 영향을 주지 않도록 상태 저장

            if (layer.name === 'sceneLayer' && this.cameraEngine) {
                // CameraEngine은 이미 스케일링된 컨텍스트에 추가적인 변환을 적용합니다.
                this.cameraEngine.applyTransform(ctx);
            }

            // 레이어의 그리기 함수 호출 시 현재 컨텍스트를 전달합니다.
            // 이 컨텍스트는 ResolutionEngine과 CameraEngine에 의해 이미 변환된 상태입니다.
            layer.drawFunction(ctx);
            ctx.restore(); // 레이어 작업 후 저장된 상태 복원
        }
    }
}
