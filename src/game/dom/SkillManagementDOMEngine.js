import { mercenaryEngine } from '../utils/MercenaryEngine.js';
import { partyEngine } from '../utils/PartyEngine.js';
import { SKILL_TYPES } from '../utils/SkillEngine.js';
import { SkillCardManager } from './SkillCardManager.js';
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

        // ✨ 선택된 용병의 전체 데이터를 저장
        this.selectedMercenaryData = null;

        this.createView();
        this.populateSkillInventory();
    }

    createView() {
        this.container.style.display = 'block';
        this.container.style.backgroundImage = 'url(assets/images/territory/skills-scene.png)';

        // 메인 레이아웃 생성
        const mainLayout = document.createElement('div');
        mainLayout.id = 'skill-main-layout';
        this.container.appendChild(mainLayout);
        
        // 1. 용병 리스트 패널
        const listPanel = this.createPanel('skill-list-panel', '출정 용병');
        mainLayout.appendChild(listPanel);
        this.mercenaryListContent = listPanel.querySelector('.panel-content');

        // 2. 용병 상세 정보 패널
        const detailsPanel = this.createPanel('skill-details-panel', '용병 스킬 슬롯');
        mainLayout.appendChild(detailsPanel);
        this.mercenaryDetailsContent = detailsPanel.querySelector('.panel-content');

        // 3. 스킬 인벤토리 패널
        const inventoryPanel = this.createPanel('skill-inventory-panel', '스킬 카드 인벤토리');
        mainLayout.appendChild(inventoryPanel);
        this.skillInventoryContent = inventoryPanel.querySelector('.panel-content');

        this.populateMercenaryList();

        // 뒤로가기 버튼 추가
        const backButton = document.createElement('div');
        backButton.id = 'skill-back-button';
        backButton.innerText = '← 영지로';
        backButton.onclick = () => {
            this.scene.scene.start('TerritoryScene');
        };
        this.container.appendChild(backButton);
    }

    createPanel(id, title) {
        const panel = document.createElement('div');
        panel.id = id;
        panel.className = 'skill-panel';

        const titleBar = document.createElement('div');
        titleBar.className = 'panel-title';
        titleBar.innerText = title;
        panel.appendChild(titleBar);

        const content = document.createElement('div');
        content.className = 'panel-content';
        panel.appendChild(content);

        return panel;
    }

    populateMercenaryList() {
        this.mercenaryListContent.innerHTML = '';
        const partyMembers = partyEngine.getPartyMembers().filter(id => id !== undefined);
        const allMercs = mercenaryEngine.getAllAlliedMercenaries();

        partyMembers.forEach(id => {
            const merc = allMercs.find(m => m.uniqueId === id);
            if (merc) {
                const mercItem = document.createElement('div');
                mercItem.className = 'merc-list-item';
                mercItem.innerText = merc.instanceName;
                mercItem.onclick = () => this.selectMercenary(merc);
                this.mercenaryListContent.appendChild(mercItem);
            }
        });
    }

    selectMercenary(mercData) {
        // ✨ 선택된 용병 정보 저장
        this.selectedMercenaryData = mercData;
        this.mercenaryDetailsContent.innerHTML = '';

        // --- ✨ 용병 초상화 ---
        const portrait = document.createElement('div');
        portrait.className = 'merc-portrait-small';
        portrait.style.backgroundImage = `url(${mercData.uiImage})`;
        portrait.onclick = () => {
            const detailView = UnitDetailDOM.create(mercData);
            document.body.appendChild(detailView);
        };
        this.mercenaryDetailsContent.appendChild(portrait);

        const slotsContainer = document.createElement('div');
        slotsContainer.className = 'merc-skill-slots-container';
        
        const equippedSkills = ownedSkillsManager.getEquippedSkills(mercData.uniqueId);

        mercData.skillSlots.forEach((slotType, index) => {
            const slot = document.createElement('div');
            slot.className = 'merc-skill-slot';
            slot.classList.add(`${slotType.toLowerCase()}-slot`);
            slot.dataset.slotIndex = index;
            slot.dataset.slotType = slotType;

            const equippedSkillId = equippedSkills[index];
            if (equippedSkillId) {
                const skillData = skillInventoryManager.getSkillData(equippedSkillId);
                slot.style.backgroundImage = `url(${skillData.illustrationPath})`;
                slot.dataset.equippedSkillId = equippedSkillId;
                 // 마우스 이벤트 리스너 추가
                slot.onmouseenter = (e) => SkillTooltipManager.show(equippedSkillId, e);
                slot.onmouseleave = () => SkillTooltipManager.hide();
            } else {
                slot.style.backgroundImage = 'url(assets/images/skills/skill-slot.png)';
            }

            // 드래그 앤 드롭 이벤트 리스너
            slot.ondragover = (e) => e.preventDefault();
            slot.ondrop = (e) => this.onDropOnSlot(e);

            const rank = document.createElement('span');
            rank.className = 'slot-rank';
            rank.innerText = `${index + 1} \uC21C\uC704`;
            slot.appendChild(rank);

            slotsContainer.appendChild(slot);
        });
        
        this.mercenaryDetailsContent.appendChild(slotsContainer);
    }

    createSkillInventoryGrid() {
        this.skillInventoryContent.innerHTML = '';
        for (let i = 0; i < 40; i++) { // 5x8 그리드
            const cell = document.createElement('div');
            cell.className = 'skill-inventory-cell';
            this.skillInventoryContent.appendChild(cell);
        }
    }

    populateSkillInventory() {
        this.skillInventoryContent.innerHTML = '';
        const inventory = skillInventoryManager.getInventory();
        inventory.forEach(skill => {
            const cardElement = document.createElement('div');
            cardElement.className = 'skill-inventory-card';
            cardElement.style.backgroundImage = `url(${skill.illustrationPath})`;
            cardElement.draggable = true;
            cardElement.dataset.skillId = skill.id;
            
            // 이벤트 리스너 추가
            cardElement.ondragstart = (e) => e.dataTransfer.setData('skillId', skill.id);
            cardElement.onmouseenter = (e) => SkillTooltipManager.show(skill.id, e);
            cardElement.onmouseleave = () => SkillTooltipManager.hide();

            // ✨ 클래스 전용 태그 추가
            if (skill.requiredClass) {
                const tag = document.createElement('div');
                tag.className = 'skill-class-tag';
                const className = skill.requiredClass === 'warrior' ? '전사' : skill.requiredClass;
                tag.textContent = `[${className}]`;
                cardElement.appendChild(tag);
            }

            this.skillInventoryContent.appendChild(cardElement);
        });
    }

    onDropOnSlot(event) {
        event.preventDefault();
        const skillId = event.dataTransfer.getData('skillId');
        const skillData = skillInventoryManager.getSkillData(skillId);
        const slot = event.currentTarget;
        const slotType = slot.dataset.slotType;

        if (!this.selectedMercenaryData) {
            console.warn("스킬을 장착할 용병을 먼저 선택해주세요.");
            return;
        }

        // ✨ 클래스 요구사항 확인
        if (skillData.requiredClass && this.selectedMercenaryData.id !== skillData.requiredClass) {
            alert(`[${skillData.name}] 스킬은 [${skillData.requiredClass}] 클래스 전용입니다.`);
            return;
        }

        // 스킬 타입이 슬롯 타입과 맞는지 확인
        if (skillData && skillData.type === slotType) {
            const unitId = this.selectedMercenaryData.uniqueId;
            const slotIndex = parseInt(slot.dataset.slotIndex);
            
            // 스킬 장착 및 UI 업데이트
            ownedSkillsManager.equipSkill(unitId, slotIndex, skillId);
            slot.style.backgroundImage = `url(${skillData.illustrationPath})`;
            slot.dataset.equippedSkillId = skillId; // 새로 장착된 스킬 ID 저장

            // 툴팁 이벤트 재설정
            slot.onmouseenter = (e) => SkillTooltipManager.show(skillId, e);
            slot.onmouseleave = () => SkillTooltipManager.hide();
        } else {
            console.warn("스킬과 슬롯의 타입이 일치하지 않습니다.");
        }
    }

    destroy() {
        this.container.innerHTML = '';
        this.container.style.display = 'none';
    }
}
