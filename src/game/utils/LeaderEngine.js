import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';

/**
 * 월드 맵에서 플레이어 리더를 제어하는 엔진.
 * WorldMapEngine이 타일맵을 사용하지 않으므로 좌표 계산도 직접 수행합니다.
 */
export class LeaderEngine {
    /**
     * @param {Phaser.Scene} scene 리더가 생성될 씬
     * @param {WorldMapEngine} mapEngine 리더가 상호작용할 맵 엔진
     */
    constructor(scene, mapEngine) {
        this.scene = scene;
        this.mapEngine = mapEngine;
        this.sprite = null;

        // 맵의 중앙에서 시작합니다.
        this.tileX = Math.floor(mapEngine.MAP_WIDTH_IN_TILES / 2);
        this.tileY = Math.floor(mapEngine.MAP_HEIGHT_IN_TILES / 2);
    }

    /**
     * 리더 스프라이트를 생성하고 초기 위치를 설정합니다.
     */
    create() {
        // 타일 좌표를 월드 좌표로 직접 계산합니다.
        const startX = this.tileX * this.mapEngine.TILE_WIDTH + this.mapEngine.TILE_WIDTH / 2;
        const startY = this.tileY * this.mapEngine.TILE_HEIGHT + this.mapEngine.TILE_HEIGHT / 2;

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
            default:
                break;
        }

        if (targetX >= 0 && targetX < this.mapEngine.MAP_WIDTH_IN_TILES &&
            targetY >= 0 && targetY < this.mapEngine.MAP_HEIGHT_IN_TILES) {
            this.tileX = targetX;
            this.tileY = targetY;

            // 이동할 월드 좌표를 계산합니다.
            const worldX = this.tileX * this.mapEngine.TILE_WIDTH + this.mapEngine.TILE_WIDTH / 2;
            const worldY = this.tileY * this.mapEngine.TILE_HEIGHT + this.mapEngine.TILE_HEIGHT / 2;

            this.scene.tweens.add({
                targets: this.sprite,
                x: worldX,
                y: worldY,
                ease: 'Sine.easeInOut',
                duration: 200,
            });
        }
    }
}

