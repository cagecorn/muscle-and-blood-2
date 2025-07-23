import { EFFECT_TYPES } from '../../utils/StatusEffectManager.js';

// 액티브 스킬 데이터 정의
export const activeSkills = {
    // 기본 공격 스킬
    attack: {
        id: 'attack',
        name: '공격',
        type: 'ACTIVE',
        cost: 1, // SKILL-SYSTEM.md 규칙에 따라 토큰 1개 소모
        description: '가장 기본적인 공격입니다.',
        illustrationPath: 'assets/images/skills/rending_strike.png',
        requiredClass: null,
        damageMultiplier: 1.0,
        cooldown: 0,
        range: 1,
    },
    charge: {
        id: 'charge',
        name: '차지',
        type: 'ACTIVE',
        cost: 2,
        // 적에게 돌진하여 데미지를 주고 2턴간 기절시키는 스킬
        description: '적에게 돌진하여 120%의 데미지를 주고 2턴간 기절시킵니다. (쿨타임 2턴)',
        illustrationPath: 'assets/images/skills/charge.png',
        requiredClass: 'warrior',
        damageMultiplier: 1.2,
        cooldown: 2,
        range: 1,
        effect: {
            type: EFFECT_TYPES.STATUS_EFFECT,
            id: 'stun',
            duration: 2,
        },
    },
};
