import { mercenaryEngine } from '../utils/MercenaryEngine.js';
import { partyEngine } from '../utils/PartyEngine.js';
import { UnitDetailDOM } from './UnitDetailDOM.js';
import { equipmentManager } from '../utils/EquipmentManager.js';
import { itemInventoryManager } from '../utils/ItemInventoryManager.js'; // 인벤토리 import
import { EQUIPMENT_SLOTS } from '../data/items.js';

export class EquipmentManagementDOMEngine {
    constructor(scene) {
        this.scene = scene;
        this.container = document.createElement('div');
        this.container.id = 'equipment-management-container';
        this.container.className = 'skill-management-container'; // 기존 CSS 재활용
        document.getElementById('app').appendChild(this.container);

        this.selectedMercenaryData = null;
        this.draggedItemId = null;
        this.draggedFromSlotType = null;

        this.createView();
    }

    createView() {
        this.container.style.display = 'block';
        this.container.style.backgroundImage = 'url(assets/images/territory/inventory-scene.png)';

        const mainLayout = document.createElement('div');
        mainLayout.id = 'skill-main-layout';
        this.container.appendChild(mainLayout);

        // 왼쪽: 용병 목록
        const listPanel = this.createPanel('merc-list-panel', '출정 용병');
        mainLayout.appendChild(listPanel);
        this.mercenaryListContent = listPanel.querySelector('.panel-content');

        // 가운데: 용병 정보 및 장비 슬롯
        const detailsPanel = this.createPanel('merc-details-panel', '용병 장비');
        mainLayout.appendChild(detailsPanel);
        this.mercenaryDetailsContent = detailsPanel.querySelector('.panel-content');

        // 오른쪽: 아이템 인벤토리
        const inventoryPanel = this.createPanel('equipment-inventory-panel', '장비 인벤토리');
        mainLayout.appendChild(inventoryPanel);
        this.equipmentInventoryContent = inventoryPanel.querySelector('.panel-content');

        // 드래그 앤 드롭 이벤트 리스너 설정
        this.equipmentInventoryContent.ondragover = e => e.preventDefault();
        this.equipmentInventoryContent.ondrop = e => this.onDropOnInventory(e);
        
        this.populateMercenaryList();
        this.refreshInventory();

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

        const equippedItems = equipmentManager.getEquippedItems(mercData.uniqueId);
        const slotTypes = ['WEAPON', 'ARMOR', 'ACCESSORY1', 'ACCESSORY2'];
        const slotLabels = ['무기', '갑옷', '장신구 1', '장신구 2'];

        slotTypes.forEach((slotType, idx) => {
            const itemInstanceId = equippedItems[idx];
            const item = itemInstanceId ? itemInventoryManager.getItem(itemInstanceId) : null;
            const slot = this.createEquipSlot(slotType, slotLabels[idx], item);
            slotsContainer.appendChild(slot);
        });

        this.mercenaryDetailsContent.appendChild(slotsContainer);
    }
    
    createEquipSlot(slotType, label, item) {
        const slot = document.createElement('div');
        slot.className = 'merc-equip-slot';
        slot.dataset.slotType = slotType;

        slot.ondragover = e => e.preventDefault();
        slot.ondrop = e => this.onDropOnSlot(e);

        const slotLabel = document.createElement('span');
        slotLabel.innerText = label;
        
        const itemIcon = document.createElement('div');
        itemIcon.className = 'equip-item-icon';
        if (item) {
            itemIcon.style.backgroundImage = `url(${item.illustrationPath})`;
            itemIcon.draggable = true;
            itemIcon.ondragstart = e => {
                this.draggedItemId = item.instanceId;
                this.draggedFromSlotType = slotType;
                e.dataTransfer.setData('text/plain', item.instanceId);
            };
            // 아이템 툴팁 로직 추가 필요
        }
        
        slot.appendChild(slotLabel);
        slot.appendChild(itemIcon);
        return slot;
    }

    refreshInventory() {
        this.equipmentInventoryContent.innerHTML = '';
        const inventory = itemInventoryManager.getInventory();
        if (inventory.length === 0) {
            this.equipmentInventoryContent.innerHTML = '<p style="text-align: center; color: #888; margin-top: 20px;">장비가 없습니다.</p>';
            return;
        }
        
        inventory.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'item-inventory-card';
            itemCard.style.backgroundImage = `url(${item.illustrationPath})`;
            itemCard.draggable = true;
            itemCard.dataset.instanceId = item.instanceId;
            
            itemCard.ondragstart = e => {
                this.draggedItemId = item.instanceId;
                this.draggedFromSlotType = null;
                e.dataTransfer.setData('text/plain', item.instanceId);
            };
            
            // 아이템 툴팁 로직 추가 필요
            this.equipmentInventoryContent.appendChild(itemCard);
        });
    }

    onDropOnSlot(event) {
        event.preventDefault();
        const targetSlotType = event.currentTarget.dataset.slotType;
        if (!this.selectedMercenaryData || !this.draggedItemId) return;

        equipmentManager.equipItem(this.selectedMercenaryData.uniqueId, targetSlotType, this.draggedItemId);

        this.refreshMercenaryDetails();
        this.refreshInventory();
        this.draggedItemId = null;
        this.draggedFromSlotType = null;
    }
    
    onDropOnInventory(event) {
        event.preventDefault();
        if (!this.selectedMercenaryData || !this.draggedItemId) return;
        if (this.draggedFromSlotType) {
            equipmentManager.unequipItem(this.selectedMercenaryData.uniqueId, this.draggedFromSlotType);
            this.refreshMercenaryDetails();
            this.refreshInventory();
        }
        this.draggedItemId = null;
        this.draggedFromSlotType = null;
    }

    destroy() {
        this.container.remove();
    }
}
