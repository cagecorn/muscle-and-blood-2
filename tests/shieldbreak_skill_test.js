import assert from 'assert';
import { skillModifierEngine } from '../src/game/utils/SkillModifierEngine.js';

const shieldBreakBase = {
    NORMAL: { id: 'shieldBreak', type: 'DEBUFF', cost: 2, cooldown: 2, effect: { id: 'shieldBreak', type: 'DEBUFF', duration: 3, modifiers: { stat: 'damageIncrease', type: 'percentage', value: 0.15 } } },
    RARE: { id: 'shieldBreak', type: 'DEBUFF', cost: 1, cooldown: 2, effect: { id: 'shieldBreak', type: 'DEBUFF', duration: 3, modifiers: { stat: 'damageIncrease', type: 'percentage', value: 0.15 } } },
    EPIC: { id: 'shieldBreak', type: 'DEBUFF', cost: 1, cooldown: 2, effect: { id: 'shieldBreak', type: 'DEBUFF', duration: 3, modifiers: [ { stat: 'damageIncrease', type: 'percentage', value: 0.15 }, { stat: 'physicalDefense', type: 'percentage', value: -0.05 } ] } },
    LEGENDARY: { id: 'shieldBreak', type: 'DEBUFF', cost: 1, cooldown: 2, effect: { id: 'shieldBreak', type: 'DEBUFF', duration: 3, modifiers: [ { stat: 'damageIncrease', type: 'percentage', value: 0.15 }, { stat: 'physicalDefense', type: 'percentage', value: -0.10 } ] } }
};

const grades = ['NORMAL', 'RARE', 'EPIC', 'LEGENDARY'];
const expectedIncrease = [0.24, 0.21, 0.18, 0.15];

for (const grade of grades) {
    for (let rank = 1; rank <= 4; rank++) {
        const skill = skillModifierEngine.getModifiedSkill(shieldBreakBase[grade], rank, grade);
        const mods = skill.effect.modifiers;
        const increase = Array.isArray(mods) ? mods.find(m => m.stat === 'damageIncrease').value : mods.value;
        assert(Math.abs(increase - expectedIncrease[rank - 1]) < 1e-6);
        if (grade === 'EPIC') {
            const pd = mods.find(m => m.stat === 'physicalDefense');
            assert(pd && Math.abs(pd.value + 0.05) < 1e-6);
        } else if (grade === 'LEGENDARY') {
            const pd = mods.find(m => m.stat === 'physicalDefense');
            assert(pd && Math.abs(pd.value + 0.10) < 1e-6);
        } else if (Array.isArray(mods)) {
            assert(!mods.some(m => m.stat === 'physicalDefense'));
        }
    }
}

console.log('ShieldBreak skill grade/rank tests passed.');
