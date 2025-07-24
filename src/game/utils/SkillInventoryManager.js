import { debugLogEngine } from './DebugLogEngine.js';
import { skillCardDatabase } from '../data/skills/SkillCardDatabase.js';

/**
 * 플레이어가 획득한 모든 스킬 카드의 인벤토리를 관리하는 엔진
 * 각 스킬 카드는 고유 instanceId로 관리됩니다.
 */
class SkillInventoryManager {
    constructor() {
        this.skillInventory = [];
        this.instanceMap = new Map();
        this.nextInstanceId = 1;
        debugLogEngine.log('SkillInventoryManager', '스킬 인벤토리 매니저가 초기화되었습니다.');
        this.initializeSkillCards();
    }

    /**
     * 게임 시작 시 기본 스킬 카드를 지급합니다.
     */
    initializeSkillCards() {
        // 등급별 기본 스킬 지급
        const grades = ['NORMAL', 'RARE', 'EPIC', 'LEGENDARY'];
        grades.forEach(grade => {
            for (let i = 0; i < 2; i++) {
                this.addSkillById('charge', grade);
                this.addSkillById('attack', grade); // 공격 스킬도 각 등급별 2장 지급
            }
        });

        // 나머지 스킬은 노멀 등급으로 10장씩 생성
        for (const skillId in skillCardDatabase) {
            if (skillCardDatabase.hasOwnProperty(skillId) && skillId !== 'charge' && skillId !== 'attack') {
                for (let i = 0; i < 10; i++) {
                    this.addSkillById(skillId, 'NORMAL');
                }
            }
        }
        debugLogEngine.log('SkillInventoryManager', `초기 스킬 카드 ${this.skillInventory.length}장 생성 완료.`);
    }

    /**
     * 스킬 ID를 기반으로 새로운 스킬 인스턴스를 생성해 인벤토리에 추가합니다.
     * @param {string} skillId
     */
    addSkillById(skillId, grade = 'NORMAL') {
        const instance = { instanceId: this.nextInstanceId++, skillId, grade };
        this.skillInventory.push(instance);
        this.instanceMap.set(instance.instanceId, { skillId, grade });
    }

    /**
     * 인벤토리에서 특정 인스턴스를 제거합니다.
     * @param {number} instanceId
     */
    removeSkillByInstanceId(instanceId) {
        this.skillInventory = this.skillInventory.filter(s => s.instanceId !== instanceId);
    }

    /**
     * ✨ [새 메서드] 인벤토리에서 특정 skillId를 가진 첫 번째 인스턴스를 찾아 제거하고 반환합니다.
     * @param {string} skillId - 찾을 스킬의 ID (예: 'attack')
     * @returns {object|null} - 찾은 스킬 인스턴스 또는 null
     */
    findAndRemoveInstanceOfSkill(skillId, grade = 'NORMAL') {
        const index = this.skillInventory.findIndex(s => s.skillId === skillId && s.grade === grade);
        if (index !== -1) {
            return this.skillInventory.splice(index, 1)[0];
        }
        return null;
    }

    /** 현재 인벤토리에 있는 스킬 인스턴스 배열을 반환 */
    getInventory() {
        return this.skillInventory;
    }

    /** 스킬 ID로 스킬 데이터 조회 */
    getSkillData(skillId, grade = 'NORMAL') {
        return skillCardDatabase[skillId] ? skillCardDatabase[skillId][grade] : null;
    }

    getInstanceData(instanceId) {
        return this.instanceMap.get(instanceId);
    }
}

export const skillInventoryManager = new SkillInventoryManager();
