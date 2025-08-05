import './setup-indexeddb.js';
import assert from 'assert';
import SkillEffectProcessor from '../src/game/utils/SkillEffectProcessor.js';
import { spriteEngine } from '../src/game/utils/SpriteEngine.js';
import { statusEffectManager } from '../src/game/utils/StatusEffectManager.js';
import { statusEffects } from '../src/game/data/status-effects.js';
import { diceEngine } from '../src/game/utils/DiceEngine.js';

// 애니메이션 관련 처리를 무시합니다.
spriteEngine.changeSpriteForDuration = () => {};

const engines = {
    vfxManager: { showEffectName() {}, createDamageNumber() {} },
    animationEngine: {},
    terminationManager: {},
    summoningEngine: {},
    battleSimulator: {},
};

const processor = new SkillEffectProcessor(engines);

// 상태 효과 매니저 초기화
statusEffectManager.activeEffects.clear();
statusEffectManager.setBattleSimulator({ vfxManager: engines.vfxManager, turnQueue: [] });

const hacker = {
    id: 'hacker',
    uniqueId: 'hacker1',
    instanceName: 'Hacker',
    classPassive: { id: 'hackersInvade' },
    sprite: {},
    sprites: {},
    team: 'A',
};

const target = {
    uniqueId: 'target1',
    instanceName: 'Target',
    currentHp: 10,
    sprite: {},
    team: 'B',
};

const skill = {
    type: 'DEBUFF',
    effect: { ...statusEffects.stigma },
    tags: [],
};

// 랜덤 요소를 고정합니다.
const originalRandom = diceEngine.getRandomElement;
diceEngine.getRandomElement = () => statusEffects.sentryDutyDebuff;

processor._handleCommonPostEffects(hacker, target, skill, new Map());

const effects = statusEffectManager.activeEffects.get('target1') || [];
assert(effects.some(e => e.id === 'stigma'), '원본 디버프가 적용되어야 합니다.');
assert(effects.some(e => e.id === 'sentryDutyDebuff'), '추가 랜덤 디버프가 적용되어야 합니다.');

diceEngine.getRandomElement = originalRandom;

console.log('Hacker passive integration test passed.');

