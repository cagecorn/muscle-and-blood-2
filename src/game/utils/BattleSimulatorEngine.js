import { formationEngine } from './FormationEngine.js';
import { OffscreenTextEngine } from './OffscreenTextEngine.js';
import { BindingManager } from './BindingManager.js';
import { VFXManager } from './VFXManager.js';
import { AnimationEngine } from './AnimationEngine.js';
import { TerminationManager } from './TerminationManager.js';

import { aiManager } from '../../ai/AIManager.js';
import { createMeleeAI } from '../../ai/behaviors/MeleeAI.js';

import { targetManager } from './TargetManager.js';
import { pathfinderEngine } from './PathfinderEngine.js';
import { turnOrderManager } from './TurnOrderManager.js';
import { combatCalculationEngine } from './CombatCalculationEngine.js';
import { delayEngine } from './DelayEngine.js';


export class BattleSimulatorEngine {
    constructor(scene) {
        this.scene = scene;
        this.isRunning = false;

        // --- 모든 엔진과 매니저 초기화 ---
        this.animationEngine = new AnimationEngine(scene);
        this.textEngine = new OffscreenTextEngine(scene);
        this.bindingManager = new BindingManager(scene);
        this.vfxManager = new VFXManager(scene);
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
        };

        this.turnQueue = [];
        this.currentTurnIndex = 0;
    }

    start(allies, enemies) {
        if (this.isRunning) return;
        this.isRunning = true;

        aiManager.clear();

        const allUnits = [...allies, ...enemies];
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
            if (unit.name === '전사' || unit.name === '좀비') {
                aiManager.registerUnit(unit, createMeleeAI(this.aiEngines));
            }
        });

        this.turnQueue = turnOrderManager.createTurnQueue(allUnits);
        this.currentTurnIndex = 0;

        this.gameLoop(); // 수정된 루프 시작
    }

    _setupUnits(units) {
        units.forEach(unit => {
            if (!unit.sprite) return;

            unit.currentHp = unit.finalStats.hp;
            const cell = formationEngine.getCellFromSprite(unit.sprite);
            if (cell) {
                unit.gridX = cell.col;
                unit.gridY = cell.row;
            }

            const color = (unit.team === 'ally') ? '#63b1ff' : '#ff6363';
            const nameLabel = this.textEngine.createLabel(unit.sprite, unit.instanceName, color);
            const healthBar = this.vfxManager.createHealthBar(unit.sprite);
            unit.healthBar = healthBar;

            this.bindingManager.bind(unit.sprite, [nameLabel, healthBar.background, healthBar.foreground]);
        });
    }

    // gameLoop를 while 루프로 변경
    async gameLoop() {
        while (this.isRunning && !this.isBattleOver()) {
            const currentUnit = this.turnQueue[this.currentTurnIndex];

            if (currentUnit && currentUnit.currentHp > 0) {
                this.scene.cameraControl.panTo(currentUnit.sprite.x, currentUnit.sprite.y);
                await delayEngine.hold(500);

                if (aiManager.unitData.has(currentUnit.uniqueId)) {
                    const allies = this.turnQueue.filter(u => u.team === 'ally' && u.currentHp > 0);
                    const enemies = this.turnQueue.filter(u => u.team === 'enemy' && u.currentHp > 0);

                    await aiManager.executeTurn(currentUnit, [...allies, ...enemies], currentUnit.team === 'ally' ? enemies : allies);
                }
            }

            this.currentTurnIndex++;
            if (this.currentTurnIndex >= this.turnQueue.length) {
                this.currentTurnIndex = 0;
            }

            await delayEngine.hold(1000); // 다음 턴까지 잠시 대기
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
