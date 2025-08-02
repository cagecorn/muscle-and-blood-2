import { debugLogEngine } from './DebugLogEngine.js';

const DEFAULT_PLACEHOLDER = 'assets/images/placeholder.png';

/**
 * 이미지 경로가 유효하지 않을 때 기본 플레이스홀더 경로를 제공하는 유틸리티
 */
class PlaceholderManager {
    constructor() {
        this.name = 'PlaceholderManager';
        debugLogEngine.log(this.name, '플레이스홀더 매니저가 초기화되었습니다.');
    }

    /**
     * 이미지 경로를 받아 유효하면 그대로 반환하고,
     * 유효하지 않으면 기본 플레이스홀더 경로를 반환합니다.
     * @param {string | null | undefined} originalPath - 확인할 원본 이미지 경로
     * @returns {string} - 최종적으로 사용될 이미지 경로
     */
    getPath(originalPath) {
        if (originalPath && typeof originalPath === 'string' && originalPath.trim() !== '') {
            return originalPath;
        }
        // 경로가 유효하지 않으면 플레이스홀더를 반환하고 로그를 남깁니다.
        debugLogEngine.warn(this.name, `유효하지 않은 이미지 경로 감지. 플레이스홀더로 대체합니다.`);
        return DEFAULT_PLACEHOLDER;
    }
}

export const placeholderManager = new PlaceholderManager();

