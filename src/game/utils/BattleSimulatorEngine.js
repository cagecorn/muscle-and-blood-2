import { formationEngine } from './FormationEngine.js';
import { OffscreenTextEngine } from './OffscreenTextEngine.js';
import { BindingManager } from './BindingManager.js';
import { VFXManager } from './VFXManager.js';
import { AnimationEngine } from './AnimationEngine.js';
import { TerminationManager } from './TerminationManager.js';

import { aiManager } from '../../ai/AIManager.js';
import { createMeleeAI } from '../../ai/behaviors/MeleeAI.js';
import { createRangedAI } from '../../ai/behaviors/RangedAI.js';

import { targetManager } from './TargetManager.js';
import { pathfinderEngine } from './PathfinderEngine.js';
import { visionManager } from './VisionManager.js'; // VisionManager를 import합니다.
import { turnOrderManager } from './TurnOrderManager.js';
import { combatCalculationEngine } from './CombatCalculationEngine.js';
import { delayEngine } from './DelayEngine.js';
// --- ✨ TokenEngine을 import 합니다. ---
import { tokenEngine } from './TokenEngine.js';
import { skillEngine } from './SkillEngine.js';
import { statusEffectManager } from './StatusEffectManager.js';
import { cooldownManager } from './CooldownManager.js';


export class BattleSimulatorEngine {
    constructor(scene) {
        this.scene = scene;
        this.isRunning = false;

        // --- 모든 엔진과 매니저 초기화 ---
        this.animationEngine = new AnimationEngine(scene);
        this.textEngine = new OffscreenTextEngine(scene);
        this.bindingManager = new BindingManager(scene);
        this.vfxManager = new VFXManager(scene, this.textEngine, this.bindingManager);
        this.terminationManager = new TerminationManager(scene);
        
        // AI 노드에 주입할 엔진 패키지
        this.aiEngines = {
            targetManager,
            pathfinderEngine,
            formationEngine,
            combatCalculationEngine,
            delayEngine,
            animationEngine: this.animationEngine,
            vfxManager: this.vfxManager,
            terminationManager: this.terminationManager,
            visionManager, // visionManager를 엔진 패키지에 추가합니다.
        };

        this.turnQueue = [];
        this.currentTurnIndex = 0;
        // --- ✨ 전체 턴 수를 추적하는 변수 ---
        this.currentTurnNumber = 1;
    }

    start(allies, enemies) {
        if (this.isRunning) return;
        this.isRunning = true;

        aiManager.clear();
        cooldownManager.reset();
        statusEffectManager.setBattleSimulator(this);

        const allUnits = [...allies, ...enemies];
        // --- ✨ 전투 시작 시 토큰 엔진 초기화 ---
        tokenEngine.initializeUnits(allUnits);
        allies.forEach(u => u.team = 'ally');
        enemies.forEach(u => u.team = 'enemy');

        formationEngine.applyFormation(this.scene, allies, 0, 7);
        const unplaced = allies.filter(u => !u.sprite);
        if (unplaced.length > 0) {
            formationEngine.placeUnits(this.scene, unplaced, 0, 7);
        }
        formationEngine.placeMonsters(this.scene, enemies, 8);

        this._setupUnits(allUnits);

        allUnits.forEach(unit => {
            if (unit.name === '거너') {
                aiManager.registerUnit(unit, createRangedAI(this.aiEngines));
            } else if (unit.name === '전사' || unit.name === '좀비') {
                aiManager.registerUnit(unit, createMeleeAI(this.aiEngines));
            }
        });

        this.turnQueue = turnOrderManager.createTurnQueue(allUnits);
        this.currentTurnIndex = 0;
        this.currentTurnNumber = 1; // 턴 번호 초기화

        // --- ✨ 첫 턴 시작 시 토큰 지급 ---
        tokenEngine.addTokensForNewTurn();
        // 스킬 사용 기록 초기화
        skillEngine.resetTurnActions();

        // 첫 턴 시작 직후 모든 유닛의 토큰 UI를 업데이트합니다.
        allUnits.forEach(unit => this.vfxManager.updateTokenDisplay(unit.uniqueId));

        this.gameLoop(); // 수정된 루프 시작
    }

    _setupUnits(units) {
        units.forEach(unit => {
            if (!unit.sprite) return;

            // --- ✨ unitId를 스프라이트에 먼저 설정 ---
            unit.sprite.setData('unitId', unit.uniqueId);
            unit.sprite.setData('team', unit.team);

            unit.currentHp = unit.finalStats.hp;
            const cell = formationEngine.getCellFromSprite(unit.sprite);
            if (cell) {
                unit.gridX = cell.col;
                unit.gridY = cell.row;
            }

            this.vfxManager.setupUnitVFX(unit);
        });
    }

    // gameLoop를 while 루프로 변경
    async gameLoop() {
        while (this.isRunning && !this.isBattleOver()) {
            const currentUnit = this.turnQueue[this.currentTurnIndex];

            if (currentUnit && currentUnit.currentHp > 0 && !currentUnit.isStunned) {
                this.scene.cameraControl.panTo(currentUnit.sprite.x, currentUnit.sprite.y);
                await delayEngine.hold(500);

                if (aiManager.unitData.has(currentUnit.uniqueId)) {
                    const allies = this.turnQueue.filter(u => u.team === 'ally' && u.currentHp > 0);
                    const enemies = this.turnQueue.filter(u => u.team === 'enemy' && u.currentHp > 0);

                    await aiManager.executeTurn(currentUnit, [...allies, ...enemies], currentUnit.team === 'ally' ? enemies : allies);
                }

                cooldownManager.reduceCooldowns(currentUnit.uniqueId);
            } else if (currentUnit && currentUnit.isStunned) {
                console.log(`%c[Battle] ${currentUnit.instanceName}은(는) 기절해서 움직일 수 없습니다!`, "color: yellow;");
                cooldownManager.reduceCooldowns(currentUnit.uniqueId);
            }

            this.currentTurnIndex++;
            if (this.currentTurnIndex >= this.turnQueue.length) {
                this.currentTurnIndex = 0;
                this.currentTurnNumber++; // 모든 유닛의 턴이 끝나면 전체 턴 수 증가

                statusEffectManager.onTurnEnd();
                tokenEngine.addTokensForNewTurn();
                skillEngine.resetTurnActions();
            }

            // --- ✨ 매 행동 후 모든 유닛의 토큰 UI 업데이트 ---
            this.turnQueue.forEach(unit => {
                if (unit.sprite && unit.sprite.active) {
                    this.vfxManager.updateTokenDisplay(unit.uniqueId);
                }
            });
            this.vfxManager.updateAllStatusIcons();

            await delayEngine.hold(1000);
        }

        if (!this.isRunning) return;
        
        console.log('전투 종료!');
    }

    isBattleOver() {
        const aliveAllies = this.turnQueue.filter(u => u.team === 'ally' && u.currentHp > 0).length;
        const aliveEnemies = this.turnQueue.filter(u => u.team === 'enemy' && u.currentHp > 0).length;
        return aliveAllies === 0 || aliveEnemies === 0;
    }

    shutdown() {
        this.isRunning = false;
        // 모든 매니저 종료 처리...
    }
}
