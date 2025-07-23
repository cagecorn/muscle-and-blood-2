import { mercenaryEngine } from '../utils/MercenaryEngine.js';
import { partyEngine } from '../utils/PartyEngine.js';
import { SKILL_TYPES } from '../utils/SkillEngine.js';

export class SkillManagementDOMEngine {
    constructor(scene) {
        this.scene = scene;
        this.container = document.getElementById('skill-management-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'skill-management-container';
            document.getElementById('app').appendChild(this.container);
        }

        // 선택된 용병의 ID를 추적
        this.selectedMercenaryId = null;

        this.createView();
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
        this.createSkillInventoryGrid();

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
        this.selectedMercenaryId = mercData.uniqueId;
        this.mercenaryDetailsContent.innerHTML = ''; // 기존 내용 초기화

        const slotsContainer = document.createElement('div');
        slotsContainer.className = 'merc-skill-slots-container';

        mercData.skillSlots.forEach(slotType => {
            const slot = document.createElement('div');
            slot.className = 'merc-skill-slot';
            // skill-slot.png를 배경으로 사용하고, 테두리 색상 클래스 추가
            slot.style.backgroundImage = 'url(assets/images/skills/skill-slot.png)';
            slot.classList.add(`${slotType.toLowerCase()}-slot`);

            const typeName = document.createElement('span');
            typeName.innerText = `[${SKILL_TYPES[slotType].name}]`;
            slot.appendChild(typeName);

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

    destroy() {
        this.container.innerHTML = '';
        this.container.style.display = 'none';
    }
}
