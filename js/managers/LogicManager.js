// js/managers/LogicManager.js

export class LogicManager {
    // ✨ resolutionEngine을 매개변수로 추가 (GameEngine에서 이미 전달하도록 수정되었음)
    constructor(measureManager, sceneManager, resolutionEngine) {
        console.log("🧠 Logic Manager initialized. Ready to enforce sanity. 🧠");
        this.measureManager = measureManager;
        this.sceneManager = sceneManager;
        this.resolutionEngine = resolutionEngine; // ✨ resolutionEngine 인스턴스 저장
    }

    /**
     * 현재 활성화된 씬의 실제 콘텐츠 크기를 반환합니다.
     * 이 크기는 카메라가 화면의 빈틈 없이 보여줄 수 있는 최대 영역을 정의합니다.
     * 모든 반환 값은 게임의 기준 해상도 단위입니다.
     * @returns {{width: number, height: number}} 현재 씬 콘텐츠의 너비 및 높이 (기준 해상도 단위)
     */
    getCurrentSceneContentDimensions() {
        // ✨ 캔버스 크기를 resolutionEngine의 '기준 해상도'에서 가져옵니다.
        const baseCanvasWidth = this.resolutionEngine.baseWidth;
        const baseCanvasHeight = this.resolutionEngine.baseHeight;
        const currentSceneName = this.sceneManager.getCurrentSceneName();

        let contentWidth, contentHeight;
        if (currentSceneName === 'territoryScene') {
            // 영지 씬은 캔버스와 동일한 크기를 사용 (기준 해상도 단위)
            contentWidth = baseCanvasWidth;
            contentHeight = baseCanvasHeight;
        } else if (currentSceneName === 'battleScene') {
            // 전투 씬의 경우 실제 그리드 크기를 계산 (기준 해상도 단위)
            const gridCols = 15;
            const gridRows = 10;
            // stagePadding도 기준 해상도 단위라고 가정합니다.
            const stagePadding = this.measureManager.get('battleStage.padding');

            const gridDrawableWidth = baseCanvasWidth - 2 * stagePadding;
            const gridDrawableHeight = baseCanvasHeight - 2 * stagePadding;

            const effectiveTileSize = Math.min(
                gridDrawableWidth / gridCols,
                gridDrawableHeight / gridRows
            );

            contentWidth = gridCols * effectiveTileSize;
            contentHeight = gridRows * effectiveTileSize;
        } else {
            console.warn(`[LogicManager] Unknown scene name '${currentSceneName}'. Returning main game canvas dimensions as content dimensions.`);
            contentWidth = baseCanvasWidth;
            contentHeight = baseCanvasHeight;
        }
        console.log(`[LogicManager Debug] Scene: ${currentSceneName}, Content Dimensions: ${contentWidth}x${contentHeight} (Base Units)`);
        return { width: contentWidth, height: contentHeight };
    }

    /**
     * 카메라의 최대/최소 줌 레벨을 반환합니다.
     * 최소 줌 레벨은 콘텐츠 전체가 화면에 빈틈 없이 보이도록 합니다.
     * @returns {{minZoom: number, maxZoom: number}} 줌 범위
     */
    getZoomLimits() {
        // ✨ 캔버스 크기를 resolutionEngine의 '기준 해상도'에서 가져옵니다.
        const baseCanvasWidth = this.resolutionEngine.baseWidth;
        const baseCanvasHeight = this.resolutionEngine.baseHeight;
        const contentDimensions = this.getCurrentSceneContentDimensions(); // 이 값은 이미 기준 해상도 단위입니다.

        // 콘텐츠를 캔버스 너비에 맞추기 위한 줌 비율
        const minZoomX = baseCanvasWidth / contentDimensions.width;
        // 콘텐츠를 캔버스 높이에 맞추기 위한 줌 비율
        const minZoomY = baseCanvasHeight / contentDimensions.height;

        // 콘텐츠 전체가 화면에 '모두 보이도록' 하려면, 두 비율 중 더 작은 값을 선택합니다.
        const minZoom = Math.min(minZoomX, minZoomY); // Math.max를 Math.min으로 변경했습니다.

        const maxZoom = 10.0; // 최대 줌 값 (필요에 따라 MeasureManager에서 가져올 수 있음)

        console.log(`[LogicManager Debug] Canvas (Base): ${baseCanvasWidth}x${baseCanvasHeight}, Content (Base): ${contentDimensions.width}x${contentDimensions.height}, minZoomX: ${minZoomX.toFixed(2)}, minZoomY: ${minZoomY.toFixed(2)}, Final minZoom: ${minZoom.toFixed(2)}`);
        return { minZoom: minZoom, maxZoom: maxZoom };
    }

    /**
     * 주어진 카메라 위치(x, y)를 논리적 제약 조건에 맞게 조정합니다.
     * 이 함수는 화면에 빈틈이 보이지 않도록 카메라 이동을 제한합니다.
     * 모든 입력 및 반환 값은 게임의 기준 해상도 단위입니다.
     * @param {number} currentX - 현재 카메라 x 위치 (기준 해상도 단위)
     * @param {number} currentY - 현재 카메라 y 위치 (기준 해상도 단위)
     * @param {number} currentZoom - 현재 카메라 줌 레벨
     * @returns {{x: number, y: number}} 조정된 카메라 위치 (기준 해상도 단위)
     */
    applyPanConstraints(currentX, currentY, currentZoom) {
        // ✨ 캔버스 크기를 resolutionEngine의 '기준 해상도'에서 가져옵니다.
        const baseCanvasWidth = this.resolutionEngine.baseWidth;
        const baseCanvasHeight = this.resolutionEngine.baseHeight;
        const contentDimensions = this.getCurrentSceneContentDimensions(); // 이 값은 이미 기준 해상도 단위입니다.

        const effectiveContentWidth = contentDimensions.width * currentZoom;
        const effectiveContentHeight = contentDimensions.height * currentZoom;

        let clampedX = currentX;
        let clampedY = currentY;

        // X축 제약
        if (effectiveContentWidth < baseCanvasWidth) {
            // 콘텐츠가 캔버스보다 작으면 중앙 정렬
            clampedX = (baseCanvasWidth - effectiveContentWidth) / 2;
        } else {
            // 콘텐츠가 캔버스보다 크면 이동 범위 제한
            clampedX = Math.min(0, Math.max(currentX, baseCanvasWidth - effectiveContentWidth));
        }

        // Y축 제약
        if (effectiveContentHeight < baseCanvasHeight) {
            // 콘텐츠가 캔버스보다 작으면 중앙 정렬
            clampedY = (baseCanvasHeight - effectiveContentHeight) / 2;
        } else {
            // 콘텐츠가 캔버스보다 크면 이동 범위 제한
            clampedY = Math.min(0, Math.max(currentY, baseCanvasHeight - effectiveContentHeight));
        }

        return { x: clampedX, y: clampedY };
    }

    /**
     * 게임이 시작하기 위해 필요한 최소 해상도 요구 사항을 반환합니다.
     * @returns {{minWidth: number, minHeight: number}} 최소 너비와 높이 (기준 해상도 단위)
     */
    getMinGameResolution() {
        // 이 값은 GuardianManager.js의 규칙과 동기화되어야 합니다.
        return { minWidth: 800, minHeight: 600 };
    }
}
