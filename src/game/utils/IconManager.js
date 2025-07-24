import { debugLogEngine } from './DebugLogEngine.js';
import { statusEffectManager } from './StatusEffectManager.js';
import { skillCardDatabase } from '../data/skills/SkillCardDatabase.js';
import { statusEffects } from '../data/status-effects.js';
import { ownedSkillsManager } from './OwnedSkillsManager.js';
import { skillInventoryManager } from './SkillInventoryManager.js';

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
        let iconIndex = 0;

        // 1. 지속시간이 있는 활성 효과 아이콘 처리
        activeEffects.forEach(effect => {
            const effectDef = statusEffects[effect.id] || skillCardDatabase[effect.id];
            const iconKey = effectDef ? effectDef.id : null;
            if (!iconKey) return;

            let iconData = display.icons.get(effect.instanceId);

            if (!iconData) { // 새로운 아이콘 생성
                const iconContainer = this.scene.add.container(0, 0);
                const icon = this.scene.add.image(0, 0, iconKey).setScale(0.04);
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
            } else {
                const image = iconData.icon.list[0];
                if (image.texture.key !== iconKey) {
                    image.setTexture(iconKey);
                }
            }

            // 턴 수 업데이트 및 위치 조정
            iconData.text.setText(effect.duration);
            iconData.icon.setX(iconIndex * 22);
            existingIconIds.delete(effect.instanceId);
            iconIndex++; // 아이콘 위치를 위해 인덱스 증가
        });

        // ✨ 2. 패시브 스킬 아이콘 처리 (아이언 윌)
        const equipped = ownedSkillsManager.getEquippedSkills(unitId);
        equipped.forEach(instId => {
            if (!instId) return;
            const inst = skillInventoryManager.getInstanceData(instId);
            if (inst && inst.skillId === 'ironWill') {
                const passiveId = `passive_${inst.skillId}`; // 고유 키 생성
                let iconData = display.icons.get(passiveId);

                if (!iconData) { // 패시브 아이콘이 없으면 새로 생성
                    const iconContainer = this.scene.add.container(0, 0);
                    const icon = this.scene.add.image(0, 0, inst.skillId).setScale(0.04);
                    iconContainer.add(icon);
                    display.container.add(iconContainer);
                    iconData = { icon: iconContainer, text: null }; // 텍스트 없음
                    display.icons.set(passiveId, iconData);
                }

                iconData.icon.setX(iconIndex * 22);
                existingIconIds.delete(passiveId);
                iconIndex++;
            }
        });

        // 3. 만료된 아이콘 제거
        existingIconIds.forEach(instanceId => {
            const iconData = display.icons.get(instanceId);
            if (iconData) {
                iconData.icon.destroy();
                display.icons.delete(instanceId);
            }
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
