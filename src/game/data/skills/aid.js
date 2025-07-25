import { EFFECT_TYPES } from '../../utils/StatusEffectManager.js';

// 지원(AID) 스킬 데이터 정의
export const aidSkills = {
    heal: {
        NORMAL: {
            id: 'heal',
            name: '힐',
            type: 'AID',
            cost: 1,
            targetType: 'ally',
            description: '아군 하나의 체력을 {{heal}}만큼 회복시킵니다.',
            illustrationPath: 'assets/images/skills/heal.png',
            requiredClass: 'medic',
            cooldown: 0,
            range: 2,
            healMultiplier: 1.0,
        },
        RARE: {
            id: 'heal',
            name: '힐 [R]',
            type: 'AID',
            cost: 0,
            targetType: 'ally',
            description: '아군 하나의 체력을 {{heal}}만큼 회복시킵니다.',
            illustrationPath: 'assets/images/skills/heal.png',
            requiredClass: 'medic',
            cooldown: 0,
            range: 2,
            healMultiplier: 1.0,
        },
        EPIC: {
            id: 'heal',
            name: '힐 [E]',
            type: 'AID',
            cost: 0,
            targetType: 'ally',
            description: '아군 하나의 체력을 {{heal}}만큼 회복시키고, 50% 확률로 해로운 효과 1개를 제거합니다.',
            illustrationPath: 'assets/images/skills/heal.png',
            requiredClass: 'medic',
            cooldown: 0,
            range: 2,
            healMultiplier: 1.0,
            removesDebuff: { chance: 0.5 }
        },
        LEGENDARY: {
            id: 'heal',
            name: '힐 [L]',
            type: 'AID',
            cost: 0,
            targetType: 'ally',
            description: '아군 하나의 체력을 {{heal}}만큼 회복시키고, 100% 확률로 해로운 효과 1개를 제거합니다.',
            illustrationPath: 'assets/images/skills/heal.png',
            requiredClass: 'medic',
            cooldown: 0,
            range: 2,
            healMultiplier: 1.0,
            removesDebuff: { chance: 1.0 }
        }
    }
};
