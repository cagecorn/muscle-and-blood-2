import { surveyEngine } from '../utils/SurveyEngine.js';
import { DOMEngine } from '../utils/DOMEngine.js';
import { mercenaryEngine } from '../utils/MercenaryEngine.js';
import { statEngine } from "../utils/StatEngine.js";
import { mercenaryData } from '../data/mercenaries.js';

/**
 * 영지 화면의 DOM 요소를 생성하고 관리하는 전용 엔진
 */
export class TerritoryDOMEngine {
    constructor(scene, domEngine) {
        this.scene = scene;
        this.domEngine = domEngine;
        this.container = document.getElementById('territory-container');
        this.grid = null;
        this.tavernView = null;
        this.hireModal = null;
        this.unitDetailView = null;

        this.mercenaries = mercenaryData;
        this.mercenaryList = Object.values(this.mercenaries);
        this.currentMercenaryIndex = 0;

        this.createGrid();
        this.addBuilding(0, 0, 'tavern-icon', '[여관]');
        // --- 용병 관리 버튼 추가 ---
        this.addPartyManagementButton(1, 0);
        // --- 출정 버튼 추가 ---
        this.addExpeditionButton(2, 0);
        // --- 진형 관리 버튼 추가 ---
        this.addFormationButton(0, 1);
    }

    createGrid() {
        this.grid = document.createElement('div');
        this.grid.id = 'territory-grid';

        const gridConfig = surveyEngine.territoryGrid;
        this.grid.style.gridTemplateColumns = `repeat(${gridConfig.cols}, 1fr)`;
        this.grid.style.gridTemplateRows = `repeat(${gridConfig.rows}, 1fr)`;

        this.container.appendChild(this.grid);
    }

    addBuilding(col, row, iconId, tooltipText) {
        const icon = document.createElement('div');
        icon.className = 'building-icon';
        icon.style.backgroundImage = `url(assets/images/territory/${iconId}.png)`;

        icon.style.gridColumnStart = col + 1;
        icon.style.gridRowStart = row + 1;

        icon.addEventListener('mouseover', (event) => {
            this.domEngine.showTooltip(event.clientX, event.clientY, tooltipText);
        });

        icon.addEventListener('mouseout', () => {
            this.domEngine.hideTooltip();
        });

        icon.addEventListener('click', () => {
            if (iconId === 'tavern-icon') {
                this.showTavernView();
            }
        });

        this.grid.appendChild(icon);
    }

    // --- 새로운 버튼 추가 메소드 ---
    addPartyManagementButton(col, row) {
        const button = document.createElement('div');
        button.className = 'building-icon';
        button.style.backgroundImage = `url(assets/images/territory/party-icon.png)`;
        button.style.gridColumnStart = col + 1;
        button.style.gridRowStart = row + 1;
        button.addEventListener('mouseover', (event) => this.domEngine.showTooltip(event.clientX, event.clientY, '[용병 관리]'));
        button.addEventListener('mouseout', () => this.domEngine.hideTooltip());
        button.addEventListener('click', () => {
            console.log('용병 관리 버튼 클릭');

            // DOM을 파괴하는 대신 영지 컨테이너를 일시적으로 숨깁니다.
            this.container.style.display = 'none';

            this.scene.scene.start('PartyScene');
        });
        this.grid.appendChild(button);
    }

    addExpeditionButton(col, row) {
        const button = document.createElement('div');
        button.className = 'building-icon';
        button.style.backgroundImage = `url(assets/images/territory/dungeon-icon.png)`;
        button.style.gridColumnStart = col + 1;
        button.style.gridRowStart = row + 1;
        button.addEventListener('mouseover', (event) => this.domEngine.showTooltip(event.clientX, event.clientY, '[출정]'));
        button.addEventListener('mouseout', () => this.domEngine.hideTooltip());
        button.addEventListener('click', () => {
            this.container.style.display = 'none';
            this.scene.scene.start('DungeonScene');
        });
        this.grid.appendChild(button);
    }

    addFormationButton(col, row) {
        const button = document.createElement('div');
        button.className = 'building-icon';
        button.style.backgroundImage = `url(assets/images/territory/formation-icon.png)`;
        button.style.gridColumnStart = col + 1;
        button.style.gridRowStart = row + 1;
        button.addEventListener('mouseover', (event) => this.domEngine.showTooltip(event.clientX, event.clientY, '[진형]'));
        button.addEventListener('mouseout', () => this.domEngine.hideTooltip());
        button.addEventListener('click', () => {
            this.container.style.display = 'none';
            this.scene.scene.start('FormationScene');
        });
        this.grid.appendChild(button);
    }

