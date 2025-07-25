import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 각 용병이 장착한 스킬을 관리하는 매니저
 * 스킬 인스턴스 ID를 저장합니다.
 */
class OwnedSkillsManager {
    constructor() {
        // key: unitId => [instanceId|null, ...]
        this.equippedSkills = new Map();
        debugLogEngine.log('OwnedSkillsManager', '보유 스킬 매니저가 초기화되었습니다.');
    }

    initializeSlots(unitId) {
        if (!this.equippedSkills.has(unitId)) {
            // ✨ [변경] 기본 장착 슬롯을 6개로 확장합니다 (0~5).
            this.equippedSkills.set(unitId, [null, null, null, null, null, null]);
        }
    }

    /**
     * 용병의 특정 슬롯에 스킬 인스턴스를 장착합니다.
     * @param {number} unitId
     * @param {number} slotIndex
     * @param {number} instanceId
     * @returns {number|null} 기존 인스턴스 ID
     */
    equipSkill(unitId, slotIndex, instanceId) {
        this.initializeSlots(unitId);
        const slots = this.equippedSkills.get(unitId);
        const prev = slots[slotIndex];
        slots[slotIndex] = instanceId;
        console.log(`[OwnedSkillsManager] 유닛 ${unitId}의 ${slotIndex}번 슬롯에 스킬 인스턴스 ${instanceId} 장착. 이전 스킬: ${prev}`);
        return prev;
    }

    /**
     * 장착 해제
     */
    unequipSkill(unitId, slotIndex) {
        if (!this.equippedSkills.has(unitId)) return null;
        const slots = this.equippedSkills.get(unitId);
        const removed = slots[slotIndex];
        slots[slotIndex] = null;
        console.log(`[OwnedSkillsManager] 유닛 ${unitId}의 ${slotIndex}번 슬롯에서 스킬 인스턴스 ${removed} 해제.`);
        return removed;
    }

    getEquippedSkills(unitId) {
        this.initializeSlots(unitId);
        return this.equippedSkills.get(unitId);
    }
}

export const ownedSkillsManager = new OwnedSkillsManager();
