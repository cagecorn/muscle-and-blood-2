import { debugLogEngine } from './DebugLogEngine.js';

/**
 * DebugLogEngine에 기록된 로그를 파일로 다운로드하는 유틸리티 클래스
 */
class LogDownloader {
    /**
     * 기록된 모든 로그를 JSON 파일로 다운로드합니다.
     */
    static download() {
        const logs = debugLogEngine.logHistory;
        if (logs.length === 0) {
            alert('다운로드할 로그가 없습니다.');
            return;
        }

        try {
            const replacer = (key, value) => {
                if (key === 'sprite' || key === 'scene' || key === 'parent') {
                    return '[Circular Reference]';
                }
                return value;
            };

            const jsonData = JSON.stringify(logs, replacer, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            a.download = `muscle-and-blood-log-${timestamp}.json`;

            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            debugLogEngine.log('LogDownloader', '로그 파일 다운로드를 성공적으로 시작했습니다.');
        } catch (error) {
            console.error('로그 다운로드 중 오류 발생:', error);
            debugLogEngine.error('LogDownloader', '로그 파일 생성에 실패했습니다.', error);
            alert('로그 파일을 생성하는 데 실패했습니다. 개발자 콘솔을 확인해주세요.');
        }
    }
}

export const logDownloader = LogDownloader;
