// js/managers/MeasureManager.js

export class MeasureManager {
    // ✨ resolutionEngine은 MeasureManager에서 직접 사용되지 않으므로 생성자에서 받지 않음
    constructor() {
        console.log("📏 측정 매니저 초기화됨. 모든 것을 측정할 준비 완료. 🎛️");

        // 게임의 모든 사이즈 관련 설정을 이곳에 정의 (모든 값은 '기준 해상도' 단위로 정의됩니다)
        this._measurements = {
            tileSize: 512, // 맵 타일의 기본 사이즈 (실제 렌더링 시 스케일링 필요)
            mapGrid: { rows: 10, cols: 15 }, // 맵 그리드의 행/열
            // gameResolution: { width: 1280, height: 720 } // 이제 ResolutionEngine의 baseWidth/Height가 이 역할을 대체합니다.
                                                        // 그러나 MeasureManager의 get/set 메서드가 이 경로를 참조할 수 있으므로
                                                        // 초기값만 제공하고 실제 최신 값은 ResolutionEngine에서 가져오도록 합니다.
            ui: {
                mapPanelWidthRatio: 0.7,
                mapPanelHeightRatio: 0.9,
                buttonHeight: 50, // 버튼 높이 (기준 해상도 단위)
                buttonWidth: 200, // 버튼 너비 (기준 해상도 단위)
                buttonMargin: 10  // 버튼 여백 (기준 해상도 단위)
            },
            battleStage: {
                widthRatio: 1.0,
                heightRatio: 1.0,
                padding: 40 // 배틀 스테이지 내부 여백 (기준 해상도 단위)
            },
            mercenaryPanel: {
                baseSlotSize: 100, // 각 슬롯의 기본 크기 (기준 해상도 단위, UI 계산용)
                gridRows: 2,
                gridCols: 6,
                heightRatio: 0.25 // 메인 캔버스 높이의 25% (CSS 픽셀 비율)
            },
            combatLog: {
                heightRatio: 0.15, // 메인 캔버스 높이의 15% (CSS 픽셀 비율)
                lineHeight: 20,    // 한 줄 높이 (기준 해상도 단위)
                padding: 10        // 내부 여백 (기준 해상도 단위)
            },
            gameConfig: {
                enableDisarmSystem: true
            }
        };
    }

    /**
     * 특정 측정값을 반환합니다.
     * 예: get('tileSize'), get('mapGrid.rows'), get('ui.mapPanelWidthRatio')
     * @param {string} keyPath - 접근할 측정값의 키 경로
     * @returns {*} 해당 측정값 또는 undefined
     */
    get(keyPath) {
        // ✨ 'gameResolution' 경로 요청 시 ResolutionEngine의 값을 반환하도록 처리
        if (keyPath === 'gameResolution.width') {
            // ResolutionEngine이 없을 경우에 대비한 방어 로직 (초기화 순서 등)
            return window.resolutionEngine ? window.resolutionEngine.baseWidth : this._measurements.gameResolution.width;
        }
        if (keyPath === 'gameResolution.height') {
            return window.resolutionEngine ? window.resolutionEngine.baseHeight : this._measurements.gameResolution.height;
        }

        const path = keyPath.split('.');
        let current = this._measurements;
        for (let i = 0; i < path.length; i++) {
            if (current[path[i]] === undefined) {
                console.warn(`[MeasureManager] Measurement key '${keyPath}' not found. Path segment: '${path[i]}'`);
                return undefined;
            }
            current = current[path[i]];
        }
        return current;
    }

    /**
     * 측정값을 설정합니다. 신중히 사용해야 합니다.
     * @param {string} keyPath - 설정할 측정값의 키 경로
     * @param {*} value - 설정할 값
     * @returns {boolean} 성공 여부
     */
    set(keyPath, value) {
        // ✨ 'gameResolution' 경로는 ResolutionEngine에서 관리하므로 여기서 설정하지 않음
        if (keyPath.startsWith('gameResolution')) {
            console.warn(`[MeasureManager] Attempted to set '${keyPath}'. Game resolution is managed by ResolutionEngine and should not be set directly here.`);
            return false;
        }

        const path = keyPath.split('.');
        let current = this._measurements;
        for (let i = 0; i < path.length - 1; i++) {
            if (current[path[i]] === undefined) {
                console.warn(`[MeasureManager] Cannot set measurement. Path '${keyPath}' does not exist.`);
                return false;
            }
            current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
        console.log(`[MeasureManager] Set '${keyPath}' to ${value}`);
        return true;
    }

    /**
     * 게임의 해상도(캔버스 크기)를 업데이트합니다.
     * ✨ 이 메서드는 이제 사용되지 않습니다. ResolutionEngine이 해상도를 직접 관리합니다.
     * @param {number} width - 새로운 너비
     * @param {number} height - 새로운 높이
     */
    updateGameResolution(width, height) {
        console.warn("[MeasureManager] updateGameResolution() is deprecated. Resolution is now managed by ResolutionEngine.");
        // this._measurements.gameResolution.width = width;
        // this._measurements.gameResolution.height = height;
        // console.log(`[MeasureManager] Game resolution updated to: ${width}x${height}`);
    }
}
