/**
 * AI 유닛의 의사결정에 필요한 모든 데이터를 저장하고 관리하는 중앙 데이터 저장소입니다.
 * 각 AI 유닛은 자신만의 블랙보드 인스턴스를 가집니다.
 */
class Blackboard {
    constructor() {
        this.data = new Map();
        this.initializeDataKeys();
    }

    /**
     * 블랙보드에서 사용할 모든 데이터 키를 초기 상태로 설정합니다.
     */
    initializeDataKeys() {
        // --- 🎯 타겟팅 및 위치 관련 정보 ---
        this.set('nearestEnemy', null);
        this.set('lowestHealthEnemy', null);
        this.set('currentTargetUnit', null);
        this.set('optimalAttackPosition', null);
        this.set('safestRetreatPosition', null);
        this.set('enemiesInAttackRange', []);

        // --- ⚔️ 전술적 상황 판단 정보 ---
        this.set('isThreatened', false);
        this.set('squadAdvantage', 0);
        this.set('enemyHealerUnit', null);

        // --- 🤖 AI 자신의 상태 정보 ---
        this.set('canUseSkill_1', false);
        this.set('canUseSkill_2', false);
        this.set('canUseSkill_3', false);

        // --- 이동 및 공격 관련 신규 정보 ---
        this.set('movementPath', null);
        this.set('isTargetInAttackRange', false);

        // --- 턴 진행 플래그 ---
        this.set('hasMovedThisTurn', false);
        this.set('usedSkillsThisTurn', new Set());
        this.set('currentTargetSkill', null);
    }

    set(key, value) {
        this.data.set(key, value);
    }

    get(key) {
        return this.data.get(key);
    }

    has(key) {
        return this.data.has(key);
    }
}

export default Blackboard;
