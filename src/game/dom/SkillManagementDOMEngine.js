import { mercenaryEngine } from '../utils/MercenaryEngine.js';
import { partyEngine } from '../utils/PartyEngine.js';
import { skillInventoryManager } from '../utils/SkillInventoryManager.js';
import { ownedSkillsManager } from '../utils/OwnedSkillsManager.js';
import { UnitDetailDOM } from './UnitDetailDOM.js';
import { SkillTooltipManager } from './SkillTooltipManager.js';

export class SkillManagementDOMEngine {
    constructor(scene) {
        this.scene = scene;
        this.container = document.getElementById('skill-management-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'skill-management-container';
            document.getElementById('app').appendChild(this.container);
        }

        this.selectedMercenaryData = null;
        this.draggedData = null;

        this.createView();
    }

    createView() {
        this.container.style.display = 'block';
        this.container.style.backgroundImage = 'url(assets/images/territory/skills-scene.png)';

        const mainLayout = document.createElement('div');
        mainLayout.id = 'skill-main-layout';
        this.container.appendChild(mainLayout);

        const listPanel = this.createPanel('skill-list-panel', '출정 용병');
        mainLayout.appendChild(listPanel);
        this.mercenaryListContent = listPanel.querySelector('.panel-content');

        const detailsPanel = this.createPanel('skill-details-panel', '용병 스킬 슬롯');
        mainLayout.appendChild(detailsPanel);
        this.mercenaryDetailsContent = detailsPanel.querySelector('.panel-content');

        const inventoryPanel = this.createPanel('skill-inventory-panel', '스킬 카드 인벤토리');
        mainLayout.appendChild(inventoryPanel);
        this.skillInventoryContent = inventoryPanel.querySelector('.panel-content');

        this.skillInventoryContent.ondragover = e => e.preventDefault();
        this.skillInventoryContent.ondrop = e => this.onDropOnInventory(e);

        this.populateMercenaryList();
        this.refreshSkillInventory();

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
        panel.appendChild(Object.assign(document.createElement('div'), { className: 'panel-title', innerText: title }));
        panel.appendChild(Object.assign(document.createElement('div'), { className: 'panel-content' }));
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

        const selected = this.mercenaryListContent.querySelector('.selected');
        if (selected) selected.classList.remove('selected');
        const newSelected = this.mercenaryListContent.querySelector(`[data-merc-id='${mercData.uniqueId}']`);
        if (newSelected) newSelected.classList.add('selected');

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
        slotsContainer.className = 'merc-skill-slots-container';

        const equipped = ownedSkillsManager.getEquippedSkills(mercData.uniqueId);

        mercData.skillSlots.forEach((slotType, idx) => {
            const slot = this.createSkillSlotElement(slotType, idx, equipped[idx]);
            slotsContainer.appendChild(slot);
        });

        this.mercenaryDetailsContent.appendChild(slotsContainer);
    }

    createSkillSlotElement(slotType, index, instanceId) {
        const slot = document.createElement('div');
        slot.className = `merc-skill-slot ${slotType.toLowerCase()}-slot`;
        slot.dataset.slotIndex = index;
        slot.dataset.slotType = slotType;

        if (instanceId) {
            const skillId = skillInventoryManager.getSkillIdByInstance(instanceId);
            const data = skillInventoryManager.getSkillData(skillId);
            slot.style.backgroundImage = `url(${data.illustrationPath})`;
            slot.dataset.instanceId = instanceId;
            slot.draggable = true;
            slot.ondragstart = e => this.onDragStart(e, { source: 'slot', instanceId, slotIndex: index });
            slot.onmouseenter = e => SkillTooltipManager.show(skillId, e);
            slot.onmouseleave = () => SkillTooltipManager.hide();
        } else {
            slot.style.backgroundImage = 'url(assets/images/skills/skill-slot.png)';
        }

        slot.ondragover = e => e.preventDefault();
        slot.ondrop = e => this.onDropOnSlot(e);

        const rank = document.createElement('span');
        rank.innerText = `${index + 1} 순위`;
        slot.appendChild(rank);

        return slot;
    }

