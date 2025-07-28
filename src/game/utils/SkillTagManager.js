/**
 * 게임에 사용되는 모든 스킬 태그를 정의하고 관리합니다.
 * 태그는 스킬의 속성을 나타내며, 다른 스킬(주로 패시브)이나 시스템이
 * 특정 종류의 스킬을 식별하고 상호작용하는 데 사용됩니다.
 */
export const SKILL_TAGS = {
    // 스킬 타입 (SkillEngine의 SKILL_TYPES와는 별개로 세분화된 태그)
    ACTIVE: '액티브',
    PASSIVE: '패시브',
    BUFF: '버프',
    DEBUFF: '디버프',
    AID: '지원',

    // 공격 속성
    PHYSICAL: '물리',
    MAGIC: '마법',

    // 사거리 타입
    MELEE: '근접',
    RANGED: '원거리',

    // 행동 타입
    CHARGE: '돌진',
    KINETIC: '관성',
    WEAKEN: '쇠약',
    HEAL: '치유',

    // 원소/개념 속성
    EARTH: '대지',
    WILL: '의지',
    IRON: '철',
    PRODUCTION: '생산',
    THROWING: '투척',
};

// 실제 코드에서는 위 객체를 직접 import하여 사용하면 됩니다.
// 이 파일은 중앙에서 태그의 종류를 관리하는 역할을 합니다.
