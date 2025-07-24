import { EFFECT_TYPES } from '../../utils/StatusEffectManager.js';

// 버프 스킬 데이터 정의
export const buffSkills = {
    stoneSkin: {
        id: 'stoneSkin',
        name: '스톤 스킨',
        type: 'BUFF',
        cost: 1,
        // 대상 유형을 명시하여 AI 등이 올바르게 처리하도록 함
        targetType: 'self', // 'self', 'enemy', 'ally' 등
        description: '4턴간 받는 데미지가 15% 감소합니다. (쿨타임 3턴)',
        illustrationPath: 'assets/images/skills/ston-skin.png',
        requiredClass: 'warrior', // ✨ 전사 전용 설정
        cooldown: 3,
        effect: {
            // ✨ [수정] 효과 ID를 명시적으로 추가하여 오류를 해결합니다.
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
};
