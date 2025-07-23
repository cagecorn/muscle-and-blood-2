import { debugLogEngine } from './DebugLogEngine.js';
import { skillCardDatabase } from '../data/skills/SkillCardDatabase.js';

/**
 * 플레이어가 획득한 모든 스킬 카드의 인벤토리를 관리하는 엔진
 * 각 스킬 카드는 고유 instanceId로 관리됩니다.
 */
class SkillInventoryManager {
    constructor() {
        /** 인벤토리 안에 있는 스킬 인스턴스 목록 */
        this.skillInventory = [];
        /** 모든 인스턴스의 매핑을 보존 */
        this.instanceMap = new Map();
        this.nextInstanceId = 1;
        debugLogEngine.log('SkillInventoryManager', '스킬 인벤토리 매니저가 초기화되었습니다.');
        this.initializeSkillCards();
    }

    /**
     * 게임 시작 시 기본 스킬 카드를 지급합니다.
     */
    initializeSkillCards() {
        for (const skillId in skillCardDatabase) {
            if (skillCardDatabase.hasOwnProperty(skillId)) {
                this.addSkillById(skillId);
                this.addSkillById(skillId);
            }
        }
        debugLogEngine.log('SkillInventoryManager', `초기 스킬 카드 ${this.skillInventory.length}장 생성 완료.`);
    }

    /**
     * 스킬 ID를 기반으로 새로운 스킬 인스턴스를 생성해 인벤토리에 추가합니다.
     * @param {string} skillId
     */
    addSkillById(skillId) {
        const instance = { instanceId: this.nextInstanceId++, skillId };
        this.skillInventory.push(instance);
        this.instanceMap.set(instance.instanceId, skillId);
    }

    /**
     * 인벤토리에서 특정 인스턴스를 제거합니다.
     * @param {number} instanceId
     */
    removeSkillByInstanceId(instanceId) {
        this.skillInventory = this.skillInventory.filter(s => s.instanceId !== instanceId);
    }

    /** 현재 인벤토리에 있는 스킬 인스턴스 배열을 반환 */
    getInventory() {
        return this.skillInventory;
    }

    /** 스킬 ID로 스킬 데이터 조회 */
    getSkillData(skillId) {
        return skillCardDatabase[skillId];
    }

    /** 인스턴스 ID로 스킬 ID 조회 */
    getSkillIdByInstance(instanceId) {
        return this.instanceMap.get(instanceId);
    }
}

export const skillInventoryManager = new SkillInventoryManager();
