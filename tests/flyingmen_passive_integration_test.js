import assert from 'assert';
import MoveToTargetNode from '../src/ai/nodes/MoveToTargetNode.js';
import { statusEffectManager } from '../src/game/utils/StatusEffectManager.js';
import { formationEngine } from '../src/game/utils/FormationEngine.js';
import { mercenaryData } from '../src/game/data/mercenaries.js';

// --- 테스트를 위한 스텁 엔진들 설정 ---
const animationEngine = { moveTo: async (sprite, x, y, duration, onUpdate) => { if (onUpdate) onUpdate(); } };
const cameraControl = { panTo() {} };
const vfxManager = { showEffectName() {} };

// FormationEngine을 위한 간단한 그리드 스텁
const cells = new Map();
formationEngine.grid = {
    getCell(col, row) {
        const key = `${col},${row}`;
        if (!cells.has(key)) {
            cells.set(key, { x: col, y: row, col, row, isOccupied: false, sprite: null });
        }
        return cells.get(key);
    }
};

// StatusEffectManager 초기화
statusEffectManager.activeEffects.clear();
statusEffectManager.setBattleSimulator({ turnQueue: [], vfxManager });

// 플라잉맨 유닛 설정
const unit = {
    uniqueId: 'flying1',
    ...mercenaryData.flyingmen,
    classPassive: mercenaryData.flyingmen.classPassive,
    sprite: { x: 0, y: 0, active: true },
    gridX: 0,
    gridY: 0,
    finalStats: { movement: mercenaryData.flyingmen.baseStats.movement }
};

const blackboard = new Map();
blackboard.set('movementPath', [ { col: 1, row: 0 }, { col: 2, row: 0 } ]);

const node = new MoveToTargetNode({ animationEngine, cameraControl, vfxManager });
await node.evaluate(unit, blackboard);

const effects = statusEffectManager.activeEffects.get('flying1') || [];
const buff = effects.find(e => e.id === 'juggernautBuff');
assert(buff, '저거너트 버프가 적용되어야 합니다.');
const defMod = buff.modifiers.find(m => m.stat === 'physicalDefense');
assert(defMod && Math.abs(defMod.value - 0.06) < 1e-6, '방어력 증가치가 올바르게 계산되어야 합니다.');

console.log('Flyingmen passive integration test passed.');
