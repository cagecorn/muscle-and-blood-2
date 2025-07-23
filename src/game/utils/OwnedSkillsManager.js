import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 각 용병이 현재 장착하고 있거나 보유한 스킬들을 관리하는 엔진
 */
class OwnedSkillsManager {
    constructor() {
        // key: unit.uniqueId, value: { slot1: skillId, slot2: null, slot3: skillId }
        this.equippedSkills = new Map();
        debugLogEngine.log('OwnedSkillsManager', '보유 스킬 매니저가 초기화되었습니다.');
    }

    // 향후 여기에 스킬 장착/해제/조회 관련 메서드가 추가될 것입니다.
}

export const ownedSkillsManager = new OwnedSkillsManager();
