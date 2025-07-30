import { debugAIMemoryManager } from '../debug/DebugAIMemoryManager.js';

/**
 * IndexedDB를 사용하여 각 AI 유닛의 전투 경험을 저장하고 관리하는 '기억' 엔진
 */
class AIMemoryEngine {
    constructor() {
        this.db = null;
        this.dbName = 'AIMemoryDB';
        this.storeName = 'combatMemory';
        this.initDB();
    }

    /**
     * IndexedDB를 초기화하고 객체 저장소를 생성합니다.
     */
    initDB() {
        const request = indexedDB.open(this.dbName, 1);

        request.onupgradeneeded = (event) => {
            this.db = event.target.result;
            if (!this.db.objectStoreNames.contains(this.storeName)) {
                this.db.createObjectStore(this.storeName, { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => {
            this.db = event.target.result;
            console.log('[AIMemoryEngine] IndexedDB가 성공적으로 초기화되었습니다.');
        };

        request.onerror = (event) => {
            console.error('[AIMemoryEngine] IndexedDB 초기화 오류:', event.target.errorCode);
        };
    }

    /**
     * 특정 공격자와 대상에 대한 기억(가중치)을 가져옵니다.
     * @param {number} attackerId - 공격자 유닛의 고유 ID
     * @returns {Promise<object>} - 대상 ID를 키로 갖는 가중치 객체
     */
    getMemory(attackerId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return resolve(null);
            }
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(attackerId);

            request.onsuccess = (event) => {
                debugAIMemoryManager.logMemoryRead(attackerId, event.target.result?.memory || null);
                resolve(event.target.result?.memory || {});
            };

            request.onerror = (event) => {
                console.error('[AIMemoryEngine] 메모리 읽기 오류:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * 전투 결과를 바탕으로 AI의 기억(가중치)을 갱신합니다.
     * @param {number} attackerId - 공격자 ID
     * @param {number} targetId - 대상 ID
     * @param {string} attackType - 공격 타입 ('melee', 'ranged', 'magic')
     * @param {string} hitType - 전투 결과 ('치명타', '약점', '완화', '막기')
     */
    async updateMemory(attackerId, targetId, attackType, hitType) {
        if (!this.db || !attackType || !hitType) return;

        const memory = await this.getMemory(attackerId);
        const targetMemoryKey = `target_${targetId}`;
        const weightKey = `${attackType}_weight`;

        if (!memory[targetMemoryKey]) {
            memory[targetMemoryKey] = {};
        }

        if (memory[targetMemoryKey][weightKey] === undefined) {
            memory[targetMemoryKey][weightKey] = 1.0;
        }

        let adjustment = 0;
        if (hitType === '치명타' || hitType === '약점') {
            adjustment = 0.1;
        } else if (hitType === '완화' || hitType === '막기') {
            adjustment = -0.15;
        }

        if (adjustment !== 0) {
            const oldValue = memory[targetMemoryKey][weightKey];
            memory[targetMemoryKey][weightKey] = Math.max(0.1, Math.min(2.0, oldValue + adjustment));
            debugAIMemoryManager.logMemoryUpdate(attackerId, targetId, attackType, oldValue, memory[targetMemoryKey][weightKey]);
        }

        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        store.put({ id: attackerId, memory: memory });
    }
}

export const aiMemoryEngine = new AIMemoryEngine();
