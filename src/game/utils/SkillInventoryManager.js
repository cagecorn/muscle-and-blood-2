import { debugLogEngine } from './DebugLogEngine.js';
import { skillCardDatabase } from '../data/skills/SkillCardDatabase.js';

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
        this.addSkillCards(skillCardDatabase);
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
        return Array.from(this.skillInventory.keys()).map(id => skillCardDatabase[id]);
    }
    
    /**
     * ✨ [추가] 스킬 ID로 스킬 데이터를 반환하는 헬퍼 메서드
     */
    getSkillData(skillId) {
        return skillCardDatabase[skillId];
    }

    // 향후 여기에 스킬 획득/폐기/조회 관련 메서드가 추가될 것입니다.
}

export const skillInventoryManager = new SkillInventoryManager();
