import { debugLogEngine } from './DebugLogEngine.js';
// TokenEngine을 import하여 토큰 정보를 가져옵니다.
import { tokenEngine } from './TokenEngine.js';

/**
 * 체력바, 데미지 텍스트 등 전투 시각 효과(VFX)를 생성하고 관리하는 엔진
 */
export class VFXManager {
    constructor(scene) {
        this.scene = scene;
        // 시각 효과들을 담을 레이어를 생성하여 깊이(depth)를 관리합니다.
        this.vfxLayer = this.scene.add.layer();
        this.vfxLayer.setDepth(100); // 다른 요소들 위에 그려지도록 설정
        // --- ✨ 토큰 UI를 관리할 객체 ---
        this.tokenDisplays = new Map();
        debugLogEngine.log('VFXManager', 'VFX 매니저가 초기화되었습니다.');
    }

    /**
     * 유닛의 이름표 위에 토큰 UI를 생성합니다.
     * @param {Phaser.GameObjects.Sprite} parentSprite - 토큰 UI가 따라다닐 유닛 스프라이트
     * @param {Phaser.GameObjects.Text} nameLabel - 위치의 기준이 될 이름표
     * @returns {Phaser.GameObjects.Container} 생성된 토큰 컨테이너 (바인딩용)
     */
    createTokenDisplay(parentSprite, nameLabel) {
        const unitId = parentSprite.getData('unitId');
        if (!unitId) return null;

        const container = this.scene.add.container(nameLabel.x, nameLabel.y - 12);
        this.vfxLayer.add(container);

        const tokenImages = [];
        const tokenSpacing = 8;
        const tokenScale = 0.05;

        for (let i = 0; i < tokenEngine.maxTokens; i++) {
            const tokenImage = this.scene.add.image(i * tokenSpacing, 0, 'token').setScale(tokenScale).setVisible(false);
            container.add(tokenImage);
            tokenImages.push(tokenImage);
        }

        const totalWidth = (tokenEngine.maxTokens - 1) * tokenSpacing;
        container.setX(nameLabel.x - totalWidth / 2);

        this.tokenDisplays.set(unitId, { container, tokenImages });

        return container;
    }

    /**
     * 특정 유닛의 토큰 UI를 최신 상태로 업데이트합니다.
     * @param {number} unitId - 업데이트할 유닛의 고유 ID
     */
    updateTokenDisplay(unitId) {
        const display = this.tokenDisplays.get(unitId);
        if (!display) return;

        const currentTokens = tokenEngine.getTokens(unitId);
        display.tokenImages.forEach((token, index) => {
            token.setVisible(index < currentTokens);
        });
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
            speed: { min: 150, max: 300 },
            angle: { min: -90, max: 90 },
            gravityY: 500,
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: { min: 600, max: 1000 },
            quantity: { min: 3, max: 6 },
            blendMode: 'ADD'
        });

        // 파티클이 모두 사라지면 이미터 자동 파괴
        this.scene.time.delayedCall(1000, () => {
            emitter.destroy();
        });

        debugLogEngine.log('VFXManager', '핏방울 파티클 효과를 생성했습니다.');
    }

    /**
     * 물리 효과가 적용된 데미지 숫자를 생성합니다.
     * @param {number} x - 생성 위치 x
     * @param {number} y - 생성 위치 y
     * @param {number|string} damage - 표시할 데미지 숫자
     */
    createDamageNumber(x, y, damage) {
        const style = {
            fontFamily: '"Arial Black", Arial, sans-serif',
            fontSize: '32px',
            color: '#ff4d4d',
            stroke: '#000000',
            strokeThickness: 4,
        };

        const damageText = this.scene.add
            .text(x, y, damage.toString(), style)
            .setOrigin(0.5, 0.5);
        this.scene.physics.add.existing(damageText);

        const randomX = Math.random() * 200 - 100; // -100 ~ 100
        const randomY = -(Math.random() * 150 + 150); // -150 ~ -300
        damageText.body.setVelocity(randomX, randomY);
        damageText.body.setGravityY(400);
        damageText.body.setAngularVelocity(Math.random() * 200 - 100);

        this.scene.tweens.add({
            targets: damageText,
            alpha: 0,
            duration: 800,
            ease: 'Cubic.easeIn',
            onComplete: () => {
                damageText.destroy();
            },
        });

        debugLogEngine.log('VFXManager', `${damage} 데미지 숫자를 생성했습니다.`);
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
        // --- ✨ 토큰 UI 데이터 초기화 ---
        this.tokenDisplays.clear();
        debugLogEngine.log('VFXManager', 'VFX 매니저를 종료합니다.');
    }
}
