import assert from 'assert';
import { skillModifierEngine } from '../src/game/utils/SkillModifierEngine.js';

const nanobeamBase = {
    NORMAL: { id: 'nanobeam', cost: 1, cooldown: 0, damageMultiplier: { min: 0.9, max: 1.1 } },
    RARE: { id: 'nanobeam', cost: 0, cooldown: 0, damageMultiplier: { min: 0.9, max: 1.1 } },
    EPIC: { id: 'nanobeam', cost: 0, cooldown: 0, damageMultiplier: { min: 0.9, max: 1.1 }, generatesToken: { chance: 0.5, amount: 1 } },
    LEGENDARY: { id: 'nanobeam', cost: 0, cooldown: 0, damageMultiplier: { min: 0.9, max: 1.1 }, generatesToken: { chance: 1.0, amount: 1 } }
};

const expectedDamage = [1.3, 1.2, 1.1, 1.0];
const grades = ['NORMAL', 'RARE', 'EPIC', 'LEGENDARY'];

for (const grade of grades) {
    for (let rank = 1; rank <= 4; rank++) {
        const skill = skillModifierEngine.getModifiedSkill(nanobeamBase[grade], rank, grade);
        assert(skill.damageMultiplier && typeof skill.damageMultiplier === 'object');
        if (grade === 'NORMAL') {
            assert.strictEqual(skill.cost, 1);
        } else {
            assert.strictEqual(skill.cost, 0);
        }
        if (grade === 'EPIC') {
            assert(skill.generatesToken && skill.generatesToken.chance === 0.5);
        } else if (grade === 'LEGENDARY') {
            assert(skill.generatesToken && skill.generatesToken.chance === 1.0);
        } else {
            assert(!skill.generatesToken);
        }
    }
}

console.log('Nanomancer skills integration test passed.');
