import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';

export class WorldMapEngine {
    /**
     * @param {Phaser.Scene} scene 월드맵이 생성될 씬
     */
    constructor(scene) {
        this.scene = scene;
        this.map = null;
        this.layer = null;

        // 월드맵의 크기와 타일 크기를 정의합니다.
        this.MAP_WIDTH_IN_TILES = 50;
        this.MAP_HEIGHT_IN_TILES = 50;
        this.TILE_WIDTH = 512;
        this.TILE_HEIGHT = 512;
    }

    /**
     * 월드맵을 생성하고 랜덤 타일로 채웁니다.
     */
    create() {
        this.map = this.scene.make.tilemap({
            tileWidth: this.TILE_WIDTH,
            tileHeight: this.TILE_HEIGHT,
            width: this.MAP_WIDTH_IN_TILES,
            height: this.MAP_HEIGHT_IN_TILES
        });

        // --- ▼ [핵심 수정] 타일셋 추가 및 타일 배치 로직 변경 ▼ ---

        // 1. 사용할 모든 타일 이미지 키를 기반으로 타일셋들을 생성합니다.
        const tilesets = [];
        for (let i = 1; i <= 15; i++) {
            const key = `mab-tile-${i}`;
            // 각 이미지를 별도의 타일셋으로 추가합니다.
            tilesets.push(this.map.addTilesetImage(key, key, this.TILE_WIDTH, this.TILE_HEIGHT, 0, 0));
        }

        // 2. 'layer1'이라는 이름으로 빈 레이어를 생성합니다.
        this.layer = this.map.createBlankLayer('layer1', tilesets, 0, 0);

        // 3. randomize 대신 putTileAt을 사용하여 각 칸에 직접 타일을 채웁니다.
        //    이것이 여러 개의 개별 타일셋을 사용할 때 더 안정적인 방법입니다.
        for (let y = 0; y < this.map.height; y++) {
            for (let x = 0; x < this.map.width; x++) {
                // 1번부터 15번까지의 타일 인덱스 중 하나를 무작위로 선택합니다.
                const randomTileIndex = Phaser.Math.Between(1, 15);
                this.map.putTileAt(randomTileIndex, x, y, true, this.layer);
            }
        }

        // --- ▲ [핵심 수정] 완료 ▲ ---

        this.scene.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    }
}

