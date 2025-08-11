import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';

/**
 * 월드맵 타일을 배치하는 간단한 엔진
 */
export class WorldMapEngine {
    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        this.scene = scene;
        this.tileWidth = 0;
        this.tileHeight = 0;
    }

    create() {
        // 첫 번째 타일의 크기를 기반으로 타일 크기를 결정합니다.
        const texture = this.scene.textures.get('mab-tile-1');
        if (texture) {
            const image = texture.getSourceImage();
            this.tileWidth = image.width;
            this.tileHeight = image.height;
        } else {
            this.tileWidth = 256;
            this.tileHeight = 256;
        }

        let index = 1;
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 5; x++) {
                const key = `mab-tile-${index}`;
                if (this.scene.textures.exists(key)) {
                    this.scene.add.image(x * this.tileWidth, y * this.tileHeight, key).setOrigin(0);
                }
                index++;
            }
        }
    }
}
