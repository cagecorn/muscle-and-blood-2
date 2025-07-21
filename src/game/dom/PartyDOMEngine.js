import { mercenaryEngine } from '../utils/MercenaryEngine.js';
import { statEngine } from '../utils/StatEngine.js';

/**
 * 파티 관리 화면의 DOM 요소를 생성하고 관리하는 엔진
 */
export class PartyDOMEngine {
    constructor(scene, domEngine) {
        this.scene = scene;
        this.domEngine = domEngine;
        this.container = document.getElementById('party-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'party-container';
            document.getElementById('app').appendChild(this.container);
        }
        this.activeGrid = null;
        this.reserveGrid = null;
        this.unitDetailView = null;

        this.container.style.display = 'block';

        this.createGrid();
        this.addBackButton();
    }

    createGrid() {
        const wrapper = document.createElement('div');
        wrapper.id = 'party-grid';
        this.container.appendChild(wrapper);

        this.activeGrid = document.createElement('div');
        this.activeGrid.id = 'party-active-grid';
        wrapper.appendChild(this.activeGrid);

        this.reserveGrid = document.createElement('div');
        this.reserveGrid.id = 'party-reserve-grid';
        wrapper.appendChild(this.reserveGrid);

        this.reserveGrid.addEventListener('dragover', (e) => e.preventDefault());
        this.reserveGrid.addEventListener('drop', (e) => {
            const unitId = parseInt(e.dataTransfer.getData('text/plain'));
            partyEngine.removePartyMember(unitId);
            this.refresh();
        });

        this.refresh();
    }

    renderPartyMembers() {
        const partyMembers = mercenaryEngine.getPartyMembers();
        const allMercenaries = mercenaryEngine.getAllAlliedMercenaries();

        this.activeGrid.innerHTML = '';
        for (let i = 0; i < 12; i++) {
            const slot = document.createElement('div');
            slot.className = 'party-slot';
            slot.dataset.index = i;
            slot.addEventListener('dragover', (e) => e.preventDefault());
            slot.addEventListener('drop', (e) => {
                const unitId = parseInt(e.dataTransfer.getData('text/plain'));
                partyEngine.setPartyMember(i, unitId);
                this.refresh();
            });

            const img = document.createElement('div');
            img.className = 'party-slot-image';

            const unitId = partyMembers[i];
            let unitData = null;
            if (unitId) {
                unitData = allMercenaries.find(m => m.uniqueId === unitId);
                if (unitData) {
                    img.style.backgroundImage = `url(${unitData.uiImage})`;
                    img.addEventListener('click', () => this.showUnitDetails(unitData));
                    img.draggable = true;
                    img.addEventListener('dragstart', (e) => {
                        e.dataTransfer.setData('text/plain', unitData.uniqueId);
                    });
                }
            }

            const label = document.createElement('div');
            label.className = 'slot-name';
            label.innerText = unitData ? (unitData.instanceName || unitData.name) : '';

            slot.appendChild(img);
            slot.appendChild(label);
            this.activeGrid.appendChild(slot);
        }
    }

    renderReserveMembers() {
        const partyMembers = mercenaryEngine.getPartyMembers();
        const allMercenaries = mercenaryEngine.getAllAlliedMercenaries();
        const reserveUnits = allMercenaries.filter(m => !partyMembers.includes(m.uniqueId));

        this.reserveGrid.innerHTML = '';
        reserveUnits.forEach(unitData => {
            const unitDiv = document.createElement('div');
            unitDiv.className = 'reserve-unit';
            unitDiv.draggable = true;
            unitDiv.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', unitData.uniqueId);
            });

            const img = document.createElement('div');
            img.className = 'reserve-image';
            img.style.backgroundImage = `url(${unitData.uiImage})`;
            img.addEventListener('click', () => this.showUnitDetails(unitData));

            const label = document.createElement('div');
            label.className = 'slot-name';
            label.innerText = unitData.instanceName || unitData.name;

            unitDiv.appendChild(img);
            unitDiv.appendChild(label);
            this.reserveGrid.appendChild(unitDiv);
        });
    }

    refresh() {
        this.renderPartyMembers();
        this.renderReserveMembers();
    }

    addBackButton() {
        const backButton = document.createElement('div');
        backButton.id = 'party-back-button';
        backButton.innerText = '←';
        backButton.addEventListener('click', () => {
            this.hide();
            this.scene.scene.start('TerritoryScene');
        });
        this.container.appendChild(backButton);
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

    hide() {
        this.container.style.display = 'none';
    }

    destroy() {
        if (this.unitDetailView) this.unitDetailView.remove();
        this.container.innerHTML = '';
        this.hide();
    }
}
