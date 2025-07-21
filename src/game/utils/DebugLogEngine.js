/**
 * 브라우저 개발자 도구 콘솔에 구조화된 로그를 출력하는 엔진 (싱글턴)
 */
class DebugLogEngine {
    constructor() {
        if (DebugLogEngine.instance) {
            return DebugLogEngine.instance;
        }
        
        // 이 값을 false로 바꾸면 모든 디버그 로그가 출력되지 않습니다.
        this.enabled = true;
        
        this.managers = {};
        this._welcomeMessage();

        DebugLogEngine.instance = this;
    }

    /**
     * 엔진이 처음 초기화될 때 콘솔에 환영 메시지를 출력합니다.
     */
    _welcomeMessage() {
        if (!this.enabled) return;
        console.log(
            '%c[DebugLogEngine]%c가 활성화되었습니다. 이제 매니저를 등록할 수 있습니다.',
            'color: #7F00FF; font-weight: bold;', // 보라색, 굵게
            'color: default;'
        );
    }

    /**
     * 새로운 디버그 매니저를 엔진에 등록합니다.
     * @param {object} manager - 등록할 매니저. 'name' 속성이 필수입니다.
     */
    register(manager) {
        if (manager && manager.name) {
            this.managers[manager.name] = manager;
        } else {
            this.error('Engine', '매니저 등록 실패: 매니저는 반드시 name 속성을 가져야 합니다.');
        }
    }

    /**
     * 일반 로그를 출력합니다.
     * @param {string} source - 로그 출처 (매니저 이름)
     * @param  {...any} args - 출력할 내용들
     */
    log(source, ...args) {
        if (!this.enabled) return;
        // 출처(source)에 따라 색상이 바뀌도록 스타일을 적용합니다.
        console.log(
            `%c[${source}]`,
            `color: ${this._getSourceColor(source)}; font-weight: bold;`,
            ...args
        );
    }

    /**
     * 경고 로그를 출력합니다.
     * @param {string} source - 로그 출처
     * @param  {...any} args - 출력할 내용들
     */
    warn(source, ...args) {
        if (!this.enabled) return;
        console.warn(`[${source}]`, ...args);
    }

    /**
     * 에러 로그를 출력합니다.
     * @param {string} source - 로그 출처
     * @param  {...any} args - 출력할 내용들
     */
    error(source, ...args) {
        if (!this.enabled) return;
        console.error(`[${source}]`, ...args);
    }

    /**
     * 로그 출처(source) 문자열을 기반으로 고유한 색상을 생성합니다.
     * @param {string} source - 출처 문자열
     * @returns {string} - CSS 색상 코드
     */
    _getSourceColor(source) {
        let hash = 0;
        for (let i = 0; i < source.length; i++) {
            hash = source.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    }
}

// 다른 파일에서 쉽게 사용할 수 있도록 유일한 인스턴스를 생성하여 내보냅니다.
export const debugLogEngine = new DebugLogEngine();
