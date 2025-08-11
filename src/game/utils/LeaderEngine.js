import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';

export class LeaderEngine {
    /**
     * @param {Phaser.Scene} scene 리더가 생성될 씬
     * @param {WorldMapEngine} mapEngine 리더가 상호작용할 맵 엔진
     */
    constructor(scene, mapEngine) {
        this.scene = scene;
        this.mapEngine = mapEngine;
        this.sprite = null;

        // 리더의 현재 타일 좌표
        this.tileX = 25;
        this.tileY = 25;
    }

    /**
     * 리더 스프라이트를 생성하고 초기 위치를 설정합니다.
     */
    create() {
        const startX = this.mapEngine.map.tileToWorldX(this.tileX);
        const startY = this.mapEngine.map.tileToWorldY(this.tileY);

        this.sprite = this.scene.physics.add.sprite(startX, startY, 'leader-infp');
        this.sprite.setDisplaySize(512, 512);

        this.scene.cameras.main.startFollow(this.sprite, true, 0.08, 0.08);
        this.scene.cameras.main.setZoom(0.3);
    }

    /**
     * 지정된 방향으로 한 칸 이동합니다.
     * @param {'up' | 'down' | 'left' | 'right'} direction
     */
    move(direction) {
        let targetX = this.tileX;
        let targetY = this.tileY;

        switch (direction) {
            case 'up':
                targetY -= 1;
                break;
            case 'down':
                targetY += 1;
                break;
            case 'left':
                targetX -= 1;
                break;
            case 'right':
                targetX += 1;
                break;
        }

        if (targetX >= 0 && targetX < this.mapEngine.MAP_WIDTH_IN_TILES &&
            targetY >= 0 && targetY < this.mapEngine.MAP_HEIGHT_IN_TILES) {
            this.tileX = targetX;
            this.tileY = targetY;

            const worldX = this.mapEngine.map.tileToWorldX(this.tileX);
            const worldY = this.mapEngine.map.tileToWorldY(this.tileY);

            this.scene.tweens.add({
                targets: this.sprite,
                x: worldX,
                y: worldY,
                ease: 'Sine.easeInOut',
                duration: 200
            });
        }
    }
}

