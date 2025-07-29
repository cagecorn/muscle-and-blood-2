import { statEngine } from '../utils/StatEngine.js';
import { SKILL_TYPES } from '../utils/SkillEngine.js';
import { ownedSkillsManager } from '../utils/OwnedSkillsManager.js';
import { skillInventoryManager } from '../utils/SkillInventoryManager.js';
import { SkillTooltipManager } from './SkillTooltipManager.js';
import { skillModifierEngine } from '../utils/SkillModifierEngine.js';
// ✨ 등급 데이터를 가져오기 위해 classGrades를 import합니다.
import { classGrades } from '../data/classGrades.js';

/**
 * 용병 상세 정보 창의 DOM을 생성하고 관리하는 유틸리티 클래스
 */
export class UnitDetailDOM {
    static create(unitData) {
        const finalStats = statEngine.calculateStats(unitData, unitData.baseStats, []);
        // ✨ 해당 유닛의 등급 데이터를 가져옵니다.
        const grades = classGrades[unitData.id] || {};

        const overlay = document.createElement('div');
        // ✨ [수정] ID 대신 클래스를 사용합니다.
        overlay.className = 'modal-overlay';
        overlay.onclick = (e) => {
            // ✨ [수정] fade-out 애니메이션을 위해 클래스를 제거하는 방식으로 변경합니다.
            if (e.target === overlay) {
                overlay.classList.remove('visible');
                // 애니메이션이 끝난 후 DOM에서 완전히 제거합니다.
                overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
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
            <div id="unit-detail-close">X</div>
        `;
        detailPane.innerHTML = headerHTML;

        const detailContent = document.createElement('div');
        detailContent.className = 'detail-content';

        const leftSection = document.createElement('div');
        leftSection.className = 'detail-section left';

        // ✨ --- 등급 표시 로직 추가 ---
        const gradeDisplayHTML = `
            <div class="unit-grades-container">
                <div class="unit-grades left">
                    <div class="grade-item" data-tooltip="근접 공격 등급: 이 유닛이 근접 공격 시 얼마나 우위를 갖는지 나타냅니다. 높을수록 강력합니다.">⚔️ ${grades.meleeAttack || 1}</div>
                    <div class="grade-item" data-tooltip="원거리 공격 등급: 원거리 공격 시 유불리를 나타냅니다. 원거리 딜러에게 중요합니다.">🏹 ${grades.rangedAttack || 1}</div>
                    <div class="grade-item" data-tooltip="마법 공격 등급: 마법 공격 시 효율을 나타냅니다. 마법사 클래스의 핵심 능력치입니다.">🔮 ${grades.magicAttack || 1}</div>
                </div>
                <div class="unit-portrait" style="background-image: url(${unitData.uiImage})"></div>
                <div class="unit-grades right">
                    <div class="grade-item" data-tooltip="근접 방어 등급: 근접 공격을 받았을 때 얼마나 잘 버티는지 나타냅니다. 탱커에게 필수적입니다.">🛡️ ${grades.meleeDefense || 1}</div>
                    <div class="grade-item" data-tooltip="원거리 방어 등급: 화살이나 총탄 등 원거리 공격에 대한 저항력입니다.">🎯 ${grades.rangedDefense || 1}</div>
                    <div class="grade-item" data-tooltip="마법 방어 등급: 마법 공격에 대한 저항력입니다. 적 마법사를 상대할 때 중요합니다.">✨ ${grades.magicDefense || 1}</div>
                </div>
            </div>
        `;

        leftSection.innerHTML = `
            ${gradeDisplayHTML}
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
        `;

        const rightSection = document.createElement('div');
        rightSection.className = 'detail-section right';
        
        // --- 스킬 컨테이너 구조 변경 ---
        const skillsContainer = document.createElement('div');
        skillsContainer.className = 'unit-skills-container';

        const mainSkillsSection = document.createElement('div');
        mainSkillsSection.className = 'unit-skills';
        mainSkillsSection.innerHTML = `<div class="section-title">주스킬</div>`;
        const mainSkillGrid = document.createElement('div');
        mainSkillGrid.className = 'skill-grid';
        mainSkillsSection.appendChild(mainSkillGrid);

        const specialSkillsSection = document.createElement('div');
        specialSkillsSection.className = 'unit-skills';
        specialSkillsSection.innerHTML = `<div class="section-title">특수스킬</div>`;
        const specialSkillGrid = document.createElement('div');
        specialSkillGrid.className = 'skill-grid';
        specialSkillsSection.appendChild(specialSkillGrid);

        skillsContainer.appendChild(mainSkillsSection);
        skillsContainer.appendChild(specialSkillsSection);

        const equippedSkills = ownedSkillsManager.getEquippedSkills(unitData.uniqueId);
        const gradeMap = { NORMAL: 1, RARE: 2, EPIC: 3, LEGENDARY: 4 };

        if (unitData.skillSlots && unitData.skillSlots.length > 0) {
            unitData.skillSlots.forEach((slotType, index) => {
                const typeClass = slotType ? `${slotType.toLowerCase()}-slot` : 'empty-slot';
                const instanceId = equippedSkills[index];

                const slot = document.createElement('div');
                slot.className = `skill-slot ${typeClass}`;

                let bgImage = 'url(assets/images/skills/skill-slot.png)';
                if (instanceId) {
                    const instData = skillInventoryManager.getInstanceData(instanceId);
                    const baseSkillData = skillInventoryManager.getSkillData(instData.skillId, instData.grade);
                    if (baseSkillData) {
                        const modifiedSkill = skillModifierEngine.getModifiedSkill(baseSkillData, index + 1, instData.grade);
                        bgImage = `url(${modifiedSkill.illustrationPath})`;
                        slot.onmouseenter = (e) => SkillTooltipManager.show(modifiedSkill, e, instData.grade);
                        slot.onmouseleave = () => SkillTooltipManager.hide();

                        // 등급 표시를 위한 클래스와 별 이미지 추가
                        slot.classList.add(`grade-${instData.grade.toLowerCase()}`);
                        const starsContainer = document.createElement('div');
                        starsContainer.className = 'grade-stars';
                        const starCount = gradeMap[instData.grade] || 1;
                        for (let i = 0; i < starCount; i++) {
                            const starImg = document.createElement('img');
                            starImg.src = 'assets/images/territory/skill-card-star.png';
                            starsContainer.appendChild(starImg);
                        }
                        slot.appendChild(starsContainer);
                    }
                }
                slot.style.backgroundImage = bgImage;

                slot.innerHTML += `<span class="slot-rank">${index + 1} 순위</span>`;
                if (index < 4) {
                    mainSkillGrid.appendChild(slot);
                } else {
                    specialSkillGrid.appendChild(slot);
                }
            });
        }

        rightSection.appendChild(skillsContainer);

        detailContent.appendChild(leftSection);
        detailContent.appendChild(rightSection);
        detailPane.appendChild(detailContent);
        overlay.appendChild(detailPane);

        // ✨ [추가] 닫기 버튼에 이벤트 리스너를 추가합니다.
        const closeButton = detailPane.querySelector('#unit-detail-close');
        closeButton.onclick = () => {
            overlay.classList.remove('visible');
            overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
        };

        return overlay;
    }
}
