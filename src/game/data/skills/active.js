import { EFFECT_TYPES } from '../../utils/StatusEffectManager.js';

// 액티브 스킬 데이터 정의
export const activeSkills = {
    // 기본 공격 스킬
    attack: {
        NORMAL: {
            id: 'attack',
            name: '공격',
            type: 'ACTIVE',
            cost: 1, // SKILL-SYSTEM.md 규칙에 따라 토큰 1개 소모
            description: '적을 100% 공격력으로 공격합니다.',
            illustrationPath: 'assets/images/skills/rending_strike.png',
            requiredClass: null,
            damageMultiplier: 1.0,
            cooldown: 0,
            range: 1,
        },
        RARE: {
            id: 'attack',
            name: '공격 [R]',
            type: 'ACTIVE',
            cost: 0,
            description: '적을 100% 공격력으로 공격합니다.',
            illustrationPath: 'assets/images/skills/rending_strike.png',
            requiredClass: null,
            damageMultiplier: 1.0,
            cooldown: 0,
            range: 1,
        },
        EPIC: {
            id: 'attack',
            name: '공격 [E]',
            type: 'ACTIVE',
            cost: 0,
            description: '적을 100% 공격력으로 공격하고, 50% 확률로 토큰 1개를 생성합니다.',
            illustrationPath: 'assets/images/skills/rending_strike.png',
            requiredClass: null,
            damageMultiplier: 1.0,
            cooldown: 0,
            range: 1,
            generatesToken: { chance: 0.5, amount: 1 }
        },
        LEGENDARY: {
            id: 'attack',
            name: '공격 [L]',
            type: 'ACTIVE',
            cost: 0,
            description: '적을 100% 공격력으로 공격하고, 100% 확률로 토큰 1개를 생성합니다.',
            illustrationPath: 'assets/images/skills/rending_strike.png',
            requiredClass: null,
            damageMultiplier: 1.0,
            cooldown: 0,
            range: 1,
            generatesToken: { chance: 1.0, amount: 1 }
        }
    },
    charge: {
        NORMAL: {
            id: 'charge',
            name: '차지',
            type: 'ACTIVE',
            cost: 2,
            description: '적을 80%의 데미지로 공격하고, 1턴간 기절 시킵니다.',
            illustrationPath: 'assets/images/skills/charge.png',
            requiredClass: 'warrior',
            damageMultiplier: 0.8,
            cooldown: 3,
            range: 1,
            effect: {
                type: EFFECT_TYPES.STATUS_EFFECT,
                id: 'stun',
                duration: 1,
            },
        },
        RARE: {
            id: 'charge',
            name: '차지 [R]',
            type: 'ACTIVE',
            cost: 2,
            description: '적을 80%의 데미지로 공격하고, 1턴간 기절 시킵니다.',
            illustrationPath: 'assets/images/skills/charge.png',
            requiredClass: 'warrior',
            damageMultiplier: 0.8,
            cooldown: 2,
            range: 1,
            effect: {
                type: EFFECT_TYPES.STATUS_EFFECT,
                id: 'stun',
                duration: 1,
            },
        },
        EPIC: {
            id: 'charge',
            name: '차지 [E]',
            type: 'ACTIVE',
            cost: 1,
            description: '적을 80%의 데미지로 공격하고, 1턴간 기절 시킵니다.',
            illustrationPath: 'assets/images/skills/charge.png',
            requiredClass: 'warrior',
            damageMultiplier: 0.8,
            cooldown: 2,
            range: 1,
            effect: {
                type: EFFECT_TYPES.STATUS_EFFECT,
                id: 'stun',
                duration: 1,
            },
        },
        LEGENDARY: {
            id: 'charge',
            name: '차지 [L]',
            type: 'ACTIVE',
            cost: 1,
            description: '적을 80%의 데미지로 공격하고, 2턴간 기절 시킵니다.',
            illustrationPath: 'assets/images/skills/charge.png',
            requiredClass: 'warrior',
            damageMultiplier: 0.8,
            cooldown: 2,
            range: 1,
            effect: {
                type: EFFECT_TYPES.STATUS_EFFECT,
                id: 'stun',
                duration: 2,
            },
        }
    },
};
