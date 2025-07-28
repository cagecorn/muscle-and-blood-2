import { formationEngine } from './FormationEngine.js';
import { OffscreenTextEngine } from './OffscreenTextEngine.js';
import { BindingManager } from './BindingManager.js';
import { VFXManager } from './VFXManager.js';
import { AnimationEngine } from './AnimationEngine.js';
import { TerminationManager } from './TerminationManager.js';
// ✨ SummoningEngine을 새로 import 합니다.
import { SummoningEngine } from './SummoningEngine.js';

import { aiManager } from '../../ai/AIManager.js';
import { createMeleeAI } from '../../ai/behaviors/MeleeAI.js';
import { createRangedAI } from '../../ai/behaviors/RangedAI.js';
// ✨ 메딕을 위한 Healer AI를 import 합니다.
import { createHealerAI } from '../../ai/behaviors/createHealerAI.js';

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
// 전투 중 하단 UI를 관리하는 매니저
import { CombatUIManager } from '../dom/CombatUIManager.js';
import { TurnOrderUIManager } from '../dom/TurnOrderUIManager.js';
import { sharedResourceEngine } from './SharedResourceEngine.js';
import { SharedResourceUIManager } from '../dom/SharedResourceUIManager.js';

// 그림자 생성을 담당하는 매니저
import { ShadowManager } from './ShadowManager.js';


