import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';

export class WorldMapEngine {
    /**
     * @param {Phaser.Scene} scene 월드맵이 생성될 씬
     */
    constructor(scene) {
        this.scene = scene;
        this.map = null;
        this.layer = null;

        // 월드맵의 크기와 타일 크기 정의
        this.MAP_WIDTH_IN_TILES = 50;
        this.MAP_HEIGHT_IN_TILES = 50;
        this.TILE_WIDTH = 512;
        this.TILE_HEIGHT = 512;
    }

    /**
     * 월드맵을 생성하고 랜덤 타일로 채웁니다.
     */
    create() {
        // 비어있는 타일맵 객체 생성
        this.map = this.scene.make.tilemap({
            tileWidth: this.TILE_WIDTH,
            tileHeight: this.TILE_HEIGHT,
            width: this.MAP_WIDTH_IN_TILES,
            height: this.MAP_HEIGHT_IN_TILES
        });

        // 사용할 모든 타일 이미지 키를 배열로 구성
        const tileImageKeys = [];
        for (let i = 1; i <= 15; i++) {
            tileImageKeys.push(`mab-tile-${i}`);
        }

        // 각 이미지를 별도의 타일셋으로 맵에 추가
        const tilesets = tileImageKeys.map(key => {
            return this.map.addTilesetImage(
                key,
                key,
                this.TILE_WIDTH,
                this.TILE_HEIGHT,
                0,
                0
            );
        });

        // 배열로 전달된 모든 타일셋을 사용해 레이어 생성
        this.layer = this.map.createBlankLayer('layer1', tilesets, 0, 0);

        // 맵 전체를 1부터 시작하는 인덱스로 랜덤 타일 배치
        this.layer.randomize(
            0,
            0,
            this.map.width,
            this.map.height,
            Array.from({ length: 15 }, (_, i) => i + 1)
        );

        // 카메라 경계 설정
        this.scene.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    }
}

