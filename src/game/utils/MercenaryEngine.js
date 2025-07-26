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
            // ✨ [변경] 6개의 슬롯을 가집니다.
            skillSlots: new Array(6)
        };

        // ✨ [신규] 0번 슬롯은 '이동'으로 고정
        newInstance.skillSlots[0] = 'ACTIVE';
        const moveInstance = skillInventoryManager.addSkillById('move', 'NORMAL');
        ownedSkillsManager.equipSkill(newInstance.uniqueId, 0, moveInstance.instanceId);
        skillInventoryManager.removeSkillFromInventoryList(moveInstance.instanceId);

        const nonAidSkillTypes = ['ACTIVE', 'BUFF', 'DEBUFF', 'PASSIVE'];

        // ✨ [변경] 슬롯 인덱스를 1부터 시작하도록 수정
        if (newInstance.id === 'warrior') {
            const randomSlots = skillEngine.generateRandomSkillSlots(nonAidSkillTypes);
            newInstance.skillSlots[1] = randomSlots[0];
            newInstance.skillSlots[2] = randomSlots[1];
            newInstance.skillSlots[3] = randomSlots[2];
            newInstance.skillSlots[4] = 'ACTIVE'; // 4번 슬롯 (기존 3번)

            const consumed = skillInventoryManager.findAndRemoveInstanceOfSkill('attack');
            if (consumed) {
                const attackInstance = skillInventoryManager.addSkillById('attack', consumed.grade);
                ownedSkillsManager.equipSkill(newInstance.uniqueId, 4, attackInstance.instanceId);
                skillInventoryManager.removeSkillFromInventoryList(attackInstance.instanceId);
            }
        } else if (newInstance.id === 'gunner') {
            const randomSlots = skillEngine.generateRandomSkillSlots(nonAidSkillTypes);
            newInstance.skillSlots[1] = randomSlots[0];
            newInstance.skillSlots[2] = randomSlots[1];
            newInstance.skillSlots[3] = randomSlots[2];
            newInstance.skillSlots[4] = 'ACTIVE';

            const consumed = skillInventoryManager.findAndRemoveInstanceOfSkill('rangedAttack');
            if (consumed) {
                const attackInstance = skillInventoryManager.addSkillById('rangedAttack', consumed.grade);
                ownedSkillsManager.equipSkill(newInstance.uniqueId, 4, attackInstance.instanceId);
                skillInventoryManager.removeSkillFromInventoryList(attackInstance.instanceId);
            }
        } else if (newInstance.id === 'medic') { 
            const randomSlots = skillEngine.generateRandomSkillSlots(['AID', 'BUFF', 'PASSIVE']);
            newInstance.skillSlots[1] = randomSlots[0];
            newInstance.skillSlots[2] = randomSlots[1];
            newInstance.skillSlots[3] = randomSlots[2];
            newInstance.skillSlots[4] = 'AID';
            const consumed = skillInventoryManager.findAndRemoveInstanceOfSkill('heal');
            if (consumed) {
                const instance = skillInventoryManager.addSkillById('heal', consumed.grade);
                ownedSkillsManager.equipSkill(newInstance.uniqueId, 4, instance.instanceId);
                skillInventoryManager.removeSkillFromInventoryList(instance.instanceId);
            }
        }

        // ✨ [변경] 5번 슬롯은 소환 전용
        newInstance.skillSlots[5] = 'SUMMON';

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
