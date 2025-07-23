import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 각 용병이 장착한 스킬을 관리하는 매니저
 */
class OwnedSkillsManager {
    constructor() {
        // key: unit.uniqueId, value: an array of 3 elements [skillId | null, skillId | null, skillId | null]
        this.equippedSkills = new Map();
        debugLogEngine.log('OwnedSkillsManager', '보유 스킬 매니저가 초기화되었습니다.');
    }

    /**
     * 특정 용병의 스킬 슬롯 정보를 초기화합니다.
     * @param {number} unitId - 용병의 고유 ID
     */
    initializeSlots(unitId) {
        if (!this.equippedSkills.has(unitId)) {
            this.equippedSkills.set(unitId, [null, null, null]);
        }
    }

    /**
     * 용병의 특정 슬롯에 스킬을 장착합니다.
     * @param {number} unitId - 용병의 고유 ID
     * @param {number} slotIndex - 장착할 슬롯 인덱스 (0, 1, 2)
     * @param {string} skillId - 장착할 스킬의 ID
     * @returns {string|null} - 원래 장착되어 있던 스킬 ID (스왑용)
     */
    equipSkill(unitId, slotIndex, skillId) {
        this.initializeSlots(unitId);
        const slots = this.equippedSkills.get(unitId);
        const previousSkillId = slots[slotIndex];
        slots[slotIndex] = skillId;
        console.log(`[OwnedSkillsManager] 유닛 ${unitId}의 ${slotIndex}번 슬롯에 ${skillId} 장착. 이전 스킬: ${previousSkillId}`);
        return previousSkillId;
    }

    /**
     * 특정 용병이 장착한 스킬 목록을 반환합니다.
     * @param {number} unitId - 용병의 고유 ID
     * @returns {Array<string|null>}
     */
    getEquippedSkills(unitId) {
        this.initializeSlots(unitId);
        return this.equippedSkills.get(unitId);
    }
}

export const ownedSkillsManager = new OwnedSkillsManager();
