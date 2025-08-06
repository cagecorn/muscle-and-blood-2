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

const iceballBase = {
    NORMAL: { id: 'iceball', cost: 3, cooldown: 3, range: 4, effect: { id: 'frost', duration: 2 } },
    RARE: { id: 'iceball', cost: 3, cooldown: 2, range: 4, effect: { id: 'frost', duration: 2 } },
    EPIC: { id: 'iceball', cost: 3, cooldown: 2, range: 5, effect: { id: 'frost', duration: 3 } },
    LEGENDARY: {
        id: 'iceball',
        cost: 3,
        cooldown: 2,
        range: 5,
        effect: { id: 'frost', duration: 3 },
        centerTargetEffect: { id: 'bind', duration: 1 }
    }
};

// 신규 4대 원소 스킬 (NORMAL 등급만 존재)
const elementalBases = [
    { id: 'lightningStrike', cost: 3, cooldown: 3, range: 4, effect: { id: 'shock', duration: 2 } },
    { id: 'stoneBlast', cost: 3, cooldown: 3, range: 4, effect: { id: 'weaken', duration: 2 } },
    { id: 'holyLight', cost: 3, cooldown: 3, range: 4, effect: { id: 'vulnerable', duration: 2 } },
    { id: 'shadowBolt', cost: 3, cooldown: 3, range: 4, effect: { id: 'drain', duration: 2 } }
];

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

for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(iceballBase[grade], grade);
    const expected = iceballBase[grade];
    assert.strictEqual(skill.cost, expected.cost, `Iceball cost failed for ${grade}`);
    assert.strictEqual(skill.cooldown, expected.cooldown, `Iceball cooldown failed for ${grade}`);
    assert.strictEqual(skill.range, expected.range, `Iceball range failed for ${grade}`);
    assert.strictEqual(skill.effect.id, 'frost', 'Iceball effect id mismatch');
    assert.strictEqual(skill.effect.duration, expected.effect.duration, `Iceball duration failed for ${grade}`);
    if (grade === 'LEGENDARY') {
        assert(skill.centerTargetEffect && skill.centerTargetEffect.id === 'bind', 'Legendary center bind missing');
    } else {
        assert(!skill.centerTargetEffect, 'Center effect should only exist in Legendary');
    }
}

// 신규 4대 원소 스킬 검증
for (const base of elementalBases) {
    const skill = skillModifierEngine.getModifiedSkill(base, 'NORMAL');
    assert.strictEqual(skill.cost, base.cost, `${base.id} cost failed`);
    assert.strictEqual(skill.cooldown, base.cooldown, `${base.id} cooldown failed`);
    assert.strictEqual(skill.range, base.range, `${base.id} range failed`);
    assert.strictEqual(skill.effect.id, base.effect.id, `${base.id} effect id mismatch`);
    assert.strictEqual(skill.effect.duration, base.effect.duration, `${base.id} duration failed`);
}

console.log('Nanomancer skills integration test passed.');
