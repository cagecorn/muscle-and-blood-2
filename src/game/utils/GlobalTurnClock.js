/**
 * 게임의 전역 턴을 관리하는 시계입니다.
 * 정해진 시간 간격마다 모든 유닛이 동시에 행동하도록 신호를 보냅니다.
 */
export class GlobalTurnClock {
    /**
     * @param {Phaser.Scene} scene - 이 시계를 소유한 씬
     * @param {number} turnInterval - 턴 사이의 시간 간격 (밀리초 단위, 예: 1500 = 1.5초)
     */
    constructor(scene, turnInterval = 1500) {
        this.scene = scene;
        this.turnInterval = turnInterval;
        this.timer = null;
    }

    /**
     * 시계를 시작하고 턴 이벤트를 발생시키기 시작합니다.
     */
    start() {
        // 만약 기존 타이머가 있다면 중복 실행을 막기 위해 제거합니다.
        if (this.timer) {
            this.timer.remove(false);
        }

        // Phaser의 시간 이벤트를 사용해 일정 간격으로 tick 메소드를 호출합니다.
        this.timer = this.scene.time.addEvent({
            delay: this.turnInterval,
            callback: this.tick,
            callbackScope: this,
            loop: true
        });

        console.log(`[GlobalTurnClock] 시작되었습니다. (간격: ${this.turnInterval}ms)`);
    }

    /**
     * 시계의 매 틱마다 호출되는 내부 메소드입니다.
     * 'new-global-turn' 이벤트를 씬 전체에 방송합니다.
     * 이 신호를 다른 관리자(AIManager 등)들이 듣고 행동을 시작하게 됩니다.
     */
    tick() {
        // console.log('[GlobalTurnClock] Tick!'); // 너무 자주 출력되므로 필요시 주석 해제하여 디버깅
        this.scene.events.emit('new-global-turn');
    }

    /**
     * 시계를 멈춥니다.
     */
    stop() {
        if (this.timer) {
            this.timer.remove(false);
            this.timer = null;
            console.log('[GlobalTurnClock] 중지되었습니다.');
        }
    }
}
