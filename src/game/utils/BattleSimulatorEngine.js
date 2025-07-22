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
        const allUnits = [...allies, ...enemies];
        
        // 유닛 배치 및 시각 요소 설정
        this._setupUnits(allies, '#63b1ff');
        this._setupUnits(enemies, '#ff6363');

        // AI 등록
        enemies.forEach(unit => aiManager.registerUnit(unit, createMeleeAI(this.aiEngines)));
        allies.forEach(unit => { // 아군 전사도 AI로 등록 (테스트용)
            if (unit.name === '전사') {
                aiManager.registerUnit(unit, createMeleeAI(this.aiEngines));
            }
        });

        // 턴 큐 생성 및 전투 시작
        this.turnQueue = turnOrderManager.createTurnQueue(allUnits);
        this.nextTurn();
    }

    _setupUnits(units, color) {
        formationEngine.placeUnits(this.scene, units); // 유닛 배치
        units.forEach(unit => {
            // 초기 데이터 설정
            unit.currentHp = unit.finalStats.hp;
            const cell = formationEngine.getCellFromSprite(unit.sprite);
            unit.gridX = cell.col;
            unit.gridY = cell.row;

            // 시각 요소 생성 및 바인딩
            const nameLabel = this.textEngine.createLabel(unit.sprite, unit.instanceName, color);
            const healthBar = this.vfxManager.createHealthBar(unit.sprite);
            unit.healthBar = healthBar; // 유닛 객체에 체력바 참조 저장
            
            this.bindingManager.bind(unit.sprite, [nameLabel, healthBar.background, healthBar.foreground]);
        });
    }

    async nextTurn() {
        // 모든 유닛이 행동했으면 턴 인덱스 초기화
        if (this.currentTurnIndex >= this.turnQueue.length) {
            this.currentTurnIndex = 0;
        }

        const currentUnit = this.turnQueue[this.currentTurnIndex];

        // 유닛이 사망했으면 턴을 건너뜀
        if (currentUnit.currentHp <= 0) {
            this.currentTurnIndex++;
            this.nextTurn();
            return;
        }

        // 현재 턴인 유닛을 카메라가 따라감
        this.scene.cameraControl.panTo(currentUnit.sprite.x, currentUnit.sprite.y);
        await delayEngine.hold(500); // 카메라 이동 시간 대기

        if (aiManager.unitData.has(currentUnit.uniqueId)) {
            const allies = this.turnQueue.filter(u => u.team === 'ally' && u.currentHp > 0);
            const enemies = this.turnQueue.filter(u => u.team === 'enemy' && u.currentHp > 0);
            
            await aiManager.executeTurn(currentUnit, [...allies, ...enemies], currentUnit.team === 'ally' ? enemies : allies);
        }

        this.currentTurnIndex++;
        
        // 1초 후 다음 턴 진행
        this.scene.time.delayedCall(1000, this.nextTurn, [], this);
    }
    
    shutdown() {
        // 모든 매니저 종료 처리...
    }
}
