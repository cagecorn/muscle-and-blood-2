import { debugLogEngine } from './DebugLogEngine.js';
import { statusEffectManager } from './StatusEffectManager.js';
import { skillCardDatabase } from '../data/skills/SkillCardDatabase.js';
import { statusEffects } from '../data/status-effects.js';
import { ownedSkillsManager } from './OwnedSkillsManager.js';
import { skillInventoryManager } from './SkillInventoryManager.js';
import { EFFECT_TYPES } from './EffectTypes.js';

/**
 * 상태 효과 아이콘을 생성하고 관리하는 엔진
 */
export class IconManager {
    constructor(scene, vfxLayer) {
        this.scene = scene;
        this.vfxLayer = vfxLayer;
        // key: unitId, value: { buffsContainer, debuffsContainer, buffIcons: Map<effectInstanceId, {icon, text}>, debuffIcons: Map<effectInstanceId, {icon, text}>, parentSprite }
        this.activeIconDisplays = new Map();
        debugLogEngine.log('IconManager', '아이콘 매니저가 초기화되었습니다.');
    }

    /**
     * 특정 유닛의 아이콘 표시 컨테이너를 생성합니다.
     * @param {Phaser.GameObjects.Sprite} parentSprite - 아이콘이 따라다닐 유닛
     */
    createIconDisplay(parentSprite) {
        const unitId = parentSprite.getData('unitId');
        if (!unitId || this.activeIconDisplays.has(unitId)) return;

        // 버프 아이콘을 위한 컨테이너 (유닛 왼쪽)
        const buffsContainer = this.scene.add.container(
            parentSprite.x - parentSprite.displayWidth / 2 - 15,
            parentSprite.y
        );
        this.vfxLayer.add(buffsContainer);

        // 디버프 아이콘을 위한 컨테이너 (유닛 오른쪽)
        const debuffsContainer = this.scene.add.container(
            parentSprite.x + parentSprite.displayWidth / 2 + 15,
            parentSprite.y
        );
        this.vfxLayer.add(debuffsContainer);

        this.activeIconDisplays.set(unitId, {
            parentSprite,
            buffsContainer,
            debuffsContainer,
            buffIcons: new Map(),
            debuffIcons: new Map(),
        });

        // 유닛의 스프라이트와 바인딩될 수 있도록 컨테이너들을 반환합니다.
        return { buffsContainer, debuffsContainer };
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
        const existingBuffIconIds = new Set(display.buffIcons.keys());
        const existingDebuffIconIds = new Set(display.debuffIcons.keys());
        const iconSpacing = 22; // 아이콘 간격

        const buffs = [];
        const debuffs = [];

        activeEffects.forEach(effect => {
            if (effect.type === EFFECT_TYPES.BUFF) {
                buffs.push(effect);
            } else {
                debuffs.push(effect);
            }
        });

        // 패시브 스킬 추가 (버프 아이콘으로 취급)
        const equipped = ownedSkillsManager.getEquippedSkills(unitId);
        equipped.forEach(instId => {
            if (!instId) return;
            const inst = skillInventoryManager.getInstanceData(instId);
            const skillData = skillInventoryManager.getSkillData(inst.skillId, inst.grade);
            if (skillData && skillData.type === 'PASSIVE') {
                buffs.push({
                    instanceId: `passive_${inst.skillId}`,
                    id: inst.skillId,
                    sourceSkillName: skillData.name,
                    iconPath: skillData.illustrationPath,
                    duration: 'P', // Passive의 P로 표시
                });
            }
        });

        // 1. 버프 아이콘 처리 (왼쪽 컨테이너)
        buffs.forEach((effect, index) => {
            const effectDef = statusEffects[effect.id] || skillCardDatabase[effect.id];
            const iconKey = effectDef
                ? effectDef.iconPath
                    ? effectDef.iconPath.replace(/^assets\//, '')
                    : effect.id
                : effect.id; // 패시브 스킬의 illustrationPath 직접 사용

            let iconData = display.buffIcons.get(effect.instanceId);
            if (!iconData) {
                const iconContainer = this.scene.add.container(0, 0);
                const icon = this.scene.add
                    .image(0, 0, iconKey)
                    .setScale(0.04)
                    .setAlpha(0.5); // 반투명
                const turnText = this.scene.add
                    .text(0, 8, '', {
                        fontSize: '12px',
                        color: '#fff',
                        stroke: '#000',
                        strokeThickness: 2,
                    })
                    .setOrigin(0.5);
                iconContainer.add([icon, turnText]);
                display.buffsContainer.add(iconContainer);
                iconData = { icon: iconContainer, text: turnText };
                display.buffIcons.set(effect.instanceId, iconData);
            } else {
                if (iconData.icon.list[0].texture.key !== iconKey)
                    iconData.icon.list[0].setTexture(iconKey);
            }
            iconData.text.setText(effect.duration);
            // 세로 나열
            iconData.icon.setY(
                -display.parentSprite.displayHeight / 2 + 10 + index * iconSpacing
            );
            existingBuffIconIds.delete(effect.instanceId);
        });

        // 2. 디버프 아이콘 처리 (오른쪽 컨테이너)
        debuffs.forEach((effect, index) => {
            const effectDef = statusEffects[effect.id] || skillCardDatabase[effect.id];
            const iconKey = effectDef
                ? effectDef.iconPath
                    ? effectDef.iconPath.replace(/^assets\//, '')
                    : effect.id
                : effect.id;

            let iconData = display.debuffIcons.get(effect.instanceId);
            if (!iconData) {
                const iconContainer = this.scene.add.container(0, 0);
                const icon = this.scene.add
                    .image(0, 0, iconKey)
                    .setScale(0.04)
                    .setAlpha(0.5); // 반투명
                const turnText = this.scene.add
                    .text(0, 8, '', {
                        fontSize: '12px',
                        color: '#fff',
                        stroke: '#000',
                        strokeThickness: 2,
                    })
                    .setOrigin(0.5);
                iconContainer.add([icon, turnText]);
                display.debuffsContainer.add(iconContainer);
                iconData = { icon: iconContainer, text: turnText };
                display.debuffIcons.set(effect.instanceId, iconData);
            } else {
                if (iconData.icon.list[0].texture.key !== iconKey)
                    iconData.icon.list[0].setTexture(iconKey);
            }
            iconData.text.setText(effect.duration);
            // 세로 나열
            iconData.icon.setY(
                -display.parentSprite.displayHeight / 2 + 10 + index * iconSpacing
            );
            existingDebuffIconIds.delete(effect.instanceId);
        });

        // 3. 만료된 버프 아이콘 제거
        existingBuffIconIds.forEach(instanceId => {
            const iconData = display.buffIcons.get(instanceId);
            if (iconData) {
                iconData.icon.destroy();
                display.buffIcons.delete(instanceId);
            }
        });

        // 4. 만료된 디버프 아이콘 제거
        existingDebuffIconIds.forEach(instanceId => {
            const iconData = display.debuffIcons.get(instanceId);
            if (iconData) {
                iconData.icon.destroy();
                display.debuffIcons.delete(instanceId);
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
            display.buffsContainer.destroy();
            display.debuffsContainer.destroy();
            this.activeIconDisplays.delete(unitId);
        }
    }

    shutdown() {
        this.activeIconDisplays.forEach(display => {
            display.buffsContainer.destroy();
            display.debuffsContainer.destroy();
        });
        this.activeIconDisplays.clear();
        debugLogEngine.log('IconManager', '아이콘 매니저를 종료합니다.');
    }
}