    showTavernView() {
        this.grid.style.display = 'none';

        this.container.style.backgroundImage = `url(assets/images/territory/tavern-scene.png)`;

        this.tavernView = document.createElement('div');
        this.tavernView.id = 'tavern-view';
        this.container.appendChild(this.tavernView);

        const backButton = document.createElement('div');
        backButton.id = 'tavern-back-button';
        backButton.innerText = '←';
        backButton.addEventListener('click', () => {
            this.hideTavernView();
        });
        this.tavernView.appendChild(backButton);

        const tavernGrid = document.createElement('div');
        tavernGrid.id = 'tavern-grid';
        this.tavernView.appendChild(tavernGrid);

        const hireButton = document.createElement('div');
        hireButton.className = 'tavern-button';
        hireButton.style.backgroundImage = `url(assets/images/territory/hire-icon.png)`;
        hireButton.addEventListener('click', () => {
            this.showHireModal();
        });
        hireButton.addEventListener('mouseover', (event) => {
            this.domEngine.showTooltip(event.clientX, event.clientY, '[용병 고용]');
        });
        hireButton.addEventListener('mouseout', () => {
            this.domEngine.hideTooltip();
        });

        tavernGrid.appendChild(hireButton);
    }

    showHireModal() {
        if (this.hireModal) return;

        this.hireModal = document.createElement('div');
        this.hireModal.id = 'hire-modal-overlay';
        
        const modalContent = document.createElement('div');
        modalContent.id = 'hire-modal-content';

        const imageViewer = document.createElement('div');
        imageViewer.id = 'hire-image-viewer';
        
        const mercenaryImage = document.createElement('img');
        mercenaryImage.id = 'mercenary-image';

        mercenaryImage.onclick = () => {
            const baseMercenaryData = this.mercenaryList[this.currentMercenaryIndex];
            const newInstance = mercenaryEngine.hireMercenary(baseMercenaryData, 'ally');
            
            this.hideHireModal();
            this.showUnitDetails(newInstance);
        };

        const leftArrow = document.createElement('div');
        leftArrow.className = 'hire-arrow';
        leftArrow.innerText = '<';
        leftArrow.onclick = () => this.changeMercenary(-1);

        const rightArrow = document.createElement('div');
        rightArrow.className = 'hire-arrow';
        rightArrow.innerText = '>';
        rightArrow.onclick = () => this.changeMercenary(1);

        const closeButton = document.createElement('div');
        closeButton.id = 'hire-modal-close';
        closeButton.innerText = 'X';
        closeButton.onclick = () => this.hideHireModal();
        
        const hireEnemyButton = document.createElement('div');
        hireEnemyButton.id = 'hire-enemy-button';
        hireEnemyButton.innerText = '[적군 생성]';
        hireEnemyButton.onclick = (event) => {
            const baseMercenaryData = this.mercenaryList[this.currentMercenaryIndex];
            mercenaryEngine.hireMercenary(baseMercenaryData, 'enemy');
            this.domEngine.showTooltip(event.clientX, event.clientY, `적군 ${baseMercenaryData.name} 생성됨!`);
            setTimeout(() => this.domEngine.hideTooltip(), 1000);
        };
        
        imageViewer.appendChild(leftArrow);
        imageViewer.appendChild(mercenaryImage);
        imageViewer.appendChild(rightArrow);

        modalContent.appendChild(closeButton);
        modalContent.appendChild(imageViewer);
        modalContent.appendChild(hireEnemyButton);
        this.hireModal.appendChild(modalContent);
        this.container.appendChild(this.hireModal);

        this.hireModal.addEventListener('wheel', (event) => {
            event.preventDefault();
            this.changeMercenary(event.deltaY > 0 ? 1 : -1);
        });

        this.updateMercenaryImage();
    }
    
    hideHireModal() {
        if (this.hireModal) {
            this.hireModal.remove();
            this.hireModal = null;
        }
    }

