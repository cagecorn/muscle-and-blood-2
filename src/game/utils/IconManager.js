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
        const iconSpacing = 22;

        // 1. 효과를 액티브(버프/디버프)와 패시브로 분리
        const passiveEffects = [];
        const otherEffects = activeEffects;

        const equipped = ownedSkillsManager.getEquippedSkills(unitId);
        equipped.forEach(instId => {
            if (!instId) return;
            const inst = skillInventoryManager.getInstanceData(instId);
            if (inst && inst.skillId === 'ironWill') {
                passiveEffects.push({
                    instanceId: `passive_${inst.skillId}`,
                    id: inst.skillId
                });
            }
        });

        // 2. 액티브 효과 아이콘 처리 (왼쪽 정렬)
        const totalActiveWidth = otherEffects.length > 0 ? (otherEffects.length - 1) * iconSpacing : 0;
        const activeStartX = -totalActiveWidth / 2;

        otherEffects.forEach((effect, index) => {
            const effectDef = statusEffects[effect.id] || skillCardDatabase[effect.id];
            const iconKey = effectDef ? effectDef.id : null;
            if (!iconKey) return;

            let iconData = display.icons.get(effect.instanceId);
            if (!iconData) {
                const iconContainer = this.scene.add.container(0, 0);
                const icon = this.scene.add.image(0, 0, iconKey).setScale(0.04);
                const turnText = this.scene.add.text(0, 8, effect.duration, { fontSize: '12px', color: '#fff', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5);
                iconContainer.add([icon, turnText]);
                display.container.add(iconContainer);
                iconData = { icon: iconContainer, text: turnText };
                display.icons.set(effect.instanceId, iconData);
            } else {
                if (iconData.icon.list[0].texture.key !== iconKey) iconData.icon.list[0].setTexture(iconKey);
            }
            iconData.text.setText(effect.duration);
            iconData.icon.setX(activeStartX + index * iconSpacing);
            existingIconIds.delete(effect.instanceId);
        });

        // 3. 패시브 스킬 아이콘 처리 (오른쪽 정렬)
        const totalPassiveWidth = passiveEffects.length > 0 ? (passiveEffects.length - 1) * iconSpacing : 0;
        const passiveStartX = totalActiveWidth > 0 ? totalActiveWidth / 2 + iconSpacing : -totalPassiveWidth / 2;

        passiveEffects.forEach((effect, index) => {
            let iconData = display.icons.get(effect.instanceId);
            if (!iconData) {
                const iconContainer = this.scene.add.container(0, 0);
                const icon = this.scene.add.image(0, 0, effect.id).setScale(0.04);
                iconContainer.add(icon);
                display.container.add(iconContainer);
                iconData = { icon: iconContainer, text: null };
                display.icons.set(effect.instanceId, iconData);
            }
            iconData.icon.setX(passiveStartX + index * iconSpacing);
            existingIconIds.delete(effect.instanceId);
        });

        // 4. 만료된 아이콘 제거
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
