/**
 * 각 클래스의 공격/방어 등급을 정의합니다.
 * 등급: 3 (강함), 2 (보통), 1 (약함)
 */
export const ATTACK_TYPE = {
    MELEE: 'melee',
    RANGED: 'ranged',
    MAGIC: 'magic',
};

export const CLASS_GRADE_TYPE = {
    ATTACK: 'Attack',
    DEFENSE: 'Defense',
};

export const classGrades = {
    warrior: {
        meleeAttack: 3,
        rangedAttack: 1,
        magicAttack: 1,
        meleeDefense: 3,
        rangedDefense: 2,
        magicDefense: 1,
    },
    gunner: {
        meleeAttack: 1,
        rangedAttack: 3,
        magicAttack: 1,
        meleeDefense: 2,
        rangedDefense: 3,
        magicDefense: 1,
    },
    mechanic: {
        meleeAttack: 2,
        rangedAttack: 1,
        magicAttack: 2,
        meleeDefense: 2,
        rangedDefense: 2,
        magicDefense: 2,
    },
    medic: {
        meleeAttack: 1,
        rangedAttack: 1,
        magicAttack: 2,
        meleeDefense: 1,
        rangedDefense: 2,
        magicDefense: 3,
    },
    nanomancer: {
        meleeAttack: 1,
        rangedAttack: 2,
        magicAttack: 3,
        meleeDefense: 1,
        rangedDefense: 2,
        magicDefense: 3,
    },
    flyingmen: {
        meleeAttack: 3,
        rangedAttack: 1,
        magicAttack: 1,
        meleeDefense: 2,
        rangedDefense: 1,
        magicDefense: 2,
    },
    // ✨ [신규] 에스퍼 등급 추가
    esper: {
        meleeAttack: 1,
        rangedAttack: 2,
        magicAttack: 3,
        meleeDefense: 1,
        rangedDefense: 2,
        magicDefense: 3,
    },
    // ✨ [신규] 커맨더 등급 추가
    commander: {
        meleeAttack: 3,
        rangedAttack: 1,
        magicAttack: 1,
        meleeDefense: 3,
        rangedDefense: 2,
        magicDefense: 2,
    },
    clown: {
        meleeAttack: 2,
        rangedAttack: 2,
        magicAttack: 1,
        meleeDefense: 2,
        rangedDefense: 1,
        magicDefense: 1,
    },
    android: {
        meleeAttack: 3,
        rangedAttack: 1,
        magicAttack: 1,
        meleeDefense: 3,
        rangedDefense: 2,
        magicDefense: 2,
    },
    zombie: {
        meleeAttack: 2,
        rangedAttack: 1,
        magicAttack: 1,
        meleeDefense: 1,
        rangedDefense: 1,
        magicDefense: 1,
    },
    // --- ▼ [신규] 역병 의사 등급 추가 ▼ ---
    plagueDoctor: {
        meleeAttack: 2,  // 근접 공격은 보통
        rangedAttack: 1, // 원거리 공격은 약함
        magicAttack: 3,  // 마법(독) 공격에 강함
        meleeDefense: 2, // 근접 방어는 보통
        rangedDefense: 2, // 원거리 방어도 보통
        magicDefense: 3, // 마법 저항력은 높음
    },
    // --- ▲ [신규] 역병 의사 등급 추가 ▲ ---

    // --- ▼ [신규] 팔라딘 등급 추가 ▼ ---
    paladin: {
        meleeAttack: 3,
        rangedAttack: 1,
        magicAttack: 2,
        meleeDefense: 3,
        rangedDefense: 2,
        magicDefense: 3,
    },
    // --- ▲ [신규] 팔라딘 등급 추가 ▲ ---

    // --- ▼ [신규] 센티넬 등급 추가 ▼ ---
    sentinel: {
        meleeAttack: 2,
        rangedAttack: 1,
        magicAttack: 1,
        meleeDefense: 3,
        rangedDefense: 3,
        magicDefense: 2,
    }
    // --- ▲ [신규] 센티넬 등급 추가 ▲ ---
};
