import { debugLogEngine } from './DebugLogEngine.js';
import { itemInventoryManager } from './ItemInventoryManager.js';
import { EQUIPMENT_SLOTS } from '../data/items.js';

class EquipmentManager {
    constructor() {
        this.name = 'EquipmentManager';
        // key: unitId => { WEAPON: null, ARMOR: null, ACCESSORY1: null, ACCESSORY2: null }
        this.equippedItems = new Map();
        // 장착된 모든 아이템의 인스턴스 데이터를 임시 보관하여 소멸을 방지합니다.
        this.itemInstanceCache = new Map();
        debugLogEngine.register(this);
        debugLogEngine.log(this.name, '장비 관리 매니저가 초기화되었습니다.');
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

        // 인벤토리에서 장착할 아이템을 가져옵니다.
        const itemToEquip = itemInventoryManager.getItem(instanceId);
        if (!itemToEquip) return;

        // --- ▼ [버그 수정] 아이템 타입 비교 로직 수정 ▼ ---
        // 'ACCESSORY1' -> 'ACCESSORY'로 변환하여 비교 준비
        const baseSlotType = slotType.replace(/\d+$/, '');
        const requiredItemType = EQUIPMENT_SLOTS[baseSlotType];

        if (itemToEquip.type !== requiredItemType) {
            alert(`[${itemToEquip.type}] 아이템은 [${requiredItemType}] 슬롯에 장착할 수 없습니다.`);
            return;
        }
        // --- ▲ [버그 수정] ▲ ---

        // 인벤토리에서 아이템을 제거합니다.
        itemInventoryManager.removeItem(instanceId);
        // 캐시에 아이템 데이터를 저장합니다.
        this.itemInstanceCache.set(instanceId, itemToEquip);

        const prevItemInstanceId = slots[slotType];
        // 이전에 장착된 아이템이 있었다면 캐시에서 찾아 인벤토리로 되돌립니다.
        if (prevItemInstanceId) {
            const prevItem = this.itemInstanceCache.get(prevItemInstanceId);
            if (prevItem) {
                itemInventoryManager.addItem(prevItem);
                this.itemInstanceCache.delete(prevItemInstanceId);
            }
        }

        slots[slotType] = instanceId;
        debugLogEngine.log(this.name, `유닛 ${unitId}의 ${slotType} 슬롯에 아이템 ${instanceId} 장착.`);
    }

    swapItems(unitId, sourceSlotType, targetSlotType) {
        this.initializeSlots(unitId);
        const slots = this.equippedItems.get(unitId);
        const sourceId = slots[sourceSlotType];
        const targetId = slots[targetSlotType];
        if (!sourceId) return;

        const sourceItem = this.itemInstanceCache.get(sourceId);
        if (!sourceItem) return;
        const targetBase = targetSlotType.replace(/\d+$/, '');
        const requiredForTarget = EQUIPMENT_SLOTS[targetBase];
        if (sourceItem.type !== requiredForTarget) {
            alert(`[${sourceItem.type}] 아이템은 [${requiredForTarget}] 슬롯에 장착할 수 없습니다.`);
            return;
        }

        if (targetId) {
            const targetItem = this.itemInstanceCache.get(targetId);
            const sourceBase = sourceSlotType.replace(/\d+$/, '');
            const requiredForSource = EQUIPMENT_SLOTS[sourceBase];
            if (targetItem && targetItem.type !== requiredForSource) {
                alert(`[${targetItem.type}] 아이템은 [${requiredForSource}] 슬롯에 장착할 수 없습니다.`);
                return;
            }
        }

        slots[sourceSlotType] = targetId;
        slots[targetSlotType] = sourceId;
        debugLogEngine.log(this.name, `유닛 ${unitId}의 ${sourceSlotType}와 ${targetSlotType} 슬롯 아이템을 교체.`);
    }

    unequipItem(unitId, slotType) {
        this.initializeSlots(unitId);
        const slots = this.equippedItems.get(unitId);
        const itemInstanceId = slots[slotType];

        if (itemInstanceId) {
            // 캐시에서 아이템을 찾아 인벤토리로 옮깁니다.
            const item = this.itemInstanceCache.get(itemInstanceId);
            if (item) {
                itemInventoryManager.addItem(item);
                this.itemInstanceCache.delete(itemInstanceId);
            }
            slots[slotType] = null;
            debugLogEngine.log(this.name, `유닛 ${unitId}의 ${slotType} 슬롯에서 아이템 ${itemInstanceId} 해제.`);
        }
    }

    getEquippedItems(unitId) {
        this.initializeSlots(unitId);
        const slots = this.equippedItems.get(unitId);
        return [slots.WEAPON, slots.ARMOR, slots.ACCESSORY1, slots.ACCESSORY2];
    }
}

export const equipmentManager = new EquipmentManager();
