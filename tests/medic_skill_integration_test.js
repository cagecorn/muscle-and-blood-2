import assert from 'assert';
import { skillModifierEngine } from '../src/game/utils/SkillModifierEngine.js';

const healBase = {
    NORMAL: { id: 'heal', type: 'AID', cost: 1, cooldown: 0, healMultiplier: 1.0 },
    RARE: { id: 'heal', type: 'AID', cost: 0, cooldown: 0, healMultiplier: 1.0 },
    EPIC: { id: 'heal', type: 'AID', cost: 0, cooldown: 0, healMultiplier: 1.0, removesDebuff: { chance: 0.5 } },
    LEGENDARY: { id: 'heal', type: 'AID', cost: 0, cooldown: 0, healMultiplier: 1.0, removesDebuff: { chance: 1.0 } }
};

const expectedHeals = [1.3, 1.2, 1.1, 1.0];
const grades = ['NORMAL', 'RARE', 'EPIC', 'LEGENDARY'];

for (const grade of grades) {
    for (let rank = 1; rank <= 4; rank++) {
        const skill = skillModifierEngine.getModifiedSkill(healBase[grade], rank, grade);
        assert.strictEqual(skill.healMultiplier, expectedHeals[rank - 1]);
        if (grade === 'NORMAL') {
            assert.strictEqual(skill.cost, 1);
        } else {
            assert.strictEqual(skill.cost, 0);
        }
    }
}

console.log('Medic skill integration test passed.');
