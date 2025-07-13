// js/managers/EventManager.js

export class EventManager {
    constructor() {
        // Web Worker 인스턴스 생성
        // '../workers/eventWorker.js' 경로는 이 파일(EventManager.js) 기준으로 workers 폴더 안의 eventWorker.js를 의미합니다.
        this.worker = new Worker('./js/workers/eventWorker.js'); // main.js에서 EventManager를 불러올 때의 상대 경로
        this.subscribers = new Map(); // 메인 스레드에서 이벤트 구독자를 관리할 Map
        this._isGameRunning = false; // ✨ 게임 실행 상태 플래그 추가

        // Web Worker로부터 메시지를 받을 때 실행될 콜백 설정
        this.worker.onmessage = this.handleWorkerMessage.bind(this);
        // 에러 발생 시 처리
        this.worker.onerror = (e) => {
            console.error("[EventManager] Worker Error:", e);
        };

        console.log("[EventManager] Initialized with Web Worker.");
    }

    /**
     * Web Worker로부터 메시지를 처리합니다.
     * @param {MessageEvent} event
     */
    handleWorkerMessage(event) {
        const { type, eventName, data, skillName, targetUnitId, amount, sourceUnitId, radius } = event.data;

        if (type === 'EVENT_DISPATCHED') {
            // Worker가 이벤트를 받았다고 알림 -> 메인 스레드의 구독자들에게 전파
            this.dispatch(eventName, data);
        } else if (type === 'SKILL_TRIGGERED') {
            // Worker의 '작은 엔진'이 스킬 발동을 요청함
            console.log(`[EventManager] Worker requested skill: ${skillName}`);
            // TODO: 실제 게임에서는 이 요청을 CombatEngine이나 StatSystem 등으로 전달하여
            // 해당 스킬의 효과를 적용해야 합니다.
            // 임시로 콘솔에 출력
            if (skillName === '흡혈') {
                console.log(`[EventManager] Unit ${targetUnitId} 흡혈 ${amount} 만큼 발동!`);
            } else if (skillName === '광역 공포') {
                console.log(`[EventManager] ${sourceUnitId} 사망으로 인한 광역 공포(${radius} 범위) 발동!`);
            }
            // 이 시점에서 다시 이벤트(예: 'skillExecuted')를 발생시킬 수도 있습니다.
            this.emit('skillExecuted', { skillName, targetUnitId, amount, sourceUnitId, radius });
        }
    }

    /**
     * 이벤트를 발생시켜 Web Worker로 보냅니다.
     * @param {string} eventName - 발생시킬 이벤트의 이름
     * @param {object} data - 이벤트와 함께 전달할 데이터
     */
    emit(eventName, data) {
        // Worker에게 이벤트를 처리하도록 요청
        this.worker.postMessage({ type: 'EMIT_EVENT', eventName, data });
    }

    /**
     * 메인 스레드에서 이벤트를 구독합니다.
     * (Worker로부터 받은 'EVENT_DISPATCHED' 메시지를 처리하기 위함)
     * @param {string} eventName - 구독할 이벤트의 이름
     * @param {function} callback - 이벤트 발생 시 호출될 콜백 함수
     */
    subscribe(eventName, callback) {
        if (!this.subscribers.has(eventName)) {
            this.subscribers.set(eventName, []);
        }
        this.subscribers.get(eventName).push(callback);
        console.log(`[EventManager] Subscribed to event: ${eventName}`);
    }

    /**
     * 메인 스레드에서 이벤트를 전파합니다 (Worker로부터 받은 후).
     * @param {string} eventName - 전파할 이벤트의 이름
     * @param {object} data - 이벤트와 함께 전달할 데이터
     */
    dispatch(eventName, data) {
        if (this.subscribers.has(eventName)) {
            this.subscribers.get(eventName).forEach(callback => callback(data));
        }
    }

    /**
     * Web Worker를 종료합니다. (선택 사항)
     */
    terminateWorker() {
        if (this.worker) {
            this.worker.terminate();
            console.log("[EventManager] Web Worker terminated.");
        }
    }

    /**
     * ✨ 게임 실행 상태를 설정합니다.
     * @param {boolean} isRunning
     */
    setGameRunningState(isRunning) {
        this._isGameRunning = isRunning;
    }

    /**
     * ✨ 게임 실행 상태를 반환합니다.
     * @returns {boolean}
     */
    getGameRunningState() {
        return this._isGameRunning;
    }
}