    hideTavernView() {
        if (this.tavernView) {
            this.tavernView.remove();
            this.tavernView = null;
        }
        this.container.style.backgroundImage = `url(assets/images/territory/city-1.png)`;
        this.grid.style.display = 'grid';
    }

    changeMercenary(direction) {
        this.currentMercenaryIndex += direction;

        if (this.currentMercenaryIndex >= this.mercenaryList.length) {
            this.currentMercenaryIndex = 0;
        } else if (this.currentMercenaryIndex < 0) {
            this.currentMercenaryIndex = this.mercenaryList.length - 1;
        }

        this.updateMercenaryImage();
    }

    updateMercenaryImage() {
        const mercenaryImage = document.getElementById('mercenary-image');
        if (mercenaryImage) {
            const newMercenary = this.mercenaryList[this.currentMercenaryIndex];
            mercenaryImage.src = newMercenary.hireImage;
            mercenaryImage.alt = newMercenary.name;
        }
    }

    showUnitDetails(unitData) {
        if (this.unitDetailView) this.unitDetailView.remove();

        const finalStats = statEngine.calculateStats(unitData, unitData.baseStats, []);

        this.unitDetailView = document.createElement('div');
        this.unitDetailView.id = 'unit-detail-overlay';
        this.unitDetailView.onclick = (e) => {
            if (e.target.id === 'unit-detail-overlay') {
                this.hideUnitDetails();
            }
        };

        const detailPane = document.createElement('div');
        detailPane.id = 'unit-detail-pane';

        const instanceName = unitData.instanceName || unitData.name;
        detailPane.innerHTML += `
            <div class="detail-header">
                <span class="unit-name">${instanceName}</span>
                <span class="unit-class">${unitData.name}</span>
                <span class="unit-level">Lv. ${unitData.level}</span>
            </div>
            <div id="unit-detail-close" onclick="this.closest('#unit-detail-overlay').remove()">X</div>
        `;

        const detailContent = document.createElement('div');
        detailContent.className = 'detail-content';

        const leftSection = document.createElement('div');
        leftSection.className = 'detail-section left';
        leftSection.innerHTML = `
            <div class="unit-portrait" style="background-image: url(${unitData.uiImage})"></div>
            <div class="stats-grid">
                <div class="section-title">스탯</div>
                <div class="stat-item"><span>HP</span><span>${finalStats.hp}</span></div>
                <div class="stat-item"><span>용맹</span><span>${finalStats.valor}</span></div>
                <div class="stat-item"><span>힘</span><span>${finalStats.strength}</span></div>
                <div class="stat-item"><span>인내</span><span>${finalStats.endurance}</span></div>
                <div class="stat-item"><span>민첩</span><span>${finalStats.agility}</span></div>
                <div class="stat-item"><span>지능</span><span>${finalStats.intelligence}</span></div>
                <div class="stat-item"><span>지혜</span><span>${finalStats.wisdom}</span></div>
                <div class="stat-item"><span>행운</span><span>${finalStats.luck}</span></div>
            </div>
            <div class="traits-section">
                <div class="section-title">특성 (미구현)</div>
                <div class="placeholder-box"></div>
            </div>
            <div class="synergy-section">
                <div class="section-title">시너지 (미구현)</div>
                <div class="placeholder-box"></div>
            </div>
        `;

        const rightSection = document.createElement('div');
        rightSection.className = 'detail-section right';
        rightSection.innerHTML = `
            <div class="equipment-grid">
                <div class="section-title">장비</div>
                <div class="equip-slot"></div>
                <div class="equip-slot"></div>
                <div class="equip-slot"></div>
                <div class="equip-slot"></div>
                <div class="equip-slot"></div>
            </div>
            <div class="unit-skills">
                <div class="section-title">스킬</div>
                <div class="skill-grid">
                    <div class="skill-slot"></div>
                    <div class="skill-slot"></div>
                    <div class="skill-slot"></div>
                </div>
            </div>
        `;

        detailContent.appendChild(leftSection);
        detailContent.appendChild(rightSection);
        detailPane.appendChild(detailContent);
        this.unitDetailView.appendChild(detailPane);
        this.container.appendChild(this.unitDetailView);
    }

    hideUnitDetails() {
        if (this.unitDetailView) {
            this.unitDetailView.remove();
            this.unitDetailView = null;
        }
    }

    destroy() {
        this.container.innerHTML = '';
        this.container.style.display = 'none';
    }
}
