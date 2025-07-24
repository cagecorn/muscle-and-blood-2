import assert from 'assert';
import { skillModifierEngine } from '../src/game/utils/SkillModifierEngine.js';

const stoneSkinBase = {
    NORMAL: { id: 'stoneSkin', type: 'BUFF', cost: 2, cooldown: 3, effect: { id: 'stoneSkin', type: 'BUFF', duration: 4, modifiers: { stat: 'damageReduction', type: 'percentage', value: 0.15 } } },
    RARE: { id: 'stoneSkin', type: 'BUFF', cost: 1, cooldown: 3, effect: { id: 'stoneSkin', type: 'BUFF', duration: 4, modifiers: { stat: 'damageReduction', type: 'percentage', value: 0.15 } } },
    EPIC: { id: 'stoneSkin', type: 'BUFF', cost: 1, cooldown: 3, effect: { id: 'stoneSkin', type: 'BUFF', duration: 4, modifiers: [ { stat: 'damageReduction', type: 'percentage', value: 0.15 }, { stat: 'physicalDefense', type: 'percentage', value: 0.10 } ] } },
    LEGENDARY: { id: 'stoneSkin', type: 'BUFF', cost: 1, cooldown: 3, effect: { id: 'stoneSkin', type: 'BUFF', duration: 4, modifiers: [ { stat: 'damageReduction', type: 'percentage', value: 0.15 }, { stat: 'physicalDefense', type: 'percentage', value: 0.15 } ] } }
};

const grades = ['NORMAL', 'RARE', 'EPIC', 'LEGENDARY'];
const expectedReduction = [0.24, 0.21, 0.18, 0.15];

for (const grade of grades) {
    for (let rank = 1; rank <= 4; rank++) {
        const skill = skillModifierEngine.getModifiedSkill(stoneSkinBase[grade], rank, grade);
        const mods = skill.effect.modifiers;
        const reduction = Array.isArray(mods) ? mods.find(m => m.stat === 'damageReduction').value : mods.value;
        assert(Math.abs(reduction - expectedReduction[rank - 1]) < 1e-6);
        if (grade === 'EPIC') {
            const pd = mods.find(m => m.stat === 'physicalDefense');
            assert(pd && Math.abs(pd.value - 0.10) < 1e-6);
        } else if (grade === 'LEGENDARY') {
            const pd = mods.find(m => m.stat === 'physicalDefense');
            assert(pd && Math.abs(pd.value - 0.15) < 1e-6);
        } else if (Array.isArray(mods)) {
            assert(!mods.some(m => m.stat === 'physicalDefense'));
        }
    }
}

console.log('StoneSkin skill grade/rank tests passed.');
