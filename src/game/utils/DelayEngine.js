import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 지정된 시간만큼 코드 실행을 '홀딩'하는 기능을 제공하는 엔진
 */
class DelayEngine {
    constructor() {
        debugLogEngine.log('DelayEngine', '딜레이 엔진이 초기화되었습니다.');
    }

    /**
     * 지정된 시간(ms)만큼 기다리는 Promise를 반환합니다.
     * @param {number} duration - 기다릴 시간 (밀리초)
     * @returns {Promise<void>}
     */
    hold(duration) {
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }
}

// 싱글턴으로 관리
export const delayEngine = new DelayEngine();
