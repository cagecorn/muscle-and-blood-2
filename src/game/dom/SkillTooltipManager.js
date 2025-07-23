import { SKILL_TYPES } from '../utils/SkillEngine.js';
import { skillCardDatabase } from '../data/skills/SkillCardDatabase.js';

/**
 * 스킬 카드 위에 마우스를 올렸을 때 TCG 스타일의 큰 툴팁을 표시하는 매니저
 */
export class SkillTooltipManager {
    static show(skillId, event) {
        this.hide(); // 기존 툴팁이 있다면 제거

        const skillData = skillCardDatabase[skillId];
        if (!skillData) return;

        const tooltip = document.createElement('div');
        tooltip.id = 'skill-tooltip';
        tooltip.className = `skill-card-large ${skillData.type.toLowerCase()}-card`;
        
        tooltip.innerHTML = `
            <div class="skill-illustration-large" style="background-image: url(${skillData.illustrationPath})"></div>
            <div class="skill-info-large">
                <div class="skill-name-large">${skillData.name}</div>
                <div class="skill-type-cost-large">
                    <span style="color: ${SKILL_TYPES[skillData.type].color};">[${SKILL_TYPES[skillData.type].name}]</span>
                </div>
                <div class="skill-description-large">${skillData.description}</div>
                <div class="skill-cost-container-large"></div>
            </div>
        `;

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
