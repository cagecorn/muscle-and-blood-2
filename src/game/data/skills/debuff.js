import { EFFECT_TYPES } from '../../utils/StatusEffectManager.js';
import { SKILL_TAGS } from '../../utils/SkillTagManager.js';

// 디버프 스킬 데이터 정의
export const debuffSkills = {
    shieldBreak: {
        // NORMAL 등급: 기본 효과
        NORMAL: {
            id: 'shieldBreak',
            name: '쉴드 브레이크',
            type: 'DEBUFF',
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.WEAKEN],
            cost: 2,
            targetType: 'enemy',
            description: '적에게 3턴간 받는 데미지 증가 {{increase}}% 디버프를 겁니다. (쿨타임 2턴)',
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
                    value: 0.15 // 4순위 기준 기본값
                }
            }
        },
        // RARE 등급: 토큰 소모량 감소
        RARE: {
            id: 'shieldBreak',
            name: '쉴드 브레이크 [R]',
            type: 'DEBUFF',
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.WEAKEN],
            cost: 1, // 토큰 소모량 1로 감소
            targetType: 'enemy',
            description: '적에게 3턴간 받는 데미지 증가 {{increase}}% 디버프를 겁니다. (쿨타임 2턴)',
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
        // EPIC 등급: 방어력 감소 효과 추가
        EPIC: {
            id: 'shieldBreak',
            name: '쉴드 브레이크 [E]',
            type: 'DEBUFF',
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.WEAKEN],
            cost: 1,
            targetType: 'enemy',
            description: '적에게 3턴간 받는 데미지 {{increase}}% 증가, 방어력 5% 감소 디버프를 겁니다. (쿨타임 2턴)',
            illustrationPath: 'assets/images/skills/shield-break.png',
            requiredClass: 'warrior',
            cooldown: 2,
            range: 1,
            effect: {
                id: 'shieldBreak',
                type: EFFECT_TYPES.DEBUFF,
                duration: 3,
                // 여러 효과를 적용하기 위해 modifiers를 배열로 변경
                modifiers: [
                    { stat: 'damageIncrease', type: 'percentage', value: 0.15 },
                    { stat: 'physicalDefense', type: 'percentage', value: -0.05 } // 방어력 5% 감소
                ]
            }
        },
        // LEGENDARY 등급: 방어력 감소 효과 강화
        LEGENDARY: {
            id: 'shieldBreak',
            name: '쉴드 브레이크 [L]',
            type: 'DEBUFF',
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.WEAKEN],
            cost: 1,
            targetType: 'enemy',
            description: '적에게 3턴간 받는 데미지 {{increase}}% 증가, 방어력 10% 감소 디버프를 겁니다. (쿨타임 2턴)',
            illustrationPath: 'assets/images/skills/shield-break.png',
            requiredClass: 'warrior',
            cooldown: 2,
            range: 1,
            effect: {
                id: 'shieldBreak',
                type: EFFECT_TYPES.DEBUFF,
                duration: 3,
                modifiers: [
                    { stat: 'damageIncrease', type: 'percentage', value: 0.15 },
                    { stat: 'physicalDefense', type: 'percentage', value: -0.10 } // 방어력 10% 감소
                ]
            }
        }
    },
    stigma: {
        NORMAL: {
            id: 'stigma',
            name: '낙인',
            type: 'DEBUFF',
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.PROHIBITION, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '가장 멀리 있는 체력이 가장 낮은 적 1명에게 3턴간 [치료 금지] 디버프를 겁니다.',
            illustrationPath: 'assets/images/skills/stigma.png',
            requiredClass: 'medic',
            cooldown: 5,
            range: 10,
            resourceCost: { type: 'IRON', amount: 3 },
            effect: { id: 'stigma', type: EFFECT_TYPES.DEBUFF, duration: 3 }
        },
        RARE: {
            id: 'stigma',
            name: '낙인 [R]',
            type: 'DEBUFF',
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.PROHIBITION, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '가장 멀리 있는 체력이 가장 낮은 적 1명에게 3턴간 [치료 금지] 디버프를 겁니다. (쿨타임 4턴)',
            illustrationPath: 'assets/images/skills/stigma.png',
            requiredClass: 'medic',
            cooldown: 4,
            range: 10,
            resourceCost: { type: 'IRON', amount: 3 },
            effect: { id: 'stigma', type: EFFECT_TYPES.DEBUFF, duration: 3 }
        },
        EPIC: {
            id: 'stigma',
            name: '낙인 [E]',
            type: 'DEBUFF',
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.PROHIBITION, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '가장 멀리 있는 체력이 가장 낮은 적 1명에게 3턴간 [치료 금지] 디버프를 겁니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/stigma.png',
            requiredClass: 'medic',
            cooldown: 3,
            range: 10,
            resourceCost: { type: 'IRON', amount: 3 },
            effect: { id: 'stigma', type: EFFECT_TYPES.DEBUFF, duration: 3 }
        },
        LEGENDARY: {
            id: 'stigma',
            name: '낙인 [L]',
            type: 'DEBUFF',
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.PROHIBITION, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '가장 멀리 있는 체력이 가장 낮은 적 2명에게 3턴간 [치료 금지] 디버프를 겁니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/stigma.png',
            requiredClass: 'medic',
            cooldown: 3,
            range: 10,
            resourceCost: { type: 'IRON', amount: 3 },
            numberOfTargets: 2,
            effect: { id: 'stigma', type: EFFECT_TYPES.DEBUFF, duration: 3 }
        }
    }
};
