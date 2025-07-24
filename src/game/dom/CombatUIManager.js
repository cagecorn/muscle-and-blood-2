import { statusEffectManager } from '../utils/StatusEffectManager.js';
import { tokenEngine } from '../utils/TokenEngine.js';
import { statusEffects } from '../data/status-effects.js';
import { ownedSkillsManager } from '../utils/OwnedSkillsManager.js';
import { skillInventoryManager } from '../utils/SkillInventoryManager.js';

/**
 * 전투 중 활성화된 유닛의 상세 정보를 표시하는 하단 UI 매니저
 */
export class CombatUIManager {
    constructor() {
        this.container = document.getElementById('combat-ui-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'combat-ui-container';
            // #app이나 다른 루트 컨테이너에 추가한다. 기본적으로 ui-container를 사용한다.
            document.getElementById('ui-container').appendChild(this.container);
        }
        this.container.style.display = 'none'; // 초기에는 숨김
    }

    /**
     * 특정 유닛의 정보로 UI를 표시합니다.
     * @param {object} unit - 표시할 유닛 데이터
     */
    show(unit) {
        if (!unit) {
            this.hide();
            return;
        }

        this.container.innerHTML = ''; // 이전 내용 초기화

        // 1. 왼쪽 정보 패널
        const infoPanel = document.createElement('div');
        infoPanel.className = 'combat-info-panel';

        const name = `${unit.instanceName} - Lv. ${unit.level}`;
        const hp = `체력: ${Math.max(0, unit.currentHp)} / ${unit.finalStats.hp}`;
        
        // 체력바
        const healthBarContainer = document.createElement('div');
        healthBarContainer.className = 'combat-health-bar-container';
        const healthBar = document.createElement('div');
        healthBar.className = 'combat-health-bar';
        const healthPercentage = (unit.currentHp / unit.finalStats.hp) * 100;
        healthBar.style.width = `${Math.max(0, healthPercentage)}%`;
        healthBarContainer.appendChild(healthBar);

        infoPanel.innerHTML = `
            <div class="unit-name-level">${name}</div>
            <div class="unit-stats">${hp}</div>
        `;
        infoPanel.appendChild(healthBarContainer);

        // 토큰
        const tokenContainer = document.createElement('div');
        tokenContainer.className = 'combat-token-container';
        const currentTokens = tokenEngine.getTokens(unit.uniqueId);
        for(let i = 0; i < currentTokens; i++) {
            const tokenImg = document.createElement('img');
            tokenImg.src = 'assets/images/battle/token.png';
            tokenImg.className = 'combat-token-icon';
            tokenContainer.appendChild(tokenImg);
        }
        infoPanel.appendChild(tokenContainer);

        // 효과 아이콘들을 담을 컨테이너 추가
        const effectsContainer = document.createElement('div');
        effectsContainer.className = 'unit-effects';
        infoPanel.appendChild(effectsContainer);


        // 2. 오른쪽 초상화 패널
        const portraitPanel = document.createElement('div');
        portraitPanel.className = 'combat-portrait-panel';
        if (unit.uiImage) {
            portraitPanel.style.backgroundImage = `url(${unit.uiImage})`;
        } else {
            portraitPanel.innerText = '?';
            portraitPanel.style.backgroundColor = '#333';
            portraitPanel.style.textAlign = 'center';
            portraitPanel.style.lineHeight = '100px';
            portraitPanel.style.fontSize = '40px';
        }

        this.container.appendChild(infoPanel);
        this.container.appendChild(portraitPanel);
        
        this.updateEffects(unit); // 버프/디버프 아이콘 업데이트

        this.container.style.display = 'flex';
    }

    /**
     * UI를 숨깁니다.
     */
    hide() {
        this.container.style.display = 'none';
    }

    /**
     * 유닛의 버프/디버프/패시브 효과 아이콘을 업데이트합니다.
     * @param {object} unit
     */
    updateEffects(unit) {
        const effectsContainer = this.container.querySelector('.unit-effects');
        if (!effectsContainer) return;
        effectsContainer.innerHTML = '';

        // 활성화된 효과 (버프, 디버프, 상태이상)
        const activeEffects = statusEffectManager.activeEffects.get(unit.uniqueId) || [];
        activeEffects.forEach(effect => {
            const effectDef = statusEffects[effect.id];
            if (effectDef) {
                const icon = this.createEffectIcon(
                    effectDef.iconPath, 
                    `${effectDef.name} (${effect.duration}턴 남음)`,
                    effect.duration
                );
                effectsContainer.appendChild(icon);
            }
        });
        
        // 패시브 스킬
        const equipped = ownedSkillsManager.getEquippedSkills(unit.uniqueId);
        equipped.forEach(instId => {
            if (!instId) return;
            const inst = skillInventoryManager.getInstanceData(instId);
            const skillData = skillInventoryManager.getSkillData(inst.skillId, inst.grade);
            if (skillData && skillData.type === 'PASSIVE') {
                const icon = this.createEffectIcon(skillData.illustrationPath, `${skillData.name} (패시브)`);
                effectsContainer.appendChild(icon);
            }
        });
    }

    createEffectIcon(path, tooltipText, duration = null) {
        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'effect-icon-wrapper';
        iconWrapper.title = tooltipText; 

        const icon = document.createElement('img');
        icon.className = 'effect-icon';
        icon.src = path;
        iconWrapper.appendChild(icon);

        if (duration !== null) {
            const durationText = document.createElement('span');
            durationText.className = 'effect-duration';
            durationText.innerText = duration;
            iconWrapper.appendChild(durationText);
        }
        return iconWrapper;
    }

    /**
     * UI와 관련된 모든 리소스를 정리합니다.
     */
    destroy() {
        this.hide();
        this.container.innerHTML = '';
    }
}
