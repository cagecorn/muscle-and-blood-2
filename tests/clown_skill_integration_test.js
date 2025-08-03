import assert from 'assert';
import { skillModifierEngine } from '../src/game/utils/SkillModifierEngine.js';

const bindTrickBase = {
    NORMAL: { id: 'bindTrick', type: 'DEBUFF', cost: 1, cooldown: 1, effect: { id: 'bind', type: 'STATUS_EFFECT', duration: 1 } },
    RARE: { id: 'bindTrick', type: 'DEBUFF', cost: 1, cooldown: 1, effect: { id: 'bind', type: 'STATUS_EFFECT', duration: 1 } },
    EPIC: { id: 'bindTrick', type: 'DEBUFF', cost: 0, cooldown: 1, effect: { id: 'bind', type: 'STATUS_EFFECT', duration: 1 } },
    LEGENDARY: { id: 'bindTrick', type: 'DEBUFF', cost: 0, cooldown: 1, effect: { id: 'bind', type: 'STATUS_EFFECT', duration: 2 } },
};

const grades = ['NORMAL', 'RARE', 'EPIC', 'LEGENDARY'];
for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(bindTrickBase[grade], grade);
    if (grade === 'NORMAL' || grade === 'RARE') {
        assert.strictEqual(skill.cost, 1);
    } else {
        assert.strictEqual(skill.cost, 0);
    }
    if (grade === 'LEGENDARY') {
        assert.strictEqual(skill.effect.duration, 2);
    } else {
        assert.strictEqual(skill.effect.duration, 1);
    }
}

console.log('Clown skills integration test passed.');
