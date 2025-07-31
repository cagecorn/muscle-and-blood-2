import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 각 용병이 장착한 장비를 관리하는 매니저
 * 장비 인스턴스 ID를 저장합니다.
 */
class EquipmentManager {
    constructor() {
        // key: unitId => [weaponId, armorId, acc1Id, acc2Id]
        this.equippedItems = new Map();
        debugLogEngine.log('EquipmentManager', '장비 관리 매니저가 초기화되었습니다.');
    }

    initializeSlots(unitId) {
        if (!this.equippedItems.has(unitId)) {
            // [무기, 갑옷, 악세사리1, 악세사리2] 슬롯
            this.equippedItems.set(unitId, [null, null, null, null]);
        }
    }

    /**
     * 용병의 특정 슬롯에 장비를 장착합니다.
     * @param {number} unitId
     * @param {number} slotIndex
     * @param {number} instanceId
     * @returns {number|null} 기존 장비 인스턴스 ID
     */
    equipItem(unitId, slotIndex, instanceId) {
        this.initializeSlots(unitId);
        const slots = this.equippedItems.get(unitId);
        if (slotIndex < 0 || slotIndex >= slots.length) return null;

        const prev = slots[slotIndex];
        slots[slotIndex] = instanceId;
        console.log(`[EquipmentManager] 유닛 ${unitId}의 ${slotIndex}번 슬롯에 장비 ${instanceId} 장착. 이전 장비: ${prev}`);
        return prev;
    }

    /**
     * 장착 해제
     */
    unequipItem(unitId, slotIndex) {
        if (!this.equippedItems.has(unitId)) return null;
        const slots = this.equippedItems.get(unitId);
        if (slotIndex < 0 || slotIndex >= slots.length) return null;

        const removed = slots[slotIndex];
        slots[slotIndex] = null;
        console.log(`[EquipmentManager] 유닛 ${unitId}의 ${slotIndex}번 슬롯에서 장비 ${removed} 해제.`);
        return removed;
    }

    getEquippedItems(unitId) {
        this.initializeSlots(unitId);
        return this.equippedItems.get(unitId);
    }
}

export const equipmentManager = new EquipmentManager();
