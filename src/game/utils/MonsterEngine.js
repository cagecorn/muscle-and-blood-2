import { statEngine } from './StatEngine.js';
import { birthReportManager } from '../debug/BirthReportManager.js';

/**
 * 몬스터의 생성과 관리를 담당하는 엔진
 */
class MonsterEngine {
    constructor() {
        this.alliedMonsters = new Map();
        this.enemyMonsters = new Map();
        this.nextId = 1;
    }

    /**
     * 몬스터를 생성하여 등록합니다.
     * @param {object} baseData 기본 몬스터 데이터
     * @param {string} type 'ally' 또는 'enemy'
     * @returns {object} 생성된 몬스터 인스턴스
     */
    spawnMonster(baseData = {}, type = 'enemy') {
        const id = this.nextId++;
        const instance = {
            ...baseData,
            uniqueId: id,
            instanceName: baseData.instanceName || baseData.name || `Monster${id}`,
        };

        instance.finalStats = statEngine.calculateStats(instance, baseData.baseStats || {}, []);

        if (type === 'ally') {
            this.alliedMonsters.set(id, instance);
            birthReportManager.logNewUnit(instance, '아군 몬스터');
        } else {
            this.enemyMonsters.set(id, instance);
            birthReportManager.logNewUnit(instance, '적군 몬스터');
        }
        return instance;
    }

    /**
     * 특정 진영의 모든 몬스터 배열을 반환합니다.
     */
    getAllMonsters(type = 'enemy') {
        return Array.from(type === 'ally' ? this.alliedMonsters.values() : this.enemyMonsters.values());
    }
}

export const monsterEngine = new MonsterEngine();
