import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 플레이어가 획득한 모든 스킬 카드의 인벤토리를 관리하는 엔진
 */
class SkillInventoryManager {
    constructor() {
        // key: skillId, value: { details, count: number }
        this.skillInventory = new Map();
        debugLogEngine.log('SkillInventoryManager', '스킬 인벤토리 매니저가 초기화되었습니다.');
    }

    // 향후 여기에 스킬 획득/폐기/조회 관련 메서드가 추가될 것입니다.
}

export const skillInventoryManager = new SkillInventoryManager();
