import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 유닛의 그림자를 생성하고 관리하는 엔진
 */
class ShadowManager {
    constructor(scene) {
        this.scene = scene;
        // 그림자를 다른 요소보다 먼저, 배경 위에 표시하기 위해 레이어를 생성합니다.
        this.shadowLayer = this.scene.add.layer();
        debugLogEngine.log('ShadowManager', '그림자 매니저가 초기화되었습니다.');
    }

    /**
     * 특정 스프라이트에 대한 그림자를 생성합니다.
     * @param {Phaser.GameObjects.Sprite} parentSprite 원본 스프라이트
     * @returns {Phaser.GameObjects.Sprite|null} 생성된 그림자 스프라이트
     */
    createShadow(parentSprite) {
        if (!parentSprite || !parentSprite.texture || parentSprite.texture.key === '__MISSING') {
            debugLogEngine.warn('ShadowManager', '유효하지 않은 스프라이트에는 그림자를 생성할 수 없습니다.');
            return null;
        }

        // 원본과 동일한 텍스처의 스프라이트를 생성합니다.
        const shadow = this.scene.add.sprite(parentSprite.x, parentSprite.y, parentSprite.texture.key);

        shadow.setTint(0x000000); // 검은색 틴트
        shadow.setAlpha(0.4); // 반투명하게
        shadow.setScale(parentSprite.scaleX, parentSprite.scaleY);
        shadow.setOrigin(parentSprite.originX, parentSprite.originY);

        // 45도 기울이고 세로 크기를 절반으로 줄입니다.
        shadow.skewX = Phaser.Math.DegToRad(45);
        shadow.scaleY *= 0.5;

        // 발밑에 보이도록 위치 조정
        const parentHeight = parentSprite.displayHeight;
        shadow.y += parentHeight / 2 - shadow.displayHeight / 2;

        // 레이어에 추가하고 깊이를 원본보다 한 단계 낮춥니다.
        this.shadowLayer.add(shadow);
        shadow.setDepth(parentSprite.depth - 1);

        debugLogEngine.log('ShadowManager', `'${parentSprite.texture.key}'의 그림자를 생성했습니다.`);
        return shadow;
    }

    /**
     * 모든 그림자를 제거합니다.
     */
    shutdown() {
        this.shadowLayer.destroy();
        debugLogEngine.log('ShadowManager', '그림자 매니저를 종료하고 모든 그림자를 제거합니다.');
    }
}

export const shadowManager = (scene) => new ShadowManager(scene);
