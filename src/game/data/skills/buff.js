import { EFFECT_TYPES } from '../../utils/StatusEffectManager.js';
import { SKILL_TAGS } from '../../utils/SkillTagManager.js';

// 버프 스킬 데이터 정의
export const buffSkills = {
    stoneSkin: {
        // NORMAL 등급: 기본 효과
        NORMAL: {
            id: 'stoneSkin',
            name: '스톤 스킨',
            type: 'BUFF',
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.EARTH],
            cost: 2,
            targetType: 'self',
            description: '4턴간 자신에게 데미지 감소 {{reduction}}% 버프를 겁니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/ston-skin.png',
            requiredClass: 'warrior',
            cooldown: 3,
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
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.EARTH],
            cost: 1,
            targetType: 'self',
            description: '4턴간 자신에게 데미지 감소 {{reduction}}% 버프를 겁니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/ston-skin.png',
            requiredClass: 'warrior',
            cooldown: 3,
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
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.EARTH],
            cost: 1,
            targetType: 'self',
            description: '4턴간 자신에게 데미지 감소 {{reduction}}%, 방어력 상승 10% 버프를 겁니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/ston-skin.png',
            requiredClass: 'warrior',
            cooldown: 3,
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
            tags: [SKILL_TAGS.BUFF, SKILL_TAGS.EARTH],
            cost: 1,
            targetType: 'self',
            description: '4턴간 자신에게 데미지 감소 {{reduction}}%, 방어력 상승 15% 버프를 겁니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/ston-skin.png',
            requiredClass: 'warrior',
            cooldown: 3,
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
};
