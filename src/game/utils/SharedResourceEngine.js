import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 게임에서 사용될 공유 자원의 종류를 정의합니다.
 */
export const SHARED_RESOURCE_TYPES = {
    FIRE: '불',
    WATER: '물',
    WIND: '바람',
    EARTH: '대지',
    LIGHT: '빛',
    DARK: '어둠',
    IRON: '철',
    POISON: '독'
};

/**
 * 파티가 공유하는 자원을 관리하는 중앙 엔진 (싱글턴)
 */
class SharedResourceEngine {
    constructor() {
        this.resources = new Map();
        this._initializeResourceMap();
        debugLogEngine.log('SharedResourceEngine', '공유 자원 엔진이 초기화되었습니다.');
    }

    /**
     * 자원 맵을 초기화합니다.
     * @private
     */
    _initializeResourceMap() {
        Object.keys(SHARED_RESOURCE_TYPES).forEach(key => {
            this.resources.set(key, 0);
        });
    }

    /**
     * 전투 시작 시 모든 자원을 0으로 초기화합니다.
     */
    initialize() {
        this._initializeResourceMap();
        debugLogEngine.log('SharedResourceEngine', '모든 공유 자원을 초기화했습니다.');
    }

    /**
     * 특정 종류의 자원을 추가합니다.
     * @param {string} type - SHARED_RESOURCE_TYPES에 정의된 자원 키
     * @param {number} amount - 추가할 양
     */
    addResource(type, amount) {
        if (this.resources.has(type) && amount > 0) {
            const currentAmount = this.resources.get(type);
            this.resources.set(type, currentAmount + amount);
            // TODO: 자원 획득 시 UI 업데이트를 위한 이벤트 발행 로직 추가 가능
        }
    }

    /**
     * 특정 종류의 자원을 소모합니다.
     * @param {string} type - 소모할 자원 키
     * @param {number} amount - 소모할 양
     * @returns {boolean} - 소모 성공 여부
     */
    spendResource(type, amount) {
        if (this.resources.has(type) && this.resources.get(type) >= amount) {
            const currentAmount = this.resources.get(type);
            this.resources.set(type, currentAmount - amount);
            // TODO: 자원 소모 시 UI 업데이트를 위한 이벤트 발행 로직 추가 가능
            return true;
        }
        return false;
    }

    /**
     * 특정 자원의 현재 양을 조회합니다.
     * @param {string} type - 조회할 자원 키
     * @returns {number}
     */
    getResource(type) {
        return this.resources.get(type) || 0;
    }

    /**
     * 모든 자원의 현재 상태를 담은 객체를 반환합니다.
     * @returns {object}
     */
    getAllResources() {
        return Object.fromEntries(this.resources);
    }
}

export const sharedResourceEngine = new SharedResourceEngine();
