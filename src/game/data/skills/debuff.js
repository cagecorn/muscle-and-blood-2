import { EFFECT_TYPES } from '../../utils/EffectTypes.js';
import { SKILL_TAGS } from '../../utils/SkillTagManager.js';

// 디버프 스킬 데이터 정의
export const debuffSkills = {
    shieldBreak: {
        yinYangValue: +2,
        // NORMAL 등급: 기본 효과
        NORMAL: {
            id: 'shieldBreak',
            name: '쉴드 브레이크',
            type: 'DEBUFF',
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.MELEE],
            cost: 2,
            targetType: 'enemy',
            description: '적에게 3턴간 받는 데미지 증가 {{increase}}% 디버프를 겁니다. (쿨타임 2턴)',
            illustrationPath: 'assets/images/skills/shield-break.png',
            cooldown: 2,
            range: 1,
            effect: {
                id: 'shieldBreak',
                type: EFFECT_TYPES.DEBUFF,
                duration: 3,
                modifiers: [ // 객체에서 배열로 수정
                    {
                        stat: 'damageIncrease',
                        type: 'percentage',
                        value: 0.15 // 4순위 기준 기본값
                    }
                ]
            }
        },
        // RARE 등급: 토큰 소모량 감소
        RARE: {
            id: 'shieldBreak',
            name: '쉴드 브레이크 [R]',
            type: 'DEBUFF',
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.MELEE],
            cost: 1, // 토큰 소모량 1로 감소
            targetType: 'enemy',
            description: '적에게 3턴간 받는 데미지 증가 {{increase}}% 디버프를 겁니다. (쿨타임 2턴)',
            illustrationPath: 'assets/images/skills/shield-break.png',
            cooldown: 2,
            range: 1,
            effect: {
                id: 'shieldBreak',
                type: EFFECT_TYPES.DEBUFF,
                duration: 3,
                modifiers: [ // 객체에서 배열로 수정
                    {
                        stat: 'damageIncrease',
                        type: 'percentage',
                        value: 0.15
                    }
                ]
            }
        },
        // EPIC 등급: 방어력 감소 효과 추가
        EPIC: {
            id: 'shieldBreak',
            name: '쉴드 브레이크 [E]',
            type: 'DEBUFF',
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.MELEE],
            cost: 1,
            targetType: 'enemy',
            description: '적에게 3턴간 받는 데미지 {{increase}}% 증가, 방어력 5% 감소 디버프를 겁니다. (쿨타임 2턴)',
            illustrationPath: 'assets/images/skills/shield-break.png',
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
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.MELEE],
            cost: 1,
            targetType: 'enemy',
            description: '적에게 3턴간 받는 데미지 {{increase}}% 증가, 방어력 10% 감소 디버프를 겁니다. (쿨타임 2턴)',
            illustrationPath: 'assets/images/skills/shield-break.png',
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
    // --- ▼ [신규] 컨퓨전 스킬 추가 ▼ ---
    confusion: {
        yinYangValue: +4, // 전장을 뒤흔드는 강력한 양(Yang)의 기술로 +4의 높은 점수를 부여했습니다.
        NORMAL: {
            id: 'confusion',
            name: '컨퓨전',
            type: 'DEBUFF',
            requiredClass: ['esper'], // 에스퍼 전용 스킬로 설정
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.MIND, SKILL_TAGS.PROHIBITION, SKILL_TAGS.SPECIAL],
            cost: 3,
            targetType: 'enemy',
            description: '적을 2턴간 [혼란] 상태로 만들어, 아군을 공격하게 만듭니다.',
            illustrationPath: 'assets/images/skills/confusion.png',
            cooldown: 3,
            range: 3,
            effect: {
                id: 'confusion',
                type: EFFECT_TYPES.STATUS_EFFECT,
                duration: 2,
            }
        },
        RARE: {
            id: 'confusion',
            name: '컨퓨전 [R]',
            type: 'DEBUFF',
            requiredClass: ['esper'],
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.MIND, SKILL_TAGS.PROHIBITION, SKILL_TAGS.SPECIAL],
            cost: 2, // 토큰 소모량 1 감소
            targetType: 'enemy',
            description: '적을 2턴간 [혼란] 상태로 만들어, 아군을 공격하게 만듭니다.',
            illustrationPath: 'assets/images/skills/confusion.png',
            cooldown: 3,
            range: 3,
            effect: {
                id: 'confusion',
                type: EFFECT_TYPES.STATUS_EFFECT,
                duration: 2,
            }
        },
        EPIC: {
            id: 'confusion',
            name: '컨퓨전 [E]',
            type: 'DEBUFF',
            requiredClass: ['esper'],
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.MIND, SKILL_TAGS.PROHIBITION, SKILL_TAGS.SPECIAL],
            cost: 2,
            targetType: 'enemy',
            description: '적을 2턴간 [혼란] 상태로 만들어, 아군을 공격하게 만듭니다.',
            illustrationPath: 'assets/images/skills/confusion.png',
            cooldown: 2, // 쿨타임 1 감소
            range: 4, // 사거리 1 증가
            effect: {
                id: 'confusion',
                type: EFFECT_TYPES.STATUS_EFFECT,
                duration: 2,
            }
        },
        LEGENDARY: {
            id: 'confusion',
            name: '컨퓨전 [L]',
            type: 'DEBUFF',
            requiredClass: ['esper'],
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.MIND, SKILL_TAGS.PROHIBITION, SKILL_TAGS.SPECIAL],
            cost: 2,
            targetType: 'enemy',
            description: '적을 2턴간 [혼란] 상태로 만들고, 대상의 공격력을 15% 감소시킵니다.',
            illustrationPath: 'assets/images/skills/confusion.png',
            cooldown: 2,
            range: 4,
            effect: {
                id: 'confusion',
                type: EFFECT_TYPES.STATUS_EFFECT,
                duration: 2,
                // 레전더리 등급에는 공격력 감소 디버프를 추가하여 더욱 강력하게 만들었습니다.
                modifiers: { stat: 'physicalAttack', type: 'percentage', value: -0.15 }
            }
        }
    },
    // --- ▲ [신규] 컨퓨전 스킬 추가 ▲ ---
};
