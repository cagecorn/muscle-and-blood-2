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

        // 사용할 타일셋 이미지 불러오기
        const tileset = this.map.addTilesetImage(
            'mab-tiles',
            'mab-tile-1',
            this.TILE_WIDTH,
            this.TILE_HEIGHT,
            0,
            0
        );

        // 추가 타일 이미지를 타일셋에 등록
        for (let i = 2; i <= 15; i++) {
            tileset.addImage(this.scene.textures.get(`mab-tile-${i}`));
        }

        // 레이어 생성
        this.layer = this.map.createBlankLayer('layer1', tileset, 0, 0);

        // 맵 전체를 랜덤 타일로 채움
        this.layer.randomize(0, 0, this.map.width, this.map.height, Array.from(Array(15).keys()));

        // 카메라 경계 설정
        this.scene.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    }
}

