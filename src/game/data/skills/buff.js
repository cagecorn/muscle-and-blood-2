import { EFFECT_TYPES } from '../../utils/EffectTypes.js';
import { SKILL_TAGS } from '../../utils/SkillTagManager.js';

// 버프 스킬 데이터 정의
export const buffSkills = {
    stoneSkin: {
        yinYangValue: +2,
        // NORMAL 등급: 기본 효과
        NORMAL: {
            id: 'stoneSkin',
            name: '스톤 스킨',
            type: 'BUFF',
            requiredClass: ['warrior', 'sentinel'],
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.EARTH, SKILL_TAGS.PRODUCTION],
            cost: 2,
            targetType: 'self',
            description: '4턴간 자신에게 데미지 감소 {{reduction}}% 버프를 겁니다. 공유 자원 [대지]를 1개 생산합니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/ston-skin.png',
            cooldown: 3,
            generatesResource: { type: 'EARTH', amount: 1 },
            effect: {
                id: 'stoneSkin',
                type: EFFECT_TYPES.BUFF,
                duration: 4,
                modifiers: {
                    stat: 'damageReduction',
                    type: 'percentage',
                    value: 0.15
                }
            }
        },
        // RARE 등급: 토큰 소모량 감소
        RARE: {
            id: 'stoneSkin',
            name: '스톤 스킨 [R]',
            type: 'BUFF',
            requiredClass: ['warrior', 'sentinel'],
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.EARTH, SKILL_TAGS.PRODUCTION],
            cost: 1,
            targetType: 'self',
            description: '4턴간 자신에게 데미지 감소 {{reduction}}% 버프를 겁니다. 공유 자원 [대지]를 1개 생산합니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/ston-skin.png',
            cooldown: 3,
            generatesResource: { type: 'EARTH', amount: 1 },
            effect: {
                id: 'stoneSkin',
                type: EFFECT_TYPES.BUFF,
                duration: 4,
                modifiers: {
                    stat: 'damageReduction',
                    type: 'percentage',
                    value: 0.15
                }
            }
        },
        // EPIC 등급: 방어력 상승 효과 추가
        EPIC: {
            id: 'stoneSkin',
            name: '스톤 스킨 [E]',
            type: 'BUFF',
            requiredClass: ['warrior', 'sentinel'],
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.EARTH, SKILL_TAGS.PRODUCTION],
            cost: 1,
            targetType: 'self',
            description: '4턴간 자신에게 데미지 감소 {{reduction}}%, 방어력 상승 10% 버프를 겁니다. 공유 자원 [대지]를 1개 생산합니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/ston-skin.png',
            cooldown: 3,
            generatesResource: { type: 'EARTH', amount: 1 },
            effect: {
                id: 'stoneSkin',
                type: EFFECT_TYPES.BUFF,
                duration: 4,
                // 여러 효과를 적용할 수 있도록 modifiers를 배열로 변경
                modifiers: [
                    { stat: 'damageReduction', type: 'percentage', value: 0.15 },
                    { stat: 'physicalDefense', type: 'percentage', value: 0.10 }
                ]
            }
        },
        // LEGENDARY 등급: 방어력 상승 효과 강화
        LEGENDARY: {
            id: 'stoneSkin',
            name: '스톤 스킨 [L]',
            type: 'BUFF',
            requiredClass: ['warrior', 'sentinel'],
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.EARTH, SKILL_TAGS.PRODUCTION],
            cost: 1,
            targetType: 'self',
            description: '4턴간 자신에게 데미지 감소 {{reduction}}%, 방어력 상승 15% 버프를 겁니다. 공유 자원 [대지]를 1개 생산합니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/ston-skin.png',
            cooldown: 3,
            generatesResource: { type: 'EARTH', amount: 1 },
            effect: {
                id: 'stoneSkin',
                type: EFFECT_TYPES.BUFF,
                duration: 4,
                modifiers: [
                    { stat: 'damageReduction', type: 'percentage', value: 0.15 },
                    { stat: 'physicalDefense', type: 'percentage', value: 0.15 }
                ]
            }
        }
    },
    grindstone: {
        yinYangValue: +1,
        NORMAL: {
            id: 'grindstone',
            name: '숯돌 갈기',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.IRON, SKILL_TAGS.PRODUCTION],
            cost: 1,
            targetType: 'self',
            description: '날카롭게 벼려낸 칼날이 번뜩입니다. 1턴간 자신의 공격력을 {{attackBonus}}% 상승시키고 공유 자원 [철]을 1개 생산합니다.',
            illustrationPath: 'assets/images/skills/grindstone.png',
            cooldown: 2,
            generatesResource: { type: 'IRON', amount: 1 },
            effect: {
                id: 'grindstoneBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                modifiers: {
                    stat: 'physicalAttack',
                    type: 'percentage',
                    value: 0.10
                }
            }
        },
        RARE: {
            id: 'grindstone',
            name: '숯돌 갈기 [R]',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.IRON, SKILL_TAGS.PRODUCTION],
            cost: 1,
            targetType: 'self',
            description: '숙련된 솜씨로 무기를 손질합니다. 1턴간 자신의 공격력을 {{attackBonus}}% 상승시키고 [철]을 1개 생산합니다. (쿨타임 1턴)',
            illustrationPath: 'assets/images/skills/grindstone.png',
            cooldown: 1,
            generatesResource: { type: 'IRON', amount: 1 },
            effect: {
                id: 'grindstoneBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                modifiers: {
                    stat: 'physicalAttack',
                    type: 'percentage',
                    value: 0.10
                }
            }
        },
        EPIC: {
            id: 'grindstone',
            name: '숯돌 갈기 [E]',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.IRON, SKILL_TAGS.PRODUCTION],
            cost: 0,
            targetType: 'self',
            description: '순식간에 무기를 최상의 상태로 만듭니다. 1턴간 자신의 공격력을 {{attackBonus}}% 상승시키고 [철]을 1개 생산합니다.',
            illustrationPath: 'assets/images/skills/grindstone.png',
            cooldown: 1,
            generatesResource: { type: 'IRON', amount: 1 },
            effect: {
                id: 'grindstoneBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                modifiers: {
                    stat: 'physicalAttack',
                    type: 'percentage',
                    value: 0.10
                }
            }
        },
        LEGENDARY: {
            id: 'grindstone',
            name: '숯돌 갈기 [L]',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.IRON, SKILL_TAGS.PRODUCTION],
            cost: 0,
            targetType: 'self',
            description: '장인의 경지에 이른 연마술입니다. 1턴간 자신의 공격력을 {{attackBonus}}% 상승시키고 [철]을 2개 생산합니다.',
            illustrationPath: 'assets/images/skills/grindstone.png',
            cooldown: 1,
            generatesResource: { type: 'IRON', amount: 2 },
            effect: {
                id: 'grindstoneBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                modifiers: {
                    stat: 'physicalAttack',
                    type: 'percentage',
                    value: 0.10
                }
            }
        }
    },

    // --- ▼ [신규] 전투의 함성 스킬 추가 ▼ ---
    battleCry: {
        yinYangValue: +2,
        NORMAL: {
            id: 'battleCry',
            name: '전투의 함성',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.WILL],
            cost: 2,
            targetType: 'self',
            description: '2턴간 자신의 [공격력]을 {{attackBonus}}% 상승시키고, [근접 공격 등급]을 +1 상승시킵니다.',
            illustrationPath: 'assets/images/skills/battle_cry.png',
            cooldown: 3,
            effect: {
                id: 'battleCryBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 2,
                modifiers: [
                    { stat: 'physicalAttack', type: 'percentage', value: 0.15 },
                    { stat: 'meleeAttack', type: 'flat', value: 1 }
                ]
            }
        },
        RARE: {
            id: 'battleCry',
            name: '전투의 함성 [R]',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.WILL],
            cost: 1,
            targetType: 'self',
            description: '2턴간 자신의 [공격력]을 {{attackBonus}}% 상승시키고, [근접 공격 등급]을 +1 상승시킵니다.',
            illustrationPath: 'assets/images/skills/battle_cry.png',
            cooldown: 3,
            effect: {
                id: 'battleCryBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 2,
                modifiers: [
                    { stat: 'physicalAttack', type: 'percentage', value: 0.15 },
                    { stat: 'meleeAttack', type: 'flat', value: 1 }
                ]
            }
        },
        EPIC: {
            id: 'battleCry',
            name: '전투의 함성 [E]',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.WILL],
            cost: 1,
            targetType: 'self',
            description: '3턴간 자신의 [공격력]을 {{attackBonus}}% 상승시키고, [근접 공격 등급]을 +1 상승시킵니다.',
            illustrationPath: 'assets/images/skills/battle_cry.png',
            cooldown: 3,
            effect: {
                id: 'battleCryBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 3,
                modifiers: [
                    { stat: 'physicalAttack', type: 'percentage', value: 0.15 },
                    { stat: 'meleeAttack', type: 'flat', value: 1 }
                ]
            }
        },
        LEGENDARY: {
            id: 'battleCry',
            name: '전투의 함성 [L]',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.WILL],
            cost: 1,
            targetType: 'self',
            description: '3턴간 자신의 [공격력]을 {{attackBonus}}% 상승시키고, [근접 공격 등급]을 +1 상승시킵니다.',
            illustrationPath: 'assets/images/skills/battle_cry.png',
            cooldown: 3,
            effect: {
                id: 'battleCryBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 3,
                modifiers: [
                    { stat: 'physicalAttack', type: 'percentage', value: 0.15 },
                    { stat: 'meleeAttack', type: 'flat', value: 1 }
                ]
            }
        }
    },
    // --- ▲ [신규] 전투의 함성 스킬 추가 ▲ ---

    // --- ▼ [신규] 사냥꾼의 감각 스킬 추가 ▼ ---
    huntSense: {
        yinYangValue: +2,
        NORMAL: {
            id: 'huntSense',
            name: '사냥꾼의 감각',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.WILL],
            cost: 2,
            targetType: 'self',
            description: '3턴간 자신의 [원거리 공격 등급]을 +1, [치명타 확률]을 {{critChance}}% 상승시킵니다. (쿨타임 4턴)',
            illustrationPath: 'assets/images/skills/hunt-sense.png',
            cooldown: 4,
            effect: {
                id: 'huntSenseBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 3,
                modifiers: [
                    { stat: 'rangedAttack', type: 'flat', value: 1 },
                    { stat: 'criticalChance', type: 'percentage', value: 0.15 }
                ]
            }
        },
        RARE: {
            id: 'huntSense',
            name: '사냥꾼의 감각 [R]',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.WILL],
            cost: 1,
            targetType: 'self',
            description: '3턴간 자신의 [원거리 공격 등급]을 +1, [치명타 확률]을 {{critChance}}% 상승시킵니다. (쿨타임 4턴)',
            illustrationPath: 'assets/images/skills/hunt-sense.png',
            cooldown: 4,
            effect: {
                id: 'huntSenseBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 3,
                modifiers: [
                    { stat: 'rangedAttack', type: 'flat', value: 1 },
                    { stat: 'criticalChance', type: 'percentage', value: 0.15 }
                ]
            }
        },
        EPIC: {
            id: 'huntSense',
            name: '사냥꾼의 감각 [E]',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.WILL],
            cost: 1,
            targetType: 'self',
            description: '3턴간 자신의 [원거리 공격 등급]을 +1, [치명타 확률]을 {{critChance}}% 상승시킵니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/hunt-sense.png',
            cooldown: 3,
            effect: {
                id: 'huntSenseBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 3,
                modifiers: [
                    { stat: 'rangedAttack', type: 'flat', value: 1 },
                    { stat: 'criticalChance', type: 'percentage', value: 0.15 }
                ]
            }
        },
        LEGENDARY: {
            id: 'huntSense',
            name: '사냥꾼의 감각 [L]',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.WILL],
            cost: 1,
            targetType: 'self',
            description: '4턴간 자신의 [원거리 공격 등급]을 +1, [치명타 확률]을 {{critChance}}% 상승시킵니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/hunt-sense.png',
            cooldown: 3,
            effect: {
                id: 'huntSenseBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 4,
                modifiers: [
                    { stat: 'rangedAttack', type: 'flat', value: 1 },
                    { stat: 'criticalChance', type: 'percentage', value: 0.15 }
                ]
            }
        }
    }
    // --- ▲ [신규] 사냥꾼의 감각 스킬 추가 ▲ ---
};
