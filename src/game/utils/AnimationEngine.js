/**
 * 간단한 애니메이션 효과를 담당하는 엔진
 */
export class AnimationEngine {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * 대상을 확대하는 애니메이션
     * @param {Phaser.GameObjects.GameObject} target - 애니메이션을 적용할 대상
     * @param {number} scale - 최종 확대 크기
     * @param {number} duration - 애니메이션 시간 (밀리초)
     */
    scaleUp(target, scale = 1.2, duration = 100) {
        this.scene.tweens.add({
            targets: target,
            scale: scale,
            duration: duration,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * 대상을 원래 크기로 축소하는 애니메이션
     * @param {Phaser.GameObjects.GameObject} target - 애니메이션을 적용할 대상
     * @param {number} scale - 원래 크기
     * @param {number} duration - 애니메이션 시간 (밀리초)
     */
    scaleDown(target, scale = 1.0, duration = 100) {
        this.scene.tweens.add({
            targets: target,
            scale: scale,
            duration: duration,
            ease: 'Sine.easeInOut'
        });
    }
}
