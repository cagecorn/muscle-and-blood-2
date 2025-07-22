import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 체력바, 데미지 텍스트 등 전투 시각 효과(VFX)를 생성하고 관리하는 엔진
 */
export class VFXManager {
    constructor(scene) {
        this.scene = scene;
        // 시각 효과들을 담을 레이어를 생성하여 깊이(depth)를 관리합니다.
        this.vfxLayer = this.scene.add.layer();
        this.vfxLayer.setDepth(100); // 다른 요소들 위에 그려지도록 설정
        debugLogEngine.log('VFXManager', 'VFX 매니저가 초기화되었습니다.');
    }

    /**
     * 유닛의 머리 위에 체력바를 생성합니다.
     * @param {Phaser.GameObjects.Sprite} parentSprite - 체력바가 따라다닐 유닛 스프라이트
     * @returns {{background: Phaser.GameObjects.Rectangle, foreground: Phaser.GameObjects.Rectangle}} - 생성된 체력바 객체
     */
    createHealthBar(parentSprite) {
        const barWidth = parentSprite.displayWidth * 0.8;
        const barHeight = 8;
        const offsetX = 0;
        const offsetY = -(parentSprite.displayHeight / 2) - barHeight;

        // 체력바 배경
        const bg = this.scene.add.rectangle(
            parentSprite.x + offsetX,
            parentSprite.y + offsetY,
            barWidth,
            barHeight,
            0x000000
        ).setOrigin(0.5);

        // 실제 체력을 나타내는 전경
        const fg = this.scene.add.rectangle(
            bg.x - barWidth / 2,
            bg.y,
            barWidth,
            barHeight,
            0x00ff00
        ).setOrigin(0, 0.5);

        this.vfxLayer.add([bg, fg]);
        debugLogEngine.log('VFXManager', '체력바를 생성했습니다.');

        return { background: bg, foreground: fg };
    }

    /**
     * 지정된 위치에 핏방울 파티클 효과를 생성합니다.
     * @param {number} x - 파티클이 생성될 x 좌표
     * @param {number} y - 파티클이 생성될 y 좌표
     */
    createBloodSplatter(x, y) {
        const textureKey = 'blood-particle';
        if (!this.scene.textures.exists(textureKey)) {
            const g = this.scene.add.graphics();
            g.fillStyle(0xff0000, 1);
            g.fillCircle(2, 2, 2); // 4x4 크기의 원형 파티클
            g.generateTexture(textureKey, 4, 4);
            g.destroy();
        }

        const emitter = this.scene.add.particles(x, y, textureKey, {
            speed: { min: 50, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 1, end: 0 },
            lifespan: { min: 300, max: 600 },
            quantity: { min: 10, max: 20 },
            blendMode: 'ADD'
        });

        // 파티클이 모두 사라지면 이미터 자동 파괴
        this.scene.time.delayedCall(600, () => {
            emitter.destroy();
        });

        debugLogEngine.log('VFXManager', '핏방울 파티클 효과를 생성했습니다.');
    }

    /**
     * 유닛의 체력바를 갱신합니다.
     * @param {object} healthBar - 갱신할 체력바 객체 { background, foreground }
     * @param {number} currentHp - 현재 체력
     * @param {number} maxHp - 최대 체력
     */
    updateHealthBar(healthBar, currentHp, maxHp) {
        const percentage = Math.max(0, currentHp / maxHp);
        this.scene.tweens.add({
            targets: healthBar.foreground,
            width: healthBar.background.width * percentage,
            duration: 200,
            ease: 'Linear'
        });
    }

    /**
     * 매니저와 관련된 모든 리소스를 정리합니다.
     */
    shutdown() {
        this.vfxLayer.destroy();
        debugLogEngine.log('VFXManager', 'VFX 매니저를 종료합니다.');
    }
}
