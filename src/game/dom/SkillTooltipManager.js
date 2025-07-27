import { SKILL_TYPES } from '../utils/SkillEngine.js';
import { placeholderManager } from '../utils/PlaceholderManager.js';

/**
 * 스킬 카드 위에 마우스를 올렸을 때 TCG 스타일의 큰 툴팁을 표시하는 매니저
 */
export class SkillTooltipManager {
    static show(skillData, event, grade = 'NORMAL') {
        this.hide();

        if (!skillData) return;

        const tooltip = document.createElement('div');
        tooltip.id = 'skill-tooltip';
        tooltip.className = `skill-card-large ${skillData.type.toLowerCase()}-card grade-${grade.toLowerCase()}`;
        
        // ✨ skillModifierEngine에서 이미 수정한 설명을 그대로 사용합니다.
        let description = skillData.description;

        // 스킬 이름 옆에 클래스 전용 여부를 표시
        let skillNameHTML = skillData.name;
        if (skillData.requiredClass) {
            const className = skillData.requiredClass === 'warrior' ? '전사' : skillData.requiredClass;
            skillNameHTML += ` <span style="font-size: 14px; color: #ffc107;">[${className} 전용]</span>`;
        }

        tooltip.innerHTML = `
            <div class="skill-illustration-large" style="background-image: url(${skillData.illustrationPath})"></div>
            <div class="skill-illustration-large"></div>
            <div class="skill-info-large">
                <div class="skill-name-large">${skillNameHTML}</div>
                <div class="skill-type-cost-large">
                    <span style="color: ${SKILL_TYPES[skillData.type].color};">[${SKILL_TYPES[skillData.type].name}]</span>
                    <span>쿨타임 ${skillData.cooldown || 0}</span>
                </div>
                <div class="skill-description-large">${description}</div>
                <div class="skill-cost-container-large"></div>
            </div>
        `;

        const illust = tooltip.querySelector('.skill-illustration-large');
        placeholderManager.setBackgroundImage(illust, skillData.illustrationPath);

        // 별 생성 로직 추가
        const gradeMap = { 'NORMAL': 1, 'RARE': 2, 'EPIC': 3, 'LEGENDARY': 4 };
        const starsContainer = document.createElement('div');
        starsContainer.className = 'grade-stars-large';
        const starCount = gradeMap[grade] || 1;
        for (let i = 0; i < starCount; i++) {
            const starImg = document.createElement('img');
            starImg.src = 'assets/images/territory/skill-card-star.png';
            starsContainer.appendChild(starImg);
        }
        tooltip.appendChild(starsContainer);

        // 토큰 아이콘 추가
        const costContainer = tooltip.querySelector('.skill-cost-container-large');
        for (let i = 0; i < skillData.cost; i++) {
            const tokenIcon = document.createElement('img');
            tokenIcon.src = 'assets/images/battle/token.png';
            tokenIcon.className = 'token-icon-large';
            costContainer.appendChild(tokenIcon);
        }

        document.body.appendChild(tooltip);

        // 마우스 커서 옆에 위치하도록 좌표 설정
        tooltip.style.left = `${event.pageX + 15}px`;
        tooltip.style.top = `${event.pageY + 15}px`;
    }

    static hide() {
        const existingTooltip = document.getElementById('skill-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
    }
}
