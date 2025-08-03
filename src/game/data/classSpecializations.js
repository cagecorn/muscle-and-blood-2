import { SKILL_TAGS } from '../utils/SkillTagManager.js';
import { EFFECT_TYPES } from '../utils/EffectTypes.js';

/**
 * 각 클래스별 특화 태그와 이에 따른 보너스 효과 정의
 * 해당 태그의 스킬을 사용하면 지정된 효과가 1턴 동안 부여됩니다.
 * 중첩 가능하도록 duration은 1로 설정했습니다.
 */
export const classSpecializations = {
    warrior: [
        {
            tag: SKILL_TAGS.WILL,
            description: "'의지' 태그 스킬 사용 시, 1턴간 방어력 5% 증가 (중첩 가능)",
            effect: {
                id: 'warriorWillBonus',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                modifiers: { stat: 'physicalDefense', type: 'percentage', value: 0.05 }
            }
        }
    ],
    gunner: [
        {
            tag: SKILL_TAGS.KINETIC,
            description: "'관성' 태그 스킬 사용 시, 1턴간 치명타 확률 4% 증가 (중첩 가능)",
            effect: {
                id: 'gunnerKineticBonus',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                modifiers: { stat: 'criticalChance', type: 'percentage', value: 0.04 }
            }
        }
    ],
    medic: [
        {
            tag: SKILL_TAGS.HEAL,
            description: "'치유' 태그 스킬 사용 시, 1턴간 지혜 5% 증가 (중첩 가능)",
            effect: {
                id: 'medicHealBonus',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                modifiers: { stat: 'wisdom', type: 'percentage', value: 0.05 }
            }
        }
    ],
    nanomancer: [
        {
            tag: SKILL_TAGS.PRODUCTION,
            description: "'생산' 태그 스킬 사용 시, 1턴간 마법 방어력 8% 증가 (중첩 가능)",
            effect: {
                id: 'nanomancerProductionBonus',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                modifiers: { stat: 'magicDefense', type: 'percentage', value: 0.08 }
            }
        }
    ],
    flyingmen: [
        {
            tag: SKILL_TAGS.CHARGE,
            description: "'돌진' 태그 스킬 사용 시, 1턴간 회피율 3% 증가 (중첩 가능)",
            effect: {
                id: 'flyingmenChargeBonus',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                modifiers: { stat: 'physicalEvadeChance', type: 'percentage', value: 0.03 }
            }
        }
    ],
    esper: [
        {
            tag: SKILL_TAGS.MIND,
            description: "'정신' 태그 스킬 사용 시, 1턴간 상태이상 적용 확률 5% 증가 (중첩 가능)",
            effect: {
                id: 'esperMindBonus',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                modifiers: { stat: 'statusEffectApplication', type: 'percentage', value: 0.05 }
            }
        }
    ],
    // ✨ [신규] 커맨더 특화 태그 추가
    commander: [
        {
            tag: SKILL_TAGS.STRATEGY,
            description: "'전략' 태그 스킬 사용 시, 주변 2칸 내 모든 아군의 용맹(Valor)이 1턴간 2 증가합니다.",
            effect: {
                id: 'commanderStrategyBonus',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                isGlobal: false,
                radius: 2,
                modifiers: { stat: 'valor', type: 'flat', value: 2 }
            }
        }
    ],
    clown: [
        {
            tag: SKILL_TAGS.BIND,
            description: "'속박' 태그 스킬 사용 시, 1턴간 치명타율 2% 및 상태이상 적용 확률 4%가 증가합니다 (중첩 가능).",
            effect: {
                id: 'clownBindBonus',
                type: EFFECT_TYPES.BUFF,
                duration: 1,
                modifiers: [
                    { stat: 'criticalChance', type: 'percentage', value: 0.02 },
                    { stat: 'statusEffectApplication', type: 'percentage', value: 0.04 }
                ]
            }
        }
    ]
};
