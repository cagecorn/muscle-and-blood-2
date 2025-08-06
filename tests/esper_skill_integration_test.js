import assert from 'assert';
import { skillModifierEngine } from '../src/game/utils/SkillModifierEngine.js';

const confusionBase = {
    NORMAL: {
        id: 'confusion',
        cost: 3,
        cooldown: 3,
        range: 3,
        effect: { id: 'confusion', duration: 2 }
    },
    RARE: {
        id: 'confusion',
        cost: 2,
        cooldown: 3,
        range: 3,
        effect: { id: 'confusion', duration: 2 }
    },
    EPIC: {
        id: 'confusion',
        cost: 2,
        cooldown: 2,
        range: 4,
        effect: { id: 'confusion', duration: 2 }
    },
    LEGENDARY: {
        id: 'confusion',
        cost: 2,
        cooldown: 2,
        range: 4,
        effect: {
            id: 'confusion',
            duration: 2,
            modifiers: { stat: 'physicalAttack', type: 'percentage', value: -0.15 }
        }
    }
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

const grades = ['NORMAL', 'RARE', 'EPIC', 'LEGENDARY'];

for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(confusionBase[grade], grade);
    const expected = confusionBase[grade];

    assert.strictEqual(skill.cost, expected.cost, `Confusion cost failed for ${grade}`);
    assert.strictEqual(skill.cooldown, expected.cooldown, `Confusion cooldown failed for ${grade}`);
    assert.strictEqual(skill.range, expected.range, `Confusion range failed for ${grade}`);
    assert.strictEqual(skill.effect.duration, expected.effect.duration, `Confusion duration failed for ${grade}`);

    if (grade === 'LEGENDARY') {
        const mod = skill.effect.modifiers;
        assert(mod && mod.stat === 'physicalAttack' && Math.abs(mod.value + 0.15) < 1e-6, 'Legendary attack reduction missing');
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

console.log('Esper skills integration test passed.');
