import { Scene } from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { BattleStageManager } from '../utils/BattleStageManager.js';
import { CameraControlEngine } from '../utils/CameraControlEngine.js';
import { mercenaryEngine } from '../utils/MercenaryEngine.js';
import { partyEngine } from '../utils/PartyEngine.js';
import { monsterEngine } from '../utils/MonsterEngine.js';
import { getMonsterBase } from '../data/monster.js';
import { BattleSimulatorEngine } from '../utils/BattleSimulatorEngine.js';

export class CursedForestBattleScene extends Scene {
    constructor() {
        super('CursedForestBattle');
        this.stageManager = null;
        this.cameraControl = null;
        this.battleSimulator = null;
    }

    create() {
        // DOM 컨테이너들 숨기기
        ['dungeon-container','territory-container'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        // ✨ 스테이지 구성을 정의합니다. (나중에 별도 파일로 분리 가능)
        const stageConfig = {
            background: 'battle-stage-cursed-forest',
            monsters: [
                { id: 'zombie', count: 5 }
            ]
        };

        this.stageManager = new BattleStageManager(this);
        this.stageManager.createStage(stageConfig.background);
        this.cameraControl = new CameraControlEngine(this);

        // 전투가 시작되면 기본 카메라 줌을 2배로 고정합니다.
        this.cameras.main.setZoom(2);

        // BattleSimulatorEngine 사용
        this.battleSimulator = new BattleSimulatorEngine(this);

        // 파티 유닛과 몬스터 데이터를 준비합니다.
        const partyUnits = partyEngine.getDeployedMercenaries();
        this.partyUnits = partyUnits; // 추적을 위해 저장

        const monsters = [];
        stageConfig.monsters.forEach(monsterInfo => {
            const monsterBase = getMonsterBase(monsterInfo.id);
            for (let i = 0; i < monsterInfo.count; i++) {
                monsters.push(monsterEngine.spawnMonster(monsterBase, 'enemy'));
            }
        });

        // BattleSimulatorEngine을 통해 전투를 시작합니다.
        this.battleSimulator.start(partyUnits, monsters);


        this.events.on('shutdown', () => {
            ['dungeon-container', 'territory-container'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'block';
            });

            if (this.stageManager) {
                this.stageManager.destroy();
            }
            if (this.cameraControl) {
                this.cameraControl.destroy();
            }
            if (this.battleSimulator) {
                this.battleSimulator.shutdown();
            }
        });
    }
}
