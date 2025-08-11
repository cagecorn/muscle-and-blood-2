import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';

/**
 * 월드맵에서 플레이어 리더를 제어하는 엔진
 */
export class LeaderEngine {
    constructor(scene, mapEngine) {
        this.scene = scene;
        this.mapEngine = mapEngine;
        this.sprite = null;
        this.position = { x: 0, y: 0 };
    }

    create() {
        const { tileWidth, tileHeight } = this.mapEngine;
        this.sprite = this.scene.add.sprite(tileWidth / 2, tileHeight / 2, 'leader-infp');
        this.sprite.setDepth(100);
    }

    move(dx, dy) {
        this.position.x += dx;
        this.position.y += dy;
        const { tileWidth, tileHeight } = this.mapEngine;
        const x = this.position.x * tileWidth + tileWidth / 2;
        const y = this.position.y * tileHeight + tileHeight / 2;
        this.sprite.setPosition(x, y);
    }
}
