import { debugLogEngine } from './DebugLogEngine.js';
import { statusEffectManager } from './StatusEffectManager.js';
import { skillCardDatabase } from '../data/skills/SkillCardDatabase.js';

/**
 * 상태 효과 아이콘을 생성하고 관리하는 엔진
 */
export class IconManager {
    constructor(scene, vfxLayer) {
        this.scene = scene;
        this.vfxLayer = vfxLayer;
        // key: unitId, value: { container: Container, icons: Map<effectInstanceId, {icon, text}> }
        this.activeIconDisplays = new Map();
        debugLogEngine.log('IconManager', '아이콘 매니저가 초기화되었습니다.');
    }

    /**
     * 특정 유닛의 아이콘 표시 컨테이너를 생성합니다.
     * @param {Phaser.GameObjects.Sprite} parentSprite - 아이콘이 따라다닐 유닛
     * @param {object} healthBar - 위치 기준이 될 체력바
     */
    createIconDisplay(parentSprite, healthBar) {
        const unitId = parentSprite.getData('unitId');
        if (!unitId || this.activeIconDisplays.has(unitId)) return;

        const container = this.scene.add.container(healthBar.background.x, healthBar.background.y + 12);
        this.vfxLayer.add(container);

        this.activeIconDisplays.set(unitId, {
            container: container,
            icons: new Map()
        });
        
        // 유닛의 스프라이트와 바인딩될 수 있도록 컨테이너를 반환합니다.
        return container;
    }

    /**
     * 매 턴, 모든 유닛의 상태 효과 아이콘을 최신 정보로 업데이트합니다.
     */
    updateAllIcons() {
        for (const unitId of this.activeIconDisplays.keys()) {
            this.updateIconsForUnit(unitId);
        }
    }

    /**
     * 특정 유닛의 상태 효과 아이콘을 업데이트합니다.
     * @param {number} unitId - 대상 유닛의 고유 ID
     */
    updateIconsForUnit(unitId) {
        const display = this.activeIconDisplays.get(unitId);
        if (!display) return;

        const activeEffects = statusEffectManager.activeEffects.get(unitId) || [];
        const existingIconIds = new Set(display.icons.keys());

        // 활성 효과를 기반으로 아이콘을 추가하거나 업데이트합니다.
        activeEffects.forEach((effect, index) => {
            const skillData = skillCardDatabase[effect.sourceSkillName];
            if (!skillData) return;

            let iconData = display.icons.get(effect.instanceId);

            if (!iconData) { // 새로운 아이콘 생성
                const iconContainer = this.scene.add.container(0, 0);
                const icon = this.scene.add.image(0, 0, skillData.id).setScale(0.2);
                const turnText = this.scene.add.text(0, 8, effect.duration, {
                    fontSize: '12px',
                    color: '#fff',
                    stroke: '#000',
                    strokeThickness: 2
                }).setOrigin(0.5);

                iconContainer.add([icon, turnText]);
                display.container.add(iconContainer);
                iconData = { icon: iconContainer, text: turnText };
                display.icons.set(effect.instanceId, iconData);
            }

            // 턴 수 업데이트 및 위치 조정
            iconData.text.setText(effect.duration);
            iconData.icon.setX(index * 22); // 아이콘 간 간격 조정
            existingIconIds.delete(effect.instanceId);
        });

        // 만료된 아이콘 제거
        existingIconIds.forEach(instanceId => {
            display.icons.get(instanceId).icon.destroy();
            display.icons.delete(instanceId);
        });
    }

    /**
     * 유닛이 제거될 때 관련 아이콘 디스플레이도 함께 제거합니다.
     * @param {number} unitId
     */
    removeIconDisplay(unitId) {
        const display = this.activeIconDisplays.get(unitId);
        if (display) {
            display.container.destroy();
            this.activeIconDisplays.delete(unitId);
        }
    }

    shutdown() {
        this.activeIconDisplays.forEach(({ container }) => container.destroy());
        this.activeIconDisplays.clear();
        debugLogEngine.log('IconManager', '아이콘 매니저를 종료합니다.');
    }
}
