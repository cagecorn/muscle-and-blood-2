/**
 * AI의 스킬 선택 가중치를 결정하는 점수 데이터입니다.
 * 이 값을 조정하여 AI의 행동 경향을 쉽게 변경할 수 있습니다.
 */

// 스킬 타입별 기본 점수
export const SCORE_BY_TYPE = {
    ACTIVE: 2,
    BUFF: 3,
    DEBUFF: 2,
    AID: 4,
    SUMMON: 3,
    STRATEGY: 3
    // PASSIVE는 AI가 직접 사용하는 스킬이 아니므로 점수 계산에서 제외됩니다.
};

// 스킬 태그별 추가 점수
export const SCORE_BY_TAG = {
    FIXED: 10,       // 확정 효과
    WILL_GUARD: 12,  // 의지 방패 (점수 상향)
    DELAY: 8,        // 행동 지연
    PROHIBITION: 7,  // 행동 금지
    HEAL: 8,         // 치유 (점수 상향)
    CHARGE: 4,       // 돌진
    KINETIC: 4,      // 넉백
    SACRIFICE: 9     // ✨ 희생 태그 추가
    // 기타 태그는 필요에 따라 추가할 수 있습니다.
};
