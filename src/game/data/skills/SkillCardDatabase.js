import { activeSkills } from './active.js';
import { buffSkills } from './buff.js';
import { debuffSkills } from './debuff.js';
import { passiveSkills } from './passive.js';
import { aidSkills } from './aid.js';
import { summonSkills } from './summon.js';
import { strategySkills } from './strategy.js';

// 모든 스킬을 하나의 객체로 통합하여 쉽게 조회할 수 있도록 함
export const skillCardDatabase = {
    ...activeSkills,
    ...buffSkills,
    ...debuffSkills,
    ...passiveSkills,
    ...aidSkills,
    ...summonSkills,
    ...strategySkills,
};
