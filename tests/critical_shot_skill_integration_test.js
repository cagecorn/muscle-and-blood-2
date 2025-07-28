import assert from 'assert';
import { skillModifierEngine } from '../src/game/utils/SkillModifierEngine.js';
import { fixedDamageManager } from '../src/game/utils/FixedDamageManager.js';

const criticalShotBase = {
    NORMAL: { id: 'criticalShot', cost: 3, cooldown: 3, damageMultiplier: 1.0, fixedDamage: 'CRITICAL' },
    RARE: { id: 'criticalShot', cost: 2, cooldown: 3, damageMultiplier: 1.0, fixedDamage: 'CRITICAL' },
    EPIC: { id: 'criticalShot', cost: 2, cooldown: 2, range: 4, damageMultiplier: 1.0, fixedDamage: 'CRITICAL' },
    LEGENDARY: { id: 'criticalShot', cost: 2, cooldown: 2, range: 4, damageMultiplier: 1.0, fixedDamage: 'CRITICAL', armorPenetration: 0.15 }
};

const expectedDamage = [1.3, 1.2, 1.1, 1.0];
const grades = ['NORMAL', 'RARE', 'EPIC', 'LEGENDARY'];

for (const grade of grades) {
    for (let rank = 1; rank <= 4; rank++) {
        const skill = skillModifierEngine.getModifiedSkill(criticalShotBase[grade], rank, grade);
        assert.strictEqual(skill.damageMultiplier, expectedDamage[rank - 1], `Damage multiplier failed for ${grade} rank ${rank}`);
        assert.strictEqual(skill.cost, criticalShotBase[grade].cost, `Cost failed for ${grade}`);
        assert.strictEqual(skill.cooldown, criticalShotBase[grade].cooldown, `Cooldown failed for ${grade}`);
        assert.strictEqual(skill.fixedDamage, 'CRITICAL', `Fixed damage property missing for ${grade}`);
        if (grade === 'LEGENDARY') {
            assert.strictEqual(skill.armorPenetration, 0.15, 'Armor penetration failed for LEGENDARY');
        }
    }
}

const result = fixedDamageManager.calculateFixedDamage('CRITICAL', null);
assert.deepStrictEqual(result.hitType, '치명타');
assert.deepStrictEqual(result.multiplier, 2.0);

console.log('Critical Shot skill integration test passed.');
