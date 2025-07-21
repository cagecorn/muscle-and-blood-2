import { statEngine } from './StatEngine.js';
import { birthReportManager } from '../debug/BirthReportManager.js';
// PartyEngine을 불러옵니다.
import { partyEngine } from './PartyEngine.js';

/**
 * 용병의 생성, 저장, 관리를 전담하는 엔진 (싱글턴)
 */
class MercenaryEngine {
    constructor() {
        this.alliedMercenaries = new Map();
        this.enemyMercenaries = new Map();

        this.mercenaryNames = ['크리스', '레온', '아이온', '가레스', '로릭', '이반', '오린', '바엘', '팰크', '스팅'];
        this.nextUnitId = 1;
    }

    /**
     * 특정 타입의 용병을 고용하고, 고유한 인스턴스를 생성하여 반환합니다.
     * @param {object} baseMercenaryData - 고용할 용병의 기본 데이터
     * @param {string} type - 생성할 유닛의 타입 ('ally' 또는 'enemy')
     * @returns {object} - 새로운 용병 인스턴스
     */
    hireMercenary(baseMercenaryData, type = 'ally') {
        const randomName = this.mercenaryNames[Math.floor(Math.random() * this.mercenaryNames.length)];
        const uniqueId = this.nextUnitId++;

        const newInstance = {
            ...baseMercenaryData,
            uniqueId: uniqueId,
            instanceName: randomName,
            level: 1,
            exp: 0,
            equippedItems: []
        };
        
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
