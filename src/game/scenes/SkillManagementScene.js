import { Scene } from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { uiConfig } from '../config/UIConfig.js';
import { partyEngine } from '../utils/PartyEngine.js';
import { SKILL_TYPES } from '../utils/SkillEngine.js';

export class SkillManagementScene extends Scene {
    constructor() {
        super('SkillManagementScene');
    }

    preload() {
        this.load.image('skills-scene-background', 'assets/images/territory/skills-scene.png');
        this.load.image('panel-background', 'assets/images/ui-panel.png');
    }

    create() {
        this.add.image(0, 0, 'skills-scene-background').setOrigin(0);

        const listCfg = uiConfig.skillManagementScene.mercenaryListPanel;
        const listBg = this.add.image(listCfg.x, listCfg.y, 'panel-background').setOrigin(0).setDisplaySize(listCfg.width, listCfg.height);
        this.add.text(listCfg.x + 10, listCfg.y + 10, '출정 중인 용병', { fontSize: '20px', color: '#fff' });

        const deployed = partyEngine.getDeployedMercenaries();
        deployed.forEach((merc, idx) => {
            const y = listCfg.y + 40 + idx * 30;
            const text = this.add.text(listCfg.x + 20, y, merc.instanceName, { fontSize: '16px', color: '#ddd' }).setInteractive();
            text.setData('mercenaryId', merc.uniqueId);
            text.on('pointerdown', this.showMercenaryDetails, this);
        });

        const detailsCfg = uiConfig.skillManagementScene.mercenaryDetailsPanel;
        this.add.image(detailsCfg.x, detailsCfg.y, 'panel-background').setOrigin(0).setDisplaySize(detailsCfg.width, detailsCfg.height);
        this.detailsTitleText = this.add.text(detailsCfg.x + 10, detailsCfg.y + 10, '용병 상세 정보', { fontSize: '20px', color: '#fff' });
        this.skillSlotsContainer = this.add.container(detailsCfg.x + 20, detailsCfg.y + 50);

        const invCfg = uiConfig.skillManagementScene.skillInventoryPanel;
        this.add.image(invCfg.x, invCfg.y, 'panel-background').setOrigin(0).setDisplaySize(invCfg.width, invCfg.height);
        this.add.text(invCfg.x + 10, invCfg.y + 10, '스킬 카드 인벤토리', { fontSize: '20px', color: '#fff' });
        this.skillCardGridContainer = this.add.container(invCfg.x + 20, invCfg.y + 40);
    }

    showMercenaryDetails(pointer) {
        const mercId = pointer.gameObject.getData('mercenaryId');
        const mercenary = partyEngine.getMercenaryById(mercId);

        if (mercenary) {
            this.detailsTitleText.setText(`${mercenary.instanceName} 상세 정보`);
            this.skillSlotsContainer.removeAll(true);

            const spacing = 100;
            mercenary.skillSlots.forEach((slotType, index) => {
                const x = index * spacing;
                const container = this.add.container(x, 0);

                const g = this.add.graphics();
                g.lineStyle(3, SKILL_TYPES[slotType].color);
                g.strokeRect(0, 0, 80, 100);
                container.add(g);

                const typeText = this.add.text(40, 85, SKILL_TYPES[slotType].name, { fontSize: '12px', color: '#eee' }).setOrigin(0.5, 0);
                const empty = this.add.text(40, 35, '[빈 슬롯]', { fontSize: '14px', color: '#999' }).setOrigin(0.5);
                container.add([empty, typeText]);
                this.skillSlotsContainer.add(container);
            });
        }
    }
}

