import Phaser from 'phaser';
import { GridEngine } from '../utils/GridEngine.js';
import { SpriteEngine } from '../utils/SpriteEngine.js';
import { BattleEngine } from '../utils/BattleEngine.js';
import { AIManager } from '../../ai/AIManager.js';
import { TerminationManager } from '../utils/TerminationManager.js';
import { AnimationEngine } from '../utils/AnimationEngine.js';
import { BattleStageManager } from '../utils/BattleStageManager.js';
import { CameraEngine } from '../utils/CameraEngine.js';
import { CombatUIManager } from '../dom/CombatUIManager.js';
import { GlobalTurnClock } from '../utils/GlobalTurnClock.js';

export class ArenaBattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ArenaBattleScene' });
        this.isProcessingTurn = false; // 턴 처리 중복 실행 방지 플래그
    }

    init(data) {
        this.playerUnits = data.playerUnits;
        this.enemyUnits = data.enemyUnits;
        this.battlefield = data.battlefield || 'arena';
    }

    create() {
        this.allUnits = [...this.playerUnits, ...this.enemyUnits];

        this.gridEngine = new GridEngine(this, 32);
        this.battleStageManager = new BattleStageManager(this, this.battlefield);
        this.battleStageManager.createBackground();
        this.cameraEngine = new CameraEngine(this);
        this.cameraEngine.setupMainCamera(this.allUnits);
        this.animationEngine = new AnimationEngine(this);
        this.spriteEngine = new SpriteEngine(this, this.gridEngine, this.animationEngine);
        this.spriteEngine.createUnitSprites(this.allUnits);
        this.combatUIManager = new CombatUIManager(this);
        this.combatUIManager.createUnitUI(this.allUnits);
        
        this.globalTurnClock = new GlobalTurnClock(this, 1500);
        
        // [변경점] BattleEngine을 생성할 때 aiManager를 전달합니다.
        this.aiManager = new AIManager(this, this.allUnits, this.gridEngine, null); // BattleEngine이 아직 없으므로 null 전달
        this.battleEngine = new BattleEngine(this, this.allUnits, this.gridEngine, this.spriteEngine, this.combatUIManager, this.animationEngine, this.aiManager);
        this.aiManager.battleEngine = this.battleEngine; // AIManager에 BattleEngine 연결

        this.terminationManager = new TerminationManager(this, this.allUnits);

        // 'new-global-turn' 이벤트가 발생하면 processTurn 메소드를 호출합니다.
        this.events.on('new-global-turn', this.processTurn, this);
        
        // 모든 행동이 완료되면 다시 턴을 처리할 수 있도록 플래그를 리셋합니다.
        this.events.on('all-actions-completed', () => {
            this.isProcessingTurn = false;
        });

        this.events.on('unit-died', () => {
            if (this.terminationManager.checkWinCondition() || this.terminationManager.checkLossCondition()) {
                this.globalTurnClock.stop();
                // 승리 또는 패배 처리
            }
        });

        this.globalTurnClock.start();
    }
    
    /**
     * [신규] 글로벌 턴을 처리하는 메소드
     */
    async processTurn() {
        // 이미 턴을 처리 중이면 중복 실행하지 않습니다.
        if (this.isProcessingTurn) {
            return;
        }
        this.isProcessingTurn = true;
        
        // AI가 모든 유닛의 행동을 결정하고 BattleEngine이 실행합니다.
        const actions = this.aiManager.decideAndRequestActions();
        await this.battleEngine.executeMultipleActions(actions);
    }

    update(time, delta) {
        this.cameraEngine.followUnits(this.allUnits);
    }
}