export class BattleSimulatorEngine {
    constructor(scene) {
        this.scene = scene;
        this.isRunning = false;

        // --- 모든 엔진과 매니저 초기화 ---
        this.animationEngine = new AnimationEngine(scene);
        this.textEngine = new OffscreenTextEngine(scene);
        this.bindingManager = new BindingManager(scene);
        // 그림자 생성용 매니저 초기화
        this.shadowManager = new ShadowManager(scene);
        this.vfxManager = new VFXManager(scene, this.textEngine, this.bindingManager);
        // 소환 엔진을 먼저 생성합니다.
        this.summoningEngine = new SummoningEngine(scene, this);
        // 소환 엔진을 참조하는 종료 매니저를 초기화합니다.
        this.terminationManager = new TerminationManager(scene, this.summoningEngine, this);
        // 전투 중 유닛 정보를 표시할 UI 매니저
        this.combatUI = new CombatUIManager();
        // 턴 순서 UI 매니저
        this.turnOrderUI = new TurnOrderUIManager();
        this.sharedResourceUI = new SharedResourceUIManager();
        
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
            cameraControl: this.scene.cameraControl,
            // ✨ AI가 소환 엔진을 사용할 수 있도록 패키지에 포함합니다.
            summoningEngine: this.summoningEngine,
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
        this.summoningEngine.reset();
        sharedResourceEngine.initialize();
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
            } else if (unit.name === '메딕') {
                // ✨ 메딕 AI 등록 로직 추가
                aiManager.registerUnit(unit, createHealerAI(this.aiEngines));
            }
        });

        this.turnQueue = turnOrderManager.createTurnQueue(allUnits);
        this.currentTurnIndex = 0;
        this.currentTurnNumber = 1; // 턴 번호 초기화

        // 턴 순서 UI 초기화
        this.turnOrderUI.show(this.turnQueue);
        this.sharedResourceUI.show();

        // --- ✨ 첫 턴 시작 시 토큰 지급 ---
        tokenEngine.addTokensForNewTurn();
        // 스킬 사용 기록 초기화
        skillEngine.resetTurnActions();

        // [✨ 수정] 첫 턴 시작 직후 모든 유닛의 토큰 UI를 업데이트합니다.
        // unit.uniqueId 대신 unit 객체 전체를 전달합니다.
        allUnits.forEach(unit => this.vfxManager.updateTokenDisplay(unit));

        this.gameLoop(); // 수정된 루프 시작
    }

    _setupUnits(units) {
        units.forEach(unit => {
            if (!unit.sprite) return;

            // --- ✨ unitId를 스프라이트에 먼저 설정 ---
            unit.sprite.setData('unitId', unit.uniqueId);
            unit.sprite.setData('team', unit.team);

            unit.currentHp = unit.finalStats.hp;
            // ✨ 배리어 상태 초기화
            unit.maxBarrier = unit.finalStats.maxBarrier;
            unit.currentBarrier = unit.finalStats.currentBarrier;
            const cell = formationEngine.getCellFromSprite(unit.sprite);
            if (cell) {
                unit.gridX = cell.col;
                unit.gridY = cell.row;
            }

            // ✨ [수정] 팀에 따라 이름표 색상을 다르게 설정합니다.
            const nameColor = unit.team === 'ally' ? '#60a5fa' : '#f87171';
            const nameTag = this.textEngine.createLabel(unit.sprite, unit.instanceName, nameColor);

            // 그림자 생성 후 원본 스프라이트와 함께 이동하도록 바인딩합니다.
            const shadow = this.shadowManager.createShadow(unit.sprite);

            this.bindingManager.bind(unit.sprite, [nameTag, shadow]);
        });
    }

    // gameLoop를 while 루프로 변경
    async gameLoop() {
        while (this.isRunning && !this.isBattleOver()) {
            const currentUnit = this.turnQueue[this.currentTurnIndex];

            // 현재 턴 표시를 위해 턴 순서 UI 업데이트
            this.turnQueue.forEach((u, index) => u.isTurnActive = (index === this.currentTurnIndex));
            this.turnOrderUI.update(this.turnQueue);

            // 턴을 처리하기 전에 유닛이 살아있는지 확인하여 죽은 유닛의 턴을 건너뜁니다.
            if (currentUnit && currentUnit.currentHp > 0) {
                // 현재 턴을 진행하는 유닛 정보를 하단 UI에 표시
                this.combatUI.show(currentUnit);

                if (!currentUnit.isStunned) {
                    this.scene.cameraControl.panTo(currentUnit.sprite.x, currentUnit.sprite.y);
                    await delayEngine.hold(500);

                    if (aiManager.unitData.has(currentUnit.uniqueId)) {
                        const allies = this.turnQueue.filter(u => u.team === 'ally' && u.currentHp > 0);
                        const enemies = this.turnQueue.filter(u => u.team === 'enemy' && u.currentHp > 0);

                        await aiManager.executeTurn(currentUnit, [...allies, ...enemies], currentUnit.team === 'ally' ? enemies : allies);
                    }
                } else {
                    console.log(`%c[Battle] ${currentUnit.instanceName}은(는) 기절해서 움직일 수 없습니다!`, "color: yellow;");
                }

                // 살아있는 유닛은 기절 여부와 관계없이 쿨다운이 감소해야 합니다.
                cooldownManager.reduceCooldowns(currentUnit.uniqueId);

                // 행동이 끝난 후 UI를 다시 업데이트하여 변경된 체력 등을 즉시 반영합니다.
                this.combatUI.show(currentUnit);
                await delayEngine.hold(500); // 변경된 상태를 잠시 보여줍니다.
            }

            this.currentTurnIndex++;
            if (this.currentTurnIndex >= this.turnQueue.length) {
                this.currentTurnIndex = 0;
                this.currentTurnNumber++; // 모든 유닛의 턴이 끝나면 전체 턴 수 증가

                statusEffectManager.onTurnEnd();
                tokenEngine.addTokensForNewTurn();
                skillEngine.resetTurnActions();
            }

            // 다음 턴을 위해 턴 순서 UI 갱신
            this.turnQueue.forEach((u, idx) => u.isTurnActive = (idx === this.currentTurnIndex));
            this.turnOrderUI.update(this.turnQueue);

            // --- ✨ 매 행동 후 모든 유닛의 토큰 UI 업데이트 ---
            // unit.uniqueId 대신 unit 객체 전체를 전달합니다.
            this.turnQueue.forEach(unit => {
                if (unit.sprite && unit.sprite.active) {
                    this.vfxManager.updateTokenDisplay(unit);
                }
            });
            this.sharedResourceUI.update();

            // 다음 턴의 유닛 정보를 미리 갱신합니다.
            const nextUnit = this.turnQueue[this.currentTurnIndex];
            // 다음 턴의 유닛이 살아있을 때만 UI를 업데이트합니다.
            if (nextUnit && nextUnit.currentHp > 0) {
                this.combatUI.show(nextUnit);
            } else if (!this.isBattleOver()) {
                // 전투가 끝나지 않았는데 다음 유닛이 유효하지 않으면 UI를 숨깁니다.
                this.combatUI.hide();
            }

            await delayEngine.hold(1000);
        }

        if (!this.isRunning) return;

        // 전투 종료 시 UI 숨김 처리
        this.combatUI.hide();
        this.turnOrderUI.hide();
        this.sharedResourceUI.hide();
        console.log('전투 종료!');
    }

    isBattleOver() {
        const aliveAllies = this.turnQueue.filter(u => u.team === 'ally' && u.currentHp > 0).length;
        const aliveEnemies = this.turnQueue.filter(u => u.team === 'enemy' && u.currentHp > 0).length;
        return aliveAllies === 0 || aliveEnemies === 0;
    }

    shutdown() {
        this.isRunning = false;
        if (this.vfxManager) {
            this.vfxManager.shutdown();
        }
        if (this.textEngine) {
            this.textEngine.shutdown();
        }
        if (this.shadowManager) {
            this.shadowManager.shutdown();
        }
        if (this.combatUI) {
            this.combatUI.destroy();
        }
        if (this.turnOrderUI) {
            this.turnOrderUI.destroy();
        }
        if (this.sharedResourceUI) {
            this.sharedResourceUI.destroy();
        }
    }
}
