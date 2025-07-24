import assert from 'assert';
import { skillModifierEngine } from '../src/game/utils/SkillModifierEngine.js';

const chargeBase = {
    NORMAL: { id: 'charge', type: 'ACTIVE', cost: 2, cooldown: 3, damageMultiplier: 0.8, effect: { id: 'stun', type: 'STATUS_EFFECT', duration: 1 } },
    RARE: { id: 'charge', type: 'ACTIVE', cost: 2, cooldown: 2, damageMultiplier: 0.8, effect: { id: 'stun', type: 'STATUS_EFFECT', duration: 1 } },
    EPIC: { id: 'charge', type: 'ACTIVE', cost: 1, cooldown: 2, damageMultiplier: 0.8, effect: { id: 'stun', type: 'STATUS_EFFECT', duration: 1 } },
    LEGENDARY: { id: 'charge', type: 'ACTIVE', cost: 1, cooldown: 2, damageMultiplier: 0.8, effect: { id: 'stun', type: 'STATUS_EFFECT', duration: 2 } }
};

const grades = ['NORMAL', 'RARE', 'EPIC', 'LEGENDARY'];
const expectedDamage = [1.5, 1.2, 1.0, 0.8];

for (const grade of grades) {
    for (let rank = 1; rank <= 4; rank++) {
        const skill = skillModifierEngine.getModifiedSkill(chargeBase[grade], rank, grade);
        assert.strictEqual(skill.damageMultiplier, expectedDamage[rank - 1]);
        const expectedDuration = (rank === 1) ? 1 : (grade === 'LEGENDARY' ? 2 : 1);
        assert.strictEqual(skill.effect.duration, expectedDuration);
    }
}

console.log('Charge skill grade/rank tests passed.');
