import { mercenaryEngine } from '../utils/MercenaryEngine.js';
import { partyEngine } from '../utils/PartyEngine.js';
import { UnitDetailDOM } from './UnitDetailDOM.js';
import { equipmentManager } from '../utils/EquipmentManager.js';
import { itemInventoryManager } from '../utils/ItemInventoryManager.js';
import { ItemTooltipManager } from './ItemTooltipManager.js';
import { EQUIPMENT_SLOTS } from '../data/items.js';

export class EquipmentManagementDOMEngine {
    constructor(scene) {
        this.scene = scene;
        this.container = document.createElement('div');
        this.container.id = 'equipment-management-container';
        this.container.className = 'skill-management-container';
        document.getElementById('app').appendChild(this.container);

        this.selectedMercenaryData = null;
        this.draggedData = null; // { source, instanceId, slotType }

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

        const detailsPanel = this.createPanel('merc-details-panel', '용병 장비');
        mainLayout.appendChild(detailsPanel);
        this.mercenaryDetailsContent = detailsPanel.querySelector('.panel-content');

        const inventoryPanel = this.createPanel('equipment-inventory-panel', '장비 인벤토리');
        mainLayout.appendChild(inventoryPanel);
        this.equipmentInventoryContent = inventoryPanel.querySelector('.panel-content');

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
    
    // ... populateMercenaryList, selectMercenary ...
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

        if (partyMembers.length > 0 && !this.selectedMercenaryData) {
            const first = allMercs.find(m => m.uniqueId === partyMembers[0]);
            if (first) this.selectMercenary(first);
        } else if (this.selectedMercenaryData) {
             this.selectMercenary(this.selectedMercenaryData);
        }
    }
    
    selectMercenary(mercData) {
        this.selectedMercenaryData = mercData;
        
        this.mercenaryListContent.querySelectorAll('.merc-list-item').forEach(el => el.classList.remove('selected'));
        const newSelected = this.mercenaryListContent.querySelector(`[data-merc-id='${mercData.uniqueId}']`);
        if (newSelected) newSelected.classList.add('selected');

        this.refreshMercenaryDetails();
    }

    refreshMercenaryDetails() {
        if (!this.selectedMercenaryData) { this.mercenaryDetailsContent.innerHTML = '<p>용병을 선택하세요.</p>'; return; }
        const mercData = this.selectedMercenaryData;
        this.mercenaryDetailsContent.innerHTML = '';

        const portrait = document.createElement('div');
        portrait.className = 'merc-portrait-small';
        portrait.style.backgroundImage = `url(${mercData.uiImage})`;
        portrait.onclick = () => {
             const detailView = UnitDetailDOM.create(mercData);
             this.container.appendChild(detailView);
             requestAnimationFrame(() => detailView.classList.add('visible'));
        };
        this.mercenaryDetailsContent.appendChild(portrait);

        const slotsContainer = document.createElement('div');
        slotsContainer.className = 'merc-equipment-slots-container';

        const equippedItems = equipmentManager.getEquippedItems(mercData.uniqueId);
        const slotTypes = ['WEAPON', 'ARMOR', 'ACCESSORY1', 'ACCESSORY2'];
        const slotLabels = ['무기', '갑옷', '장신구 1', '장신구 2'];
        
        slotTypes.forEach((slotType, idx) => {
            const itemInstanceId = equippedItems[idx];
            // 캐시 또는 인벤토리에서 아이템 정보 가져오기
            const item = itemInstanceId ? (equipmentManager.itemInstanceCache.get(itemInstanceId) || itemInventoryManager.getItem(itemInstanceId)) : null;
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
        
        if (item) {
            slot.style.backgroundImage = `url(${item.illustrationPath})`;
            slot.draggable = true;
            slot.dataset.instanceId = item.instanceId;
            slot.ondragstart = e => this.onDragStart(e, { source: 'slot', instanceId: item.instanceId, slotType: slotType });
            slot.onmouseenter = e => ItemTooltipManager.show(item, e);
            slot.onmouseleave = () => ItemTooltipManager.hide();
        }

        const slotLabel = document.createElement('span');
        slotLabel.className = 'merc-equip-slot-label';
        slotLabel.innerText = item ? `[${item.grade[0]}] ${item.name}` : `[${label}]`;
        slot.appendChild(slotLabel);

        return slot;
    }

    refreshInventory() {
        this.equipmentInventoryContent.innerHTML = '';
        const inventory = itemInventoryManager.getInventory();
        if (inventory.length === 0) {
            this.equipmentInventoryContent.innerHTML = '<p style="text-align:center; color:#888;">장비가 없습니다.</p>';
            return;
        }
        
        inventory.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = `item-inventory-card grade-${item.grade.toLowerCase()}`;
            itemCard.style.backgroundImage = `url(${item.illustrationPath})`;
            itemCard.draggable = true;
            itemCard.dataset.instanceId = item.instanceId;
            
            itemCard.ondragstart = e => this.onDragStart(e, { source: 'inventory', instanceId: item.instanceId });
            itemCard.onmouseenter = e => ItemTooltipManager.show(item, e);
            itemCard.onmouseleave = () => ItemTooltipManager.hide();
            
            this.equipmentInventoryContent.appendChild(itemCard);
        });
    }
    
    onDragStart(event, data) {
        this.draggedData = data;
        event.dataTransfer.setData('text/plain', data.instanceId);
    }

    onDropOnSlot(event) {
        event.preventDefault();
        const targetSlotElement = event.currentTarget;
        const targetSlotType = targetSlotElement.dataset.slotType;
        if (!this.selectedMercenaryData || !this.draggedData) return;
        
        const unitId = this.selectedMercenaryData.uniqueId;
        const draggedInstanceId = this.draggedData.instanceId;

        // 아이템 스왑 로직
        if (this.draggedData.source === 'slot') {
            const sourceSlotType = this.draggedData.slotType;
            equipmentManager.swapItems(unitId, sourceSlotType, targetSlotType);
        } else { // 인벤토리 -> 슬롯
            equipmentManager.equipItem(unitId, targetSlotType, draggedInstanceId);
        }
        
        this.refreshAll();
    }
    
    onDropOnInventory(event) {
        event.preventDefault();
        if (!this.selectedMercenaryData || !this.draggedData || this.draggedData.source !== 'slot') return;

        equipmentManager.unequipItem(this.selectedMercenaryData.uniqueId, this.draggedData.slotType);

        this.refreshAll();
    }

    refreshAll() {
        this.refreshMercenaryDetails();
        this.refreshInventory();
        this.draggedData = null;
    }

    destroy() {
        this.container.remove();
        ItemTooltipManager.hide(); // 씬 전환 시 툴팁 제거
    }
}
