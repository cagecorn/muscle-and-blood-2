import { debugLogEngine } from '../utils/DebugLogEngine.js';
import { SKILL_TYPES } from '../utils/SkillEngine.js';

class DebugSkillManager {
    constructor() {
        this.name = 'DebugSkill';
        debugLogEngine.register(this);
    }

    /**
     * 용병에게 부여된 스킬 슬롯 정보를 로그 그룹으로 출력합니다.
     */
    logSkillSlots(skillSlots = []) {
        console.groupCollapsed(`%c[${this.name}]`, `color: #9333ea; font-weight: bold;`, '생성된 스킬 슬롯 정보');
        
        const styledSlots = skillSlots.map(slotKey => {
            const skillInfo = SKILL_TYPES[slotKey];
            return `%c${skillInfo.name}`;
        }).join(' - ');

        const styles = skillSlots.map(slotKey => `color: ${SKILL_TYPES[slotKey].color}; font-weight: bold;`);
        
        console.log(styledSlots, ...styles);
        console.groupEnd();
    }
}

export const debugSkillManager = new DebugSkillManager();
