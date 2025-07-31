/**
 * 게임에 등장하는 모든 아이템의 기본 데이터와
 * 무작위로 부여될 수 있는 접두사, 접미사,
 * 그리고 등급별로 적용 가능한 MBTI 특성 효과를 정의하는 파일
 */

// 아이템이 장착될 수 있는 부위 정의
export const EQUIPMENT_SLOTS = {
    WEAPON: '무기',
    ARMOR: '갑옷',
    ACCESSORY: '장신구'
};

// 1. 장비 기본 스탯 데이터베이스
export const itemBaseData = {
    // --- 무기 ---
    axe: {
        id: 'axe',
        name: '도끼',
        type: EQUIPMENT_SLOTS.WEAPON,
        illustrationPath: 'assets/images/item/throwing-axe.png',
        baseStats: {
            physicalAttack: { min: 8, max: 12 }
        },
        weight: 10
    },
    baseballBat: {
        id: 'baseballBat',
        name: '야구 방망이',
        type: EQUIPMENT_SLOTS.WEAPON,
        illustrationPath: 'assets/images/item/baseball-bat.png',
        baseStats: {
            physicalAttack: { min: 6, max: 9 }
        },
        weight: 8
    },

    // --- 방어구 ---
    plateArmor: {
        id: 'plateArmor',
        name: '판금 갑옷',
        type: EQUIPMENT_SLOTS.ARMOR,
        illustrationPath: 'assets/images/item/plate-armor.png',
        baseStats: {
            physicalDefense: { min: 15, max: 20 },
            hp: { min: 20, max: 30 }
        },
        weight: 25
    }
};

// 2. 장비 접두사/접미사 부가 스탯 데이터베이스
export const itemAffixes = {
    // --- 접두사 (주로 공격, 성능 관련) ---
    prefixes: [
        { name: '날카로운', stat: 'criticalChance', value: { min: 3, max: 5 } },
        { name: '파괴적인', stat: 'criticalDamageMultiplier', value: { min: 10, max: 15 } },
        { name: '맹공의', stat: 'physicalAttack', value: { min: 5, max: 8 }, isPercentage: true },
        { name: '마력의', stat: 'magicAttack', value: { min: 5, max: 8 }, isPercentage: true },
        { name: '정밀한', stat: 'accuracy', value: { min: 5, max: 10 } }
    ],

    // --- 접미사 (주로 방어, 유틸리티 관련) ---
    suffixes: [
        { name: '견고함의', stat: 'physicalDefense', value: { min: 5, max: 8 }, isPercentage: true },
        { name: '회피의', stat: 'physicalEvadeChance', value: { min: 3, max: 5 } },
        { name: '재생의', stat: 'hpRegen', value: { min: 5, max: 10 } },
        { name: '흡혈의', stat: 'lifeSteal', value: { min: 2, max: 4 } },
        { name: '끈기의', stat: 'aspirationDecayReduction', value: { min: 10, max: 15 } }
    ]
};

// --- ▼ [신규] MBTI 성향별 등급 효과 데이터베이스 ▼ ---
export const mbtiGradeEffects = {
    E: [{ trait: 'E', description: '외향형 장착 시, 주변 아군 수 비례 공격력 +{value}%', stat: 'physicalAttackPercentagePerAlly', value: { min: 1, max: 2 } }],
    I: [{ trait: 'I', description: '내향형 장착 시, 스킬 토큰 소모량 -{value}%', stat: 'tokenCostReduction', value: { min: 5, max: 10 } }],
    S: [{ trait: 'S', description: '감각형 장착 시, 명중률 +{value}', stat: 'accuracy', value: { min: 5, max: 10 } }],
    N: [{ trait: 'N', description: '직관형 장착 시, 스킬 효과 지속시간 +{value}턴', stat: 'effectDuration', value: { min: 1, max: 1 } }],
    T: [{ trait: 'T', description: '사고형 장착 시, 받는 치명타 피해량 -{value}%', stat: 'criticalDamageReduction', value: { min: 10, max: 15 } }],
    F: [{ trait: 'F', description: '감정형 장착 시, 아군에게 주는 치유량 +{value}%', stat: 'healingGivenPercentage', value: { min: 5, max: 10 } }],
    J: [{ trait: 'J', description: '판단형 장착 시, 모든 스킬 재사용 대기시간 -{value}턴', stat: 'cooldownReduction', value: { min: 1, max: 1 } }],
    P: [{ trait: 'P', description: '인식형 장착 시, {value}% 확률로 토큰 미소모', stat: 'tokenFreeChance', value: { min: 5, max: 10 } }]
};
