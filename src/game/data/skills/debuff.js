import { EFFECT_TYPES } from '../../utils/StatusEffectManager.js';

// 디버프 스킬 데이터 정의
export const debuffSkills = {
    shieldBreak: {
        id: 'shieldBreak',
        name: '쉴드 브레이크',
        type: 'DEBUFF',
        cost: 2,
        targetType: 'enemy',
        description: '적에게 3턴간 받는 데미지 15% 증가 디버프를 겁니다. (쿨타임 2턴)',
        illustrationPath: 'assets/images/skills/shield-break.png',
        requiredClass: 'warrior',
        cooldown: 2,
        range: 1,
        effect: {
            id: 'shieldBreak',
            type: EFFECT_TYPES.DEBUFF,
            duration: 3,
            modifiers: {
                stat: 'damageIncrease',
                type: 'percentage',
                value: 0.15
            }
        }
    },
};
