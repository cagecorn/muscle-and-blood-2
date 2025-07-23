import { debugLogEngine } from './DebugLogEngine.js';
import { activeSkills } from '../data/skills/active.js';
import { buffSkills } from '../data/skills/buff.js';
import { debuffSkills } from '../data/skills/debuff.js';
import { passiveSkills } from '../data/skills/passive.js';

/**
 * 플레이어가 획득한 모든 스킬 카드의 인벤토리를 관리하는 엔진
 */
class SkillInventoryManager {
    constructor() {
        this.skillInventory = new Map();
        debugLogEngine.log('SkillInventoryManager', '스킬 인벤토리 매니저가 초기화되었습니다.');
        this.initializeSkillCards();
    }

    initializeSkillCards() {
        this.addSkillCards(activeSkills);
        this.addSkillCards(buffSkills);
        this.addSkillCards(debuffSkills);
        this.addSkillCards(passiveSkills);
    }

    addSkillCards(skillObject) {
        for (const skillId in skillObject) {
            if (skillObject.hasOwnProperty(skillId)) {
                const skillData = skillObject[skillId];
                this.skillInventory.set(
                    skillId,
                    { details: skillData, count: (this.skillInventory.get(skillId)?.count || 0) + 1 }
                );
            }
        }
        debugLogEngine.log('SkillInventoryManager', '초기 스킬 카드 로드 완료.');
    }

    getInventory() {
        return Array.from(this.skillInventory.values()).map(item => item.details);
    }

    // 향후 여기에 스킬 획득/폐기/조회 관련 메서드가 추가될 것입니다.
}

export const skillInventoryManager = new SkillInventoryManager();