    refreshSkillInventory() {
        this.skillInventoryContent.innerHTML = '';
        skillInventoryManager.getInventory().forEach(instance => {
            const data = skillInventoryManager.getSkillData(instance.skillId);
            const card = document.createElement('div');
            card.className = `skill-inventory-card ${data.type.toLowerCase()}-card`;
            card.style.backgroundImage = `url(${data.illustrationPath})`;
            card.draggable = true;
            card.dataset.instanceId = instance.instanceId;
            card.ondragstart = e => this.onDragStart(e, { source: 'inventory', instanceId: instance.instanceId });
            card.onmouseenter = e => SkillTooltipManager.show(instance.skillId, e);
            card.onmouseleave = () => SkillTooltipManager.hide();

            if (data.requiredClass) {
                const tag = document.createElement('div');
                tag.className = 'skill-class-tag';
                const className = data.requiredClass === 'warrior' ? '전사' : data.requiredClass;
                tag.innerText = `[${className}]`;
                card.appendChild(tag);
            }
            this.skillInventoryContent.appendChild(card);
        });
    }

    onDragStart(event, data) {
        this.draggedData = data;
        event.dataTransfer.setData('text/plain', data.instanceId);
    }

    onDropOnSlot(event) {
        event.preventDefault();
        if (!this.selectedMercenaryData || !this.draggedData) return;

        const targetSlot = event.currentTarget;
        const targetSlotIndex = parseInt(targetSlot.dataset.slotIndex);
        const targetSlotType = targetSlot.dataset.slotType;
        const targetInstanceId = targetSlot.dataset.instanceId ? parseInt(targetSlot.dataset.instanceId) : null;

        const unitId = this.selectedMercenaryData.uniqueId;
        const draggedInstanceId = this.draggedData.instanceId;
        const draggedSkillId = skillInventoryManager.getSkillIdByInstance(draggedInstanceId);
        const draggedSkillData = skillInventoryManager.getSkillData(draggedSkillId);

        if (draggedSkillData.requiredClass && this.selectedMercenaryData.id !== draggedSkillData.requiredClass) {
            alert(`이 스킬은 ${draggedSkillData.requiredClass} 전용입니다.`);
            return;
        }
        if (draggedSkillData.type !== targetSlotType) {
            alert('스킬과 슬롯의 타입이 일치하지 않습니다.');
            return;
        }

        if (this.draggedData.source === 'inventory') {
            ownedSkillsManager.equipSkill(unitId, targetSlotIndex, draggedInstanceId);
            skillInventoryManager.removeSkillByInstanceId(draggedInstanceId);
            if (targetInstanceId) {
                ownedSkillsManager.equipSkill(unitId, targetSlotIndex, draggedInstanceId);
                this.addSkillToInventory(targetInstanceId);
            }
        } else if (this.draggedData.source === 'slot') {
            const sourceSlotIndex = this.draggedData.slotIndex;
            ownedSkillsManager.equipSkill(unitId, targetSlotIndex, draggedInstanceId);
            ownedSkillsManager.equipSkill(unitId, sourceSlotIndex, targetInstanceId);
        }

        this.refreshAll();
    }

    onDropOnInventory(event) {
        event.preventDefault();
        if (!this.selectedMercenaryData || !this.draggedData || this.draggedData.source !== 'slot') return;

        const unitId = this.selectedMercenaryData.uniqueId;
        const sourceSlotIndex = this.draggedData.slotIndex;
        const instanceId = this.draggedData.instanceId;

        ownedSkillsManager.unequipSkill(unitId, sourceSlotIndex);
        this.addSkillToInventory(instanceId);

        this.refreshAll();
    }

    addSkillToInventory(instanceId) {
        const skillId = skillInventoryManager.getSkillIdByInstance(instanceId);
        if (skillId) {
            skillInventoryManager.skillInventory.push({ instanceId, skillId });
            skillInventoryManager.skillInventory.sort((a, b) => a.instanceId - b.instanceId);
        }
    }

    refreshAll() {
        this.refreshMercenaryDetails();
        this.refreshSkillInventory();
        this.draggedData = null;
    }

    destroy() {
        this.container.innerHTML = '';
        this.container.style.display = 'none';
    }
}
