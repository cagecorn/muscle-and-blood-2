import { statEngine } from '../utils/StatEngine.js';
import { SKILL_TYPES } from '../utils/SkillEngine.js';
// ✨ [추가] 스킬 관리 매니저들을 import
import { ownedSkillsManager } from '../utils/OwnedSkillsManager.js';
import { skillInventoryManager } from '../utils/SkillInventoryManager.js';

/**
 * 용병 상세 정보 창의 DOM을 생성하고 관리하는 유틸리티 클래스
 */
export class UnitDetailDOM {
    static create(unitData) {
        const finalStats = statEngine.calculateStats(unitData, unitData.baseStats, []);

        const overlay = document.createElement('div');
        overlay.id = 'unit-detail-overlay';
        overlay.onclick = (e) => {
            if (e.target.id === 'unit-detail-overlay') {
                overlay.remove();
            }
        };

        const detailPane = document.createElement('div');
        detailPane.id = 'unit-detail-pane';
        
        const instanceName = unitData.instanceName || unitData.name;
        let headerHTML = `
            <div class="detail-header">
                <span class="unit-name">${instanceName}</span>
                <span class="unit-class">${unitData.name}</span>
                <span class="unit-level">Lv. ${unitData.level}</span>
            </div>
            <div id="unit-detail-close" onclick="this.closest('#unit-detail-overlay').remove()">X</div>
        `;
        detailPane.innerHTML = headerHTML;
        
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
        
        let skillsHTML = `
            <div class="equipment-grid"> ... </div>
            <div class="unit-skills">
                <div class="section-title">스킬 슬롯</div>
                <div class="skill-grid">`;

        // ✨ [핵심 수정] 장착된 스킬 정보를 가져옵니다.
        const equippedSkills = ownedSkillsManager.getEquippedSkills(unitData.uniqueId);

        if (unitData.skillSlots && unitData.skillSlots.length > 0) {
            unitData.skillSlots.forEach((slotType, index) => {
                const typeClass = `${slotType.toLowerCase()}-slot`;
                const equippedSkillId = equippedSkills[index];
                let bgImage = 'url(assets/images/skills/skill-slot.png)';
                if (equippedSkillId) {
                    const skillData = skillInventoryManager.getSkillData(equippedSkillId);
                    if (skillData) bgImage = `url(${skillData.illustrationPath})`;
                }
                skillsHTML += `
                    <div class="skill-slot ${typeClass}" style="background-image: ${bgImage};">
                        <span class="slot-rank">${index + 1} 순위</span>
                    </div>`;
            });
        } else {
            for(let i = 0; i < 3; i++) {
                skillsHTML += `<div class="skill-slot" style="background-image: url(assets/images/skills/skill-slot.png);"><span class="slot-rank">${i + 1} 순위</span></div>`;
            }
        }
        
        skillsHTML += `</div></div>`;
        rightSection.innerHTML = skillsHTML;

        detailContent.appendChild(leftSection);
        detailContent.appendChild(rightSection);
        detailPane.appendChild(detailContent);
        overlay.appendChild(detailPane);

        return overlay;
    }
}
