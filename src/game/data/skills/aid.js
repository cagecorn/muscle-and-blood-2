import { EFFECT_TYPES } from '../../utils/EffectTypes.js';
import { SKILL_TAGS } from '../../utils/SkillTagManager.js';

// 지원(AID) 스킬 데이터 정의
export const aidSkills = {
    heal: {
        yinYangValue: +2,
        NORMAL: {
            id: 'heal',
            name: '힐',
            type: 'AID',
            tags: [SKILL_TAGS.AID, SKILL_TAGS.RANGED, SKILL_TAGS.HEAL],
            cost: 1,
            targetType: 'ally',
            description: '아군 하나의 체력을 {{heal}}만큼 회복시킵니다.',
            illustrationPath: 'assets/images/skills/heal.png',
            cooldown: 0,
            range: 2,
            healMultiplier: { min: 0.9, max: 1.1 },
        },
        RARE: {
            id: 'heal',
            name: '힐 [R]',
            type: 'AID',
            tags: [SKILL_TAGS.AID, SKILL_TAGS.RANGED, SKILL_TAGS.HEAL],
            cost: 0,
            targetType: 'ally',
            description: '아군 하나의 체력을 {{heal}}만큼 회복시킵니다.',
            illustrationPath: 'assets/images/skills/heal.png',
            cooldown: 0,
            range: 2,
            healMultiplier: { min: 0.9, max: 1.1 },
        },
        EPIC: {
            id: 'heal',
            name: '힐 [E]',
            type: 'AID',
            tags: [SKILL_TAGS.AID, SKILL_TAGS.RANGED, SKILL_TAGS.HEAL],
            cost: 0,
            targetType: 'ally',
            description: '아군 하나의 체력을 {{heal}}만큼 회복시키고, 50% 확률로 해로운 효과 1개를 제거합니다.',
            illustrationPath: 'assets/images/skills/heal.png',
            cooldown: 0,
            range: 2,
            healMultiplier: { min: 0.9, max: 1.1 },
            removesDebuff: { chance: 0.5 }
        },
        LEGENDARY: {
            id: 'heal',
            name: '힐 [L]',
            type: 'AID',
            tags: [SKILL_TAGS.AID, SKILL_TAGS.RANGED, SKILL_TAGS.HEAL],
            cost: 0,
            targetType: 'ally',
            description: '아군 하나의 체력을 {{heal}}만큼 회복시키고, 100% 확률로 해로운 효과 1개를 제거합니다.',
            illustrationPath: 'assets/images/skills/heal.png',
            cooldown: 0,
            range: 2,
            healMultiplier: { min: 0.9, max: 1.1 },
            removesDebuff: { chance: 1.0 }
        }
    },
    // --- ▼ [신규] 윌 가드 스킬 추가 ▼ ---
    willGuard: {
        yinYangValue: +3,
        NORMAL: {
            id: 'willGuard',
            name: '윌 가드',
            type: 'AID',
            requiredClass: ['medic', 'paladin'],
            tags: [SKILL_TAGS.AID, SKILL_TAGS.RANGED, SKILL_TAGS.WILL_GUARD, SKILL_TAGS.FIXED, SKILL_TAGS.HEAL],
            cost: 3,
            targetType: 'ally',
            description: '아군에게 {{heal}}의 치유를 하고, 다음 2회의 공격을 [확정 막기]로 만듭니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/shield-buff.png',
            cooldown: 3,
            range: 3,
            healMultiplier: { min: 0.45, max: 0.55 },
            effect: {
                id: 'willGuard',
                type: EFFECT_TYPES.BUFF,
                stack: { type: 'BLOCK', amount: 2 }
            }
        },
        RARE: {
            id: 'willGuard',
            name: '윌 가드 [R]',
            type: 'AID',
            requiredClass: ['medic', 'paladin'],
            tags: [SKILL_TAGS.AID, SKILL_TAGS.RANGED, SKILL_TAGS.WILL_GUARD, SKILL_TAGS.FIXED, SKILL_TAGS.HEAL],
            cost: 2,
            targetType: 'ally',
            description: '아군에게 {{heal}}의 치유를 하고, 다음 2회의 공격을 [확정 막기]로 만듭니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/shield-buff.png',
            cooldown: 3,
            range: 3,
            healMultiplier: { min: 0.45, max: 0.55 },
            effect: {
                id: 'willGuard',
                type: EFFECT_TYPES.BUFF,
                stack: { type: 'BLOCK', amount: 2 }
            }
        },
        EPIC: {
            id: 'willGuard',
            name: '윌 가드 [E]',
            type: 'AID',
            requiredClass: ['medic', 'paladin'],
            tags: [SKILL_TAGS.AID, SKILL_TAGS.RANGED, SKILL_TAGS.WILL_GUARD, SKILL_TAGS.FIXED, SKILL_TAGS.HEAL],
            cost: 2,
            targetType: 'ally',
            description: '아군에게 {{heal}}의 치유를 하고, 다음 3회의 공격을 [확정 막기]로 만듭니다. (쿨타임 2턴)',
            illustrationPath: 'assets/images/skills/shield-buff.png',
            cooldown: 2,
            range: 4,
            healMultiplier: { min: 0.45, max: 0.55 },
            effect: {
                id: 'willGuard',
                type: EFFECT_TYPES.BUFF,
                stack: { type: 'BLOCK', amount: 3 }
            }
        },
        LEGENDARY: {
            id: 'willGuard',
            name: '윌 가드 [L]',
            type: 'AID',
            requiredClass: ['medic', 'paladin'],
            tags: [SKILL_TAGS.AID, SKILL_TAGS.RANGED, SKILL_TAGS.WILL_GUARD, SKILL_TAGS.FIXED, SKILL_TAGS.HEAL],
            cost: 2,
            targetType: 'ally',
            description: '아군에게 {{heal}}의 치유를 하고, 다음 3회의 공격을 [확정 막기]로 만듭니다. 보호막이 활성화된 동안 [지혜]가 10% 증가합니다. (쿨타임 2턴)',
            illustrationPath: 'assets/images/skills/shield-buff.png',
            cooldown: 2,
            range: 4,
            healMultiplier: { min: 0.45, max: 0.55 },
            effect: {
                id: 'willGuard',
                type: EFFECT_TYPES.BUFF,
                stack: { type: 'BLOCK', amount: 3 },
                modifiers: {
                    stat: 'wisdom',
                    type: 'percentage',
                    value: 0.10
                }
            }
        }
    },
    // --- ▲ [신규] 윌 가드 스킬 추가 ▲ ---

    // --- ▼ [신규] 마이티 쉴드 스킬 추가 ▼ ---
    mightyShield: {
        yinYangValue: +4,
        NORMAL: {
            id: 'mightyShield',
            name: '마이티 쉴드',
            type: 'AID',
            tags: [SKILL_TAGS.AID, SKILL_TAGS.WILL_GUARD, SKILL_TAGS.FIXED, SKILL_TAGS.LIGHT, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'ally',
            description: '아군에게 2회의 공격을 완벽하게 막아내는 빛의 방패를 부여합니다. (쿨타임 10턴, 소모 자원: 빛 5)',
            illustrationPath: 'assets/images/skills/mighty-shield.png',
            cooldown: 10,
            range: 3,
            resourceCost: { type: 'LIGHT', amount: 5 },
            effect: {
                id: 'mightyShield',
                type: EFFECT_TYPES.BUFF,
                stack: { type: 'DAMAGE_IMMUNITY', amount: 2 }
            }
        },
        RARE: {
            id: 'mightyShield',
            name: '마이티 쉴드 [R]',
            type: 'AID',
            tags: [SKILL_TAGS.AID, SKILL_TAGS.WILL_GUARD, SKILL_TAGS.FIXED, SKILL_TAGS.LIGHT, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'ally',
            description: '아군에게 3회의 공격을 완벽하게 막아내는 빛의 방패를 부여합니다. (쿨타임 9턴, 소모 자원: 빛 5)',
            illustrationPath: 'assets/images/skills/mighty-shield.png',
            cooldown: 9,
            range: 3,
            resourceCost: { type: 'LIGHT', amount: 5 },
            effect: {
                id: 'mightyShield',
                type: EFFECT_TYPES.BUFF,
                stack: { type: 'DAMAGE_IMMUNITY', amount: 3 }
            }
        },
        EPIC: {
            id: 'mightyShield',
            name: '마이티 쉴드 [E]',
            type: 'AID',
            tags: [SKILL_TAGS.AID, SKILL_TAGS.WILL_GUARD, SKILL_TAGS.FIXED, SKILL_TAGS.LIGHT, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'ally',
            description: '아군에게 4회의 공격을 완벽하게 막아내는 빛의 방패를 부여합니다. (쿨타임 8턴, 소모 자원: 빛 4)',
            illustrationPath: 'assets/images/skills/mighty-shield.png',
            cooldown: 8,
            range: 4,
            resourceCost: { type: 'LIGHT', amount: 4 },
            effect: {
                id: 'mightyShield',
                type: EFFECT_TYPES.BUFF,
                stack: { type: 'DAMAGE_IMMUNITY', amount: 4 }
            }
        },
        LEGENDARY: {
            id: 'mightyShield',
            name: '마이티 쉴드 [L]',
            type: 'AID',
            tags: [SKILL_TAGS.AID, SKILL_TAGS.WILL_GUARD, SKILL_TAGS.FIXED, SKILL_TAGS.LIGHT, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'ally',
            description: '아군에게 5회의 공격을 완벽하게 막아내는 빛의 방패를 부여하고, 대상의 해로운 효과를 1개 제거합니다. (쿨타임 7턴, 소모 자원: 빛 4)',
            illustrationPath: 'assets/images/skills/mighty-shield.png',
            cooldown: 7,
            range: 4,
            resourceCost: { type: 'LIGHT', amount: 4 },
            removesDebuff: { chance: 1.0 },
            effect: {
                id: 'mightyShield',
                type: EFFECT_TYPES.BUFF,
                stack: { type: 'DAMAGE_IMMUNITY', amount: 5 }
            }
        }
    }
    // --- ▲ [신규] 마이티 쉴드 스킬 추가 ▲ ---
};
