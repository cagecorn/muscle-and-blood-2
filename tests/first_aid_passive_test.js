import assert from 'assert';
import SkillEffectProcessor from '../src/game/utils/SkillEffectProcessor.js';
import { SKILL_TAGS } from '../src/game/utils/SkillTagManager.js';
import { spriteEngine } from '../src/game/utils/SpriteEngine.js';

// 스프라이트 엔진의 애니메이션 변경을 무시합니다.
spriteEngine.changeSpriteForDuration = () => {};

const engines = {
    vfxManager: { createDamageNumber() {}, showEffectName() {} },
    animationEngine: {},
    terminationManager: {},
    summoningEngine: {},
    battleSimulator: {}
};

const processor = new SkillEffectProcessor(engines);

const medic = {
    instanceName: 'Medic',
    classPassive: { id: 'firstAid' },
    finalStats: { wisdom: 100 },
    sprite: { scene: null, setTexture: () => {}, active: true },
    sprites: {}
};

const target = {
    instanceName: 'Ally',
    currentHp: 30,
    finalStats: { hp: 200 },
    isHealingProhibited: false,
    sprite: { x: 0, y: 0 }
};

const skill = {
    tags: [SKILL_TAGS.HEAL],
    healMultiplier: 1
};

await processor._processAidSkill(medic, target, skill);
assert.strictEqual(target.currentHp, 155);
console.log('First Aid passive test passed.');
