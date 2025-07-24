import { debugLogEngine } from './DebugLogEngine.js';
import { IconManager } from './IconManager.js';
import { tokenEngine } from './TokenEngine.js';

/**
 * 체력바, 데미지 텍스트 등 전투 시각 효과(VFX)를 생성하고 관리하는 엔진
 */
export class VFXManager {
    constructor(scene, textEngine, bindingManager) {
        this.scene = scene;
        this.textEngine = textEngine;
        this.bindingManager = bindingManager;

        this.tokenDisplays = new Map();

        // 시각 효과들을 담을 레이어를 생성하여 깊이(depth)를 관리합니다.
        this.vfxLayer = this.scene.add.layer();
        this.vfxLayer.setDepth(100); // 다른 요소들 위에 그려지도록 설정

        // 상태 효과 아이콘 매니저 초기화
        this.iconManager = new IconManager(scene, this.vfxLayer);

        debugLogEngine.log('VFXManager', 'VFX 매니저가 초기화되었습니다.');
    }
    /**
     * 유닛의 UI 요소 생성은 CombatUIManager에서 처리합니다.
     * 현재 이 메서드는 플로팅 텍스트 등을 필요 시 직접 생성하도록 비워둡니다.
     */
    setupUnitVFX(unit) {
        if (!unit || !unit.sprite) return;

        const barWidth = 40;
        const barHeight = 6;
        const offsetY = -unit.sprite.displayHeight / 2 - 10;

        const background = this.scene.add.rectangle(unit.sprite.x, unit.sprite.y + offsetY, barWidth, barHeight, 0x000000, 0.7).setOrigin(0.5);
        const fill = this.scene.add.rectangle(unit.sprite.x - barWidth / 2, unit.sprite.y + offsetY, barWidth, barHeight, 0xff4d4d).setOrigin(0, 0.5);

        this.vfxLayer.add([background, fill]);
        this.bindingManager.bind(unit.sprite, [background, fill]);

        unit.healthBar = { background, fill };
        this.updateHealthBar(unit.healthBar, unit.currentHp, unit.finalStats.hp);

        const tokenContainer = this.scene.add.container(unit.sprite.x, background.y - 10);
        this.vfxLayer.add(tokenContainer);
        this.bindingManager.bind(unit.sprite, [tokenContainer]);
        this.tokenDisplays.set(unit.uniqueId, tokenContainer);
        this.updateTokenDisplay(unit.uniqueId);

        this.iconManager.createIconDisplay(unit.sprite, unit.healthBar);
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

    // 스킬 이름을 머리 위에 표시하는 효과를 보여줍니다.
    showSkillName(parentSprite, skillName, color = '#ffffff') {
        const style = {
            fontFamily: '"Arial Black", Arial, sans-serif',
            fontSize: '24px',
            color: color,
            stroke: '#000000',
            strokeThickness: 4,
        };

        const skillText = this.scene.add.text(parentSprite.x, parentSprite.y - 40, skillName, style)
            .setOrigin(0.5, 0.5);
        this.vfxLayer.add(skillText);

        this.scene.tweens.add({
            targets: skillText,
            y: skillText.y - 30,
            alpha: 0,
            duration: 1500,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                skillText.destroy();
            }
        });
    }

    /**
     * 상태 효과 이름을 머리 위에 표시합니다.
     * @param {Phaser.GameObjects.Sprite} parentSprite
     * @param {string} effectName
     * @param {string} color
     */
    showEffectName(parentSprite, effectName, color = '#ff4d4d') {
        const style = {
            fontFamily: '"Arial Black", Arial, sans-serif',
            fontSize: '22px',
            color: color,
            stroke: '#000000',
            strokeThickness: 4,
        };

        const effectText = this.scene.add.text(parentSprite.x, parentSprite.y - 70, effectName, style)
            .setOrigin(0.5, 0.5);
        this.vfxLayer.add(effectText);

        this.scene.tweens.add({
            targets: effectText,
            y: effectText.y - 30,
            alpha: 0,
            duration: 1500,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                effectText.destroy();
            }
        });
    }

    /**
     * 체력바의 길이를 현재 체력에 맞춰 갱신합니다.
     */
    updateHealthBar(healthBar, currentHp, maxHp) {
        if (!healthBar || !healthBar.fill || !healthBar.background) return;
        const percent = Math.max(0, Math.min(currentHp / maxHp, 1));
        healthBar.fill.displayWidth = healthBar.background.displayWidth * percent;
    }

    /**
     * 특정 유닛의 토큰 표시를 업데이트합니다.
     * 단순히 현재 토큰 개수만큼 아이콘을 다시 그립니다.
     */
    updateTokenDisplay(unitId) {
        const container = this.tokenDisplays.get(unitId);
        if (!container) return;
        container.removeAll(true);
        const count = tokenEngine.getTokens(unitId);
        for (let i = 0; i < count; i++) {
            const icon = this.scene.add.image(i * 8, 0, 'token').setScale(0.4);
            container.add(icon);
        }
    }

    /**
     * 모든 유닛의 상태 아이콘을 갱신합니다.
     */
    updateAllStatusIcons() {
        this.iconManager.updateAllIcons();
    }
    /**
     * 매니저와 관련된 모든 리소스를 정리합니다.
     */
    shutdown() {
        this.tokenDisplays.forEach(c => c.destroy());
        this.tokenDisplays.clear();
        this.iconManager.shutdown();
        this.vfxLayer.destroy();
        debugLogEngine.log("VFXManager", "VFX 매니저를 종료합니다.");
    }
}
