import { debugLogEngine } from './DebugLogEngine.js';
import { itemInventoryManager } from './ItemInventoryManager.js';

class EquipmentManager {
    constructor() {
        this.equippedItems = new Map();
        debugLogEngine.register(this);
    }
    
    initializeSlots(unitId) {
        if (!this.equippedItems.has(unitId)) {
            this.equippedItems.set(unitId, {
                WEAPON: null,
                ARMOR: null,
                ACCESSORY1: null,
                ACCESSORY2: null
            });
        }
    }

    equipItem(unitId, slotType, instanceId) {
        this.initializeSlots(unitId);
        const slots = this.equippedItems.get(unitId);
        
        const itemToEquip = itemInventoryManager.getItem(instanceId);
        if (!itemToEquip) return;
        
        // 아이템 타입과 슬롯 타입 검사 (ACCESSORY1, ACCESSORY2는 모두 ACCESSORY 타입)
        const requiredType = slotType.startsWith('ACCESSORY') ? 'ACCESSORY' : slotType;
        if (itemToEquip.type !== requiredType) {
            alert(`[${itemToEquip.type}] 아이템은 [${slotType}] 슬롯에 장착할 수 없습니다.`);
            return;
        }

        const prevItemInstanceId = slots[slotType];
        
        // 인벤토리에서 새 아이템 제거
        itemInventoryManager.removeItem(instanceId);
        
        // 이전 아이템이 있었다면 인벤토리로 복귀
        if (prevItemInstanceId) {
            // 아이템 스왑을 위해 임시 저장소 개념을 사용하지 않고,
            // EquipmentManager가 직접 인벤토리에 추가하도록 로직 변경
            const prevItem = this.findItemInGame(prevItemInstanceId); // 가상 함수
            if (prevItem) itemInventoryManager.addItem(prevItem);
        }

        slots[slotType] = instanceId;
        debugLogEngine.log(this.name, `유닛 ${unitId}의 ${slotType} 슬롯에 아이템 ${instanceId} 장착.`);
    }

    unequipItem(unitId, slotType) {
        this.initializeSlots(unitId);
        const slots = this.equippedItems.get(unitId);
        const itemInstanceId = slots[slotType];

        if (itemInstanceId) {
            const item = this.findItemInGame(itemInstanceId); // 가상 함수
            if (item) itemInventoryManager.addItem(item);
            slots[slotType] = null;
            debugLogEngine.log(this.name, `유닛 ${unitId}의 ${slotType} 슬롯에서 아이템 ${itemInstanceId} 해제.`);
        }
    }
    
    // 이 함수는 실제 게임에서는 DB나 다른 관리자에서 아이템 정보를 가져와야 합니다.
    // 지금은 장착 해제/스왑 시 아이템이 소멸하지 않도록 임시로 데이터를 다시 만들어줍니다.
    findItemInGame(instanceId) {
        // 이 로직은 완전한 인벤토리 시스템이 갖춰지면 수정되어야 합니다.
        // 지금은 데모를 위해 임시 아이템을 반환합니다.
        return {
            instanceId,
            name: `복구된 아이템 ${instanceId}`,
            grade: 'NORMAL',
            illustrationPath: 'assets/images/placeholder.png',
            stats: {},
            mbtiEffects: [],
            sockets: []
        };
    }

    getEquippedItems(unitId) {
        this.initializeSlots(unitId);
        const slots = this.equippedItems.get(unitId);
        return [slots.WEAPON, slots.ARMOR, slots.ACCESSORY1, slots.ACCESSORY2];
    }
}

export const equipmentManager = new EquipmentManager();
