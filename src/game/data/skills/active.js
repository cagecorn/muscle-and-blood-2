import { EFFECT_TYPES } from '../../utils/StatusEffectManager.js';

// 액티브 스킬 데이터 정의
export const activeSkills = {
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
        effect: {
            type: EFFECT_TYPES.STATUS_EFFECT,
            id: 'stun',
            duration: 2,
        },
    },
};
