import { mercenaryEngine } from '../utils/MercenaryEngine.js';
import { partyEngine } from '../utils/PartyEngine.js';
import { UnitDetailDOM } from './UnitDetailDOM.js';
import { equipmentManager } from '../utils/EquipmentManager.js';

export class EquipmentManagementDOMEngine {
    constructor(scene) {
        this.scene = scene;
        this.container = document.createElement('div');
        this.container.id = 'equipment-management-container';
        // 스킬 관리 씬과 동일한 스타일 클래스 적용
        this.container.className = 'skill-management-container';
        document.getElementById('app').appendChild(this.container);

        this.selectedMercenaryData = null;
        this.createView();
    }

    createView() {
        this.container.style.display = 'block';
        this.container.style.backgroundImage = 'url(assets/images/territory/inventory-scene.png)';

        const mainLayout = document.createElement('div');
        mainLayout.id = 'skill-main-layout';
        this.container.appendChild(mainLayout);

        const listPanel = this.createPanel('merc-list-panel', '출정 용병');
        mainLayout.appendChild(listPanel);
        this.mercenaryListContent = listPanel.querySelector('.panel-content');

        const detailsPanel = this.createPanel('merc-details-panel', '용병 장비 슬롯');
        mainLayout.appendChild(detailsPanel);
        this.mercenaryDetailsContent = detailsPanel.querySelector('.panel-content');

        const inventoryPanel = this.createPanel('equipment-inventory-panel', '장비 인벤토리');
        mainLayout.appendChild(inventoryPanel);
        this.equipmentInventoryContent = inventoryPanel.querySelector('.panel-content');
        this.equipmentInventoryContent.innerHTML = '<p style="text-align: center; color: #888; margin-top: 20px;">장비가 없습니다.</p>';

        this.populateMercenaryList();

        const backButton = document.createElement('div');
        backButton.id = 'skill-back-button';
        backButton.innerText = '← 영지로';
        backButton.onclick = () => this.scene.scene.start('TerritoryScene');
        this.container.appendChild(backButton);
    }

    createPanel(id, title) {
        const panel = document.createElement('div');
        panel.id = id;
        panel.className = 'skill-panel';
        panel.innerHTML = `<div class="panel-title">${title}</div><div class="panel-content"></div>`;
        return panel;
    }

    populateMercenaryList() {
        this.mercenaryListContent.innerHTML = '';
        const partyMembers = partyEngine.getPartyMembers().filter(id => id !== undefined);
        const allMercs = mercenaryEngine.getAllAlliedMercenaries();

        partyMembers.forEach(id => {
            const merc = allMercs.find(m => m.uniqueId === id);
            if (merc) {
                const item = document.createElement('div');
                item.className = 'merc-list-item';
                item.innerText = merc.instanceName;
                item.dataset.mercId = merc.uniqueId;
                item.onclick = () => this.selectMercenary(merc);
                this.mercenaryListContent.appendChild(item);
            }
        });

        if (partyMembers.length > 0) {
            const first = allMercs.find(m => m.uniqueId === partyMembers[0]);
            if (first) this.selectMercenary(first);
        }
    }

    selectMercenary(mercData) {
        this.selectedMercenaryData = mercData;
        // ... (선택된 용병 하이라이트 로직은 스킬 관리와 동일) ...
        this.refreshMercenaryDetails();
    }

    refreshMercenaryDetails() {
        if (!this.selectedMercenaryData) {
            this.mercenaryDetailsContent.innerHTML = '<p>용병을 선택하세요.</p>';
            return;
        }
        const mercData = this.selectedMercenaryData;
        this.mercenaryDetailsContent.innerHTML = '';

        const portrait = document.createElement('div');
        portrait.className = 'merc-portrait-small';
        portrait.style.backgroundImage = `url(${mercData.uiImage})`;
        portrait.onclick = () => document.body.appendChild(UnitDetailDOM.create(mercData));
        this.mercenaryDetailsContent.appendChild(portrait);

        const slotsContainer = document.createElement('div');
        slotsContainer.className = 'merc-equipment-slots-container';

        const equipSlotLabels = ['무기', '갑옷', '악세사리1', '악세사리2'];
        const equippedItems = equipmentManager.getEquippedItems(mercData.uniqueId);

        equipSlotLabels.forEach((label, idx) => {
            const slot = document.createElement('div');
            slot.className = 'merc-equip-slot';

            const slotLabel = document.createElement('span');
            slotLabel.innerText = label;
            slot.appendChild(slotLabel);

            slotsContainer.appendChild(slot);
        });

        this.mercenaryDetailsContent.appendChild(slotsContainer);
    }

    destroy() {
        this.container.remove();
    }
}
