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
import { GlobalTurnClock } from '../utils/GlobalTurnClock.js'; // 새로운 시계 가져오기

export class ArenaBattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ArenaBattleScene' });
    }

    init(data) {
        this.playerUnits = data.playerUnits;
        this.enemyUnits = data.enemyUnits;
        this.battlefield = data.battlefield || 'arena'; // 기본값으로 'arena' 설정
    }

    create() {
        console.log('ArenaBattleScene: create');

        // 모든 유닛 리스트 생성
        this.allUnits = [...this.playerUnits, ...this.enemyUnits];

        // GridEngine 초기화
        this.gridEngine = new GridEngine(this, 32); // 타일 크기는 32로 가정

        // 배경 설정
        this.battleStageManager = new BattleStageManager(this, this.battlefield);
        this.battleStageManager.createBackground();

        // 카메라 설정
        this.cameraEngine = new CameraEngine(this);
        this.cameraEngine.setupMainCamera(this.allUnits);

        // 스프라이트 및 애니메이션 엔진 초기화
        this.animationEngine = new AnimationEngine(this);
        this.spriteEngine = new SpriteEngine(this, this.gridEngine, this.animationEngine);
        this.spriteEngine.createUnitSprites(this.allUnits);
        
        // UI 매니저 초기화
        this.combatUIManager = new CombatUIManager(this);
        this.combatUIManager.createUnitUI(this.allUnits);
        
        // --- 핵심 변경점 ---
        // 기존 TurnOrderManager를 제거하고 GlobalTurnClock을 사용합니다.
        this.globalTurnClock = new GlobalTurnClock(this, 1500); // 1.5초 간격으로 설정

        // BattleEngine, AIManager, TerminationManager 초기화
        // 아직 GlobalTurnClock과 직접 연결하지는 않습니다. 다음 단계에서 연결합니다.
        this.battleEngine = new BattleEngine(this, this.allUnits, this.gridEngine, this.spriteEngine, this.combatUIManager, this.animationEngine);
        this.aiManager = new AIManager(this, this.allUnits, this.gridEngine, this.battleEngine);
        this.terminationManager = new TerminationManager(this, this.allUnits);

        // 'new-global-turn' 이벤트 리스너 설정
        // 새로운 턴 신호가 올 때마다 AI가 행동을 결정하도록 다음 단계에서 이 부분을 수정할 겁니다.
        this.events.on('new-global-turn', () => {
            console.log("새로운 글로벌 턴이 시작되었습니다!");
            // 여기에 모든 유닛의 행동을 시작하는 코드가 들어갈 예정입니다.
        });
        
        // 전투 시작!
        this.globalTurnClock.start();

        // 승리/패배 조건 확인 이벤트 리스너
        this.events.on('unit-died', () => {
            if (this.terminationManager.checkWinCondition()) {
                this.globalTurnClock.stop();
                console.log("승리했습니다!");
                // TODO: 승리 화면으로 전환
            }
            if (this.terminationManager.checkLossCondition()) {
                this.globalTurnClock.stop();
                console.log("패배했습니다.");
                // TODO: 패배 화면으로 전환
            }
        });
    }

    update(time, delta) {
        // 이 update 함수는 주로 시각적인 효과나 부드러운 움직임을 위해 사용됩니다.
        // 게임의 핵심 로직은 이제 GlobalTurnClock의 이벤트에 의해 동작합니다.
        this.cameraEngine.followUnits(this.allUnits);
    }
}
