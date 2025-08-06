import assert from 'assert';
import { skillModifierEngine } from '../src/game/utils/SkillModifierEngine.js';

const nanobeamBase = {
    NORMAL: { id: 'nanobeam', cost: 1, cooldown: 0, damageMultiplier: { min: 0.9, max: 1.1 } },
    RARE: { id: 'nanobeam', cost: 0, cooldown: 0, damageMultiplier: { min: 0.9, max: 1.1 } },
    EPIC: { id: 'nanobeam', cost: 0, cooldown: 0, damageMultiplier: { min: 0.9, max: 1.1 }, generatesToken: { chance: 0.5, amount: 1 } },
    LEGENDARY: { id: 'nanobeam', cost: 0, cooldown: 0, damageMultiplier: { min: 0.9, max: 1.1 }, generatesToken: { chance: 1.0, amount: 1 } }
};

const fireballBase = {
    NORMAL: { id: 'fireball', cost: 3, cooldown: 3, range: 4, effect: { id: 'burn', duration: 2 } },
    RARE: { id: 'fireball', cost: 3, cooldown: 2, range: 4, effect: { id: 'burn', duration: 2 } },
    EPIC: { id: 'fireball', cost: 3, cooldown: 2, range: 5, effect: { id: 'burn', duration: 3 } },
    LEGENDARY: {
        id: 'fireball',
        cost: 3,
        cooldown: 2,
        range: 5,
        effect: { id: 'burn', duration: 3 },
        centerTargetEffect: { id: 'stun', duration: 1 }
    }
};

const expectedDamage = [1.3, 1.2, 1.1, 1.0];
const grades = ['NORMAL', 'RARE', 'EPIC', 'LEGENDARY'];

for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(nanobeamBase[grade], grade);
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

for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(fireballBase[grade], grade);
    const expected = fireballBase[grade];
    assert.strictEqual(skill.cost, expected.cost, `Fireball cost failed for ${grade}`);
    assert.strictEqual(skill.cooldown, expected.cooldown, `Fireball cooldown failed for ${grade}`);
    assert.strictEqual(skill.range, expected.range, `Fireball range failed for ${grade}`);
    assert.strictEqual(skill.effect.id, 'burn', 'Fireball effect id mismatch');
    assert.strictEqual(skill.effect.duration, expected.effect.duration, `Fireball duration failed for ${grade}`);
    if (grade === 'LEGENDARY') {
        assert(skill.centerTargetEffect && skill.centerTargetEffect.id === 'stun', 'Legendary center stun missing');
    } else {
        assert(!skill.centerTargetEffect, 'Center effect should only exist in Legendary');
    }
}

console.log('Nanomancer skills integration test passed.');
