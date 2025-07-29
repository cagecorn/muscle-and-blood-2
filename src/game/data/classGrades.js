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
    // --- 다른 클래스 추가 예정 ---
    zombie: {
        meleeAttack: 2,
        rangedAttack: 1,
        magicAttack: 1,
        meleeDefense: 1,
        rangedDefense: 1,
        magicDefense: 1,
    }
};
