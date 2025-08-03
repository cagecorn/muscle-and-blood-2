import { SKILL_TAGS } from '../utils/SkillTagManager.js';

/**
 * 각 클래스별 숙련된 스킬 태그 목록입니다.
 * 여기에 포함된 태그와 일치하는 스킬을 사용할 때
 * 향후 구현될 '숙련도 보너스'를 받게 됩니다.
 */
export const classProficiencies = {
    warrior: [
        SKILL_TAGS.MELEE,
        SKILL_TAGS.PHYSICAL,
        SKILL_TAGS.CHARGE,
        SKILL_TAGS.WILL,
    ],
    gunner: [
        SKILL_TAGS.RANGED,
        SKILL_TAGS.PHYSICAL,
        SKILL_TAGS.KINETIC,
        SKILL_TAGS.FIXED,
    ],
    medic: [
        SKILL_TAGS.AID,
        SKILL_TAGS.HEAL,
        SKILL_TAGS.BUFF,
        SKILL_TAGS.WILL_GUARD,
    ],
    nanomancer: [
        SKILL_TAGS.MAGIC,
        SKILL_TAGS.RANGED,
        SKILL_TAGS.DEBUFF,
        SKILL_TAGS.PRODUCTION,
    ],
    flyingmen: [
        SKILL_TAGS.MELEE,
        SKILL_TAGS.PHYSICAL,
        SKILL_TAGS.CHARGE,
        SKILL_TAGS.THROWING,
    ],
    esper: [
        SKILL_TAGS.MAGIC,
        SKILL_TAGS.RANGED,
        SKILL_TAGS.DEBUFF,
        SKILL_TAGS.PROHIBITION,
        SKILL_TAGS.MIND,
    ],
    // ✨ [신규] 커맨더 숙련도 태그 추가
    commander: [
        SKILL_TAGS.MELEE,
        SKILL_TAGS.PHYSICAL,
        SKILL_TAGS.WILL,
        SKILL_TAGS.STRATEGY,
    ],
    clown: [
        SKILL_TAGS.PHYSICAL,
        SKILL_TAGS.MELEE,
        SKILL_TAGS.DEBUFF,
        SKILL_TAGS.KINETIC,
        SKILL_TAGS.DELAY,
        SKILL_TAGS.BIND,
    ],
    android: [
        SKILL_TAGS.MELEE,
        SKILL_TAGS.PHYSICAL,
        SKILL_TAGS.WILL,
        SKILL_TAGS.WILL_GUARD,
        SKILL_TAGS.SACRIFICE,
    ],
    // '좀비'와 같은 몬스터는 숙련도 보너스를 받지 않으므로 정의하지 않습니다.
};
