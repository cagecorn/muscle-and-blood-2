import { debugLogEngine } from './DebugLogEngine.js';
import { itemInventoryManager } from './ItemInventoryManager.js'; // 인벤토리 매니저 import

class EquipmentManager {
    constructor() {
        // key: unitId => { WEAPON: null, ARMOR: null, ACCESSORY1: null, ACCESSORY2: null }
        this.equippedItems = new Map();
        debugLogEngine.log('EquipmentManager', '장비 관리 매니저가 초기화되었습니다.');
    }

    initializeSlots(unitId) {
        if (!this.equippedItems.has(unitId)) {
            // 슬롯을 이름으로 관리하여 명확성을 높입니다.
            this.equippedItems.set(unitId, {
                WEAPON: null,
                ARMOR: null,
                ACCESSORY1: null,
                ACCESSORY2: null
            });
        }
    }

    /**
     * 용병의 특정 슬롯에 장비를 장착합니다.
     * @param {number} unitId
     * @param {string} slotType - 'WEAPON', 'ARMOR' 등
     * @param {number} instanceId - 장착할 아이템의 인스턴스 ID
     * @returns {number|null} - 이전에 장착되어 있던 아이템의 인스턴스 ID
     */
    equipItem(unitId, slotType, instanceId) {
        this.initializeSlots(unitId);
        const slots = this.equippedItems.get(unitId);
        
        const itemToEquip = itemInventoryManager.getItem(instanceId);
        if (!itemToEquip) return null;

        // 아이템 타입과 슬롯 타입이 맞는지 확인 (예: 무기는 무기 슬롯에만)
        // 이 부분은 나중에 더 정교하게 만들 수 있습니다.
        if (slotType.startsWith('ACCESSORY')) {
            // 악세사리 슬롯 처리
        } else if (itemToEquip.type !== slotType) {
            alert(`${itemToEquip.type}은(는) ${slotType} 슬롯에 장착할 수 없습니다.`);
            return null;
        }

        // 인벤토리에서 아이템 제거
        itemInventoryManager.removeItem(instanceId);

        const prevItemInstanceId = slots[slotType];
        // 이전에 장착된 아이템이 있었다면 인벤토리로 되돌림
        if (prevItemInstanceId) {
            const prevItem = this.getItemInstanceFromSomeWhere(prevItemInstanceId); // 임시 함수
            itemInventoryManager.addItem(prevItem);
        }

        slots[slotType] = instanceId;
        console.log(`[EquipmentManager] 유닛 ${unitId}의 ${slotType} 슬롯에 아이템 ${instanceId} 장착.`);
        return prevItemInstanceId;
    }
    
    // 임시 함수: 현재는 인벤토리에 없으므로 다시 생성해서 반환
    getItemInstanceFromSomeWhere(instanceId) {
        return { instanceId, name: "임시 복구 아이템" };
    }

    /**
     * 장착된 장비를 해제하여 인벤토리에 되돌립니다.
     * @param {number} unitId
     * @param {string} slotType
     * @returns {number|null} - 해제된 아이템의 인스턴스 ID
     */
    unequipItem(unitId, slotType) {
        this.initializeSlots(unitId);
        const slots = this.equippedItems.get(unitId);
        const itemInstanceId = slots[slotType];
        if (!itemInstanceId) return null;

        const item = this.getItemInstanceFromSomeWhere(itemInstanceId); // 임시 함수 사용
        itemInventoryManager.addItem(item);
        slots[slotType] = null;
        console.log(`[EquipmentManager] 유닛 ${unitId}의 ${slotType} 슬롯에서 아이템 ${itemInstanceId} 해제.`);
        return itemInstanceId;
    }

    getEquippedItems(unitId) {
        this.initializeSlots(unitId);
        // 객체를 배열로 변환하여 반환
        const slots = this.equippedItems.get(unitId);
        return [slots.WEAPON, slots.ARMOR, slots.ACCESSORY1, slots.ACCESSORY2];
    }
}

export const equipmentManager = new EquipmentManager();
