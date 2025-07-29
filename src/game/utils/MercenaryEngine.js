import { statEngine } from './StatEngine.js';
import { birthReportManager } from '../debug/BirthReportManager.js';
// PartyEngine을 불러옵니다.
import { partyEngine } from './PartyEngine.js';
import { uniqueIDManager } from './UniqueIDManager.js';
// 스킬 엔진을 불러옵니다.
import { skillEngine } from './SkillEngine.js';
import { ownedSkillsManager } from './OwnedSkillsManager.js';
import { skillInventoryManager } from './SkillInventoryManager.js';

/**
 * 용병의 생성, 저장, 관리를 전담하는 엔진 (싱글턴)
 */
class MercenaryEngine {
    constructor() {
        this.alliedMercenaries = new Map();
        this.enemyMercenaries = new Map();

        this.mercenaryNames = ['크리스', '레온', '아이온', '가레스', '로릭', '이반', '오린', '바엘', '팰크', '스팅'];
    }

    /**
     * 특정 타입의 용병을 고용하고, 고유한 인스턴스를 생성하여 반환합니다.
     * @param {object} baseMercenaryData - 고용할 용병의 기본 데이터
     * @param {string} type - 생성할 유닛의 타입 ('ally' 또는 'enemy')
     * @returns {object} - 새로운 용병 인스턴스
     */
    hireMercenary(baseMercenaryData, type = 'ally') {
        const randomName = this.mercenaryNames[Math.floor(Math.random() * this.mercenaryNames.length)];
        const uniqueId = uniqueIDManager.getNextId();

        const newInstance = {
            ...baseMercenaryData,
            uniqueId,
            instanceName: randomName,
            level: 1,
            exp: 0,
            equippedItems: [],
            // ✨ 1. 스킬 슬롯 생성을 클래스별로 분기 처리하기 위해 초기화 위치를 변경합니다.
            skillSlots: []
        };
        
        // ✨ 2. '전사', '거너', '메딕' 클래스에 대한 특별 처리
        // 전사와 거너의 랜덤 스킬 풀에서 'AID'를 제외합니다.
        const nonAidSkillTypes = ['ACTIVE', 'BUFF', 'DEBUFF', 'PASSIVE'];

        if (newInstance.id === 'warrior') {
            newInstance.skillSlots = skillEngine.generateRandomSkillSlots(nonAidSkillTypes);
            // 4번째 슬롯을 'ACTIVE' 타입으로 고정
            newInstance.skillSlots.push('ACTIVE');

            // 인벤토리에서 'attack' 스킬 인스턴스를 소비하고, 동일한 스킬을 새로 생성하여 장착합니다.
            const consumed = skillInventoryManager.findAndRemoveInstanceOfSkill('attack');
            if (consumed) {
                const attackInstance = skillInventoryManager.addSkillById('attack', consumed.grade);
                // 4번 슬롯(인덱스 3)에 장착
                ownedSkillsManager.equipSkill(newInstance.uniqueId, 3, attackInstance.instanceId);
                // 새로 생성된 인스턴스는 용병 전용이므로 인벤토리 목록에서는 제거합니다.
                skillInventoryManager.removeSkillFromInventoryList(attackInstance.instanceId);
            }
        } else if (newInstance.id === 'gunner' || newInstance.id === 'nanomancer') {
            newInstance.skillSlots = skillEngine.generateRandomSkillSlots(nonAidSkillTypes);
            // 거너와 나노맨서를 위한 4번째 슬롯 처리
            newInstance.skillSlots.push('ACTIVE');

            const baseAttackSkillId = newInstance.id === 'gunner' ? 'rangedAttack' : 'nanobeam';
            const consumed = skillInventoryManager.findAndRemoveInstanceOfSkill(baseAttackSkillId);
            if (consumed) {
                const attackInstance = skillInventoryManager.addSkillById(baseAttackSkillId, consumed.grade);
                ownedSkillsManager.equipSkill(newInstance.uniqueId, 3, attackInstance.instanceId);
                skillInventoryManager.removeSkillFromInventoryList(attackInstance.instanceId);
            }
        } else if (newInstance.id === 'medic') { 
            // ✨ [핵심 변경] 메딕의 랜덤 슬롯은 AID, BUFF, PASSIVE 중에서만 생성합니다.
            newInstance.skillSlots = skillEngine.generateRandomSkillSlots(['AID', 'BUFF', 'PASSIVE']);
            // 4번째 슬롯을 'AID'로 고정합니다.
            newInstance.skillSlots.push('AID');
            const consumed = skillInventoryManager.findAndRemoveInstanceOfSkill('heal');
            if (consumed) {
                const instance = skillInventoryManager.addSkillById('heal', consumed.grade);
                ownedSkillsManager.equipSkill(newInstance.uniqueId, 3, instance.instanceId);
                skillInventoryManager.removeSkillFromInventoryList(instance.instanceId);
            }
        } else {
            // 다른 클래스는 기본 규칙을 따릅니다.
            newInstance.skillSlots = skillEngine.generateRandomSkillSlots();
            // 4번째 슬롯을 빈 슬롯(null)으로 추가
            newInstance.skillSlots.push(null);
        }

        // 5~8번째 특수 스킬 슬롯을 추가합니다. (현재는 비어있음)
        newInstance.skillSlots.push(null, null, null, null);

        newInstance.finalStats = statEngine.calculateStats(newInstance, newInstance.baseStats, newInstance.equippedItems);

        if (type === 'ally') {
            this.alliedMercenaries.set(uniqueId, newInstance);
            birthReportManager.logNewUnit(newInstance, '아군');
            // --- 파티에 추가 ---
            partyEngine.addPartyMember(uniqueId);
        } else {
            this.enemyMercenaries.set(uniqueId, newInstance);
            birthReportManager.logNewUnit(newInstance, '적군');
        }
        
        return newInstance;
    }

    getMercenaryById(uniqueId, type = 'ally') {
        return type === 'ally' ? this.alliedMercenaries.get(uniqueId) : this.enemyMercenaries.get(uniqueId);
    }

    getAllAlliedMercenaries() {
        return Array.from(this.alliedMercenaries.values());
    }

    getPartyMembers() {
        return partyEngine.getPartyMembers();
    }
}

export const mercenaryEngine = new MercenaryEngine();
