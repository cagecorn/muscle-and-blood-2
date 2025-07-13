// js/managers/MapManager.js

export class MapManager {
    // ✨ resolutionEngine을 매개변수로 추가
    constructor(measureManager, resolutionEngine) {
        console.log("🗺️ MapManager initialized. Ready to build worlds. 🗺️");
        this.measureManager = measureManager;
        this.resolutionEngine = resolutionEngine; // ✨ resolutionEngine 인스턴스 저장

        // 측정값을 기반으로 초기 맵 크기를 계산
        this.recalculateMapDimensions();

        this.mapData = this._generateRandomMap();
        this.pathfindingEngine = this._createPathfindingEngine();

        console.log(`[MapManager] Map grid: ${this.gridCols}x${this.gridRows}, Tile size (base): ${this.tileSize}`);
    }

    /**
     * 맵의 그리드 및 타일 크기를 MeasureManager로부터 다시 계산합니다.
     * 이 메서드는 measureManager의 값이 변경된 경우 (예: 게임 시작 시, 해상도 변경 시) 호출됩니다.
     * 여기서 계산되는 모든 치수는 '기준 해상도' 단위입니다.
     */
    recalculateMapDimensions() {
        console.log("[MapManager] Recalculating map dimensions based on MeasureManager (base units)...");
        this.gridRows = this.measureManager.get('mapGrid.rows');
        this.gridCols = this.measureManager.get('mapGrid.cols');
        this.tileSize = this.measureManager.get('tileSize'); // 이 tileSize는 이제 기준 해상도 단위입니다.
    }

    _createPathfindingEngine() {
        console.log("[MapManager] Small Engine: Pathfinding Engine created.");
        return {
            findPath: (startX, startY, endX, endY) => {
                if (startX === endX || startY === endY) {
                    console.log(`[PathfindingEngine] Found a simple path from (${startX},${startY}) to (${endX},${endY}).`);
                    return true;
                } else {
                    console.warn(`[PathfindingEngine] No simple path found from (${startX},${startY}) to (${endX},${endY}).`);
                    return false;
                }
            },
            isValidTile: (x, y) => {
                return x >= 0 && x < this.gridCols && y >= 0 && y < this.gridRows && this.mapData[y][x] !== 'obstacle';
            }
        };
    }

    _generateRandomMap() {
        const map = [];
        for (let y = 0; y < this.gridRows; y++) {
            const row = [];
            for (let x = 0; x < this.gridCols; x++) {
                row.push(Math.random() < 0.1 ? 'obstacle' : 'grass');
            }
            map.push(row);
        }
        console.log("[MapManager] Random map generated.");
        return map;
    }

    getTileType(x, y) {
        if (this.pathfindingEngine.isValidTile(x, y)) {
            return this.mapData[y][x];
        }
        return null;
    }

    getMapRenderData() {
        return {
            mapData: this.mapData,
            gridCols: this.gridCols,
            gridRows: this.gridRows,
            // ✨ tileSize는 이제 getScaledTileSize()를 통해 스케일링된 값을 제공할 수 있습니다.
            // 하지만 이 메서드는 렌더링 데이터 자체를 제공하므로,
            // 여기서 tileSize는 여전히 기준 해상도 값으로 유지하고, 그릴 때 스케일링하는 것이 더 유연합니다.
            tileSize: this.tileSize 
        };
    }

    getGridDimensions() {
        return {
            rows: this.gridRows,
            cols: this.gridCols
        };
    }

    getTileSize() {
        // ✨ 이 tileSize는 기준 해상도 단위의 타일 크기를 반환합니다.
        // 렌더링 시에는 resolutionEngine.getScaledCoordinate(this.tileSize)를 사용해야 합니다.
        return this.tileSize;
    }
}
