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

        this.stageManager = new BattleStageManager(this);
        this.stageManager.createStage('battle-stage-cursed-forest');
        this.cameraControl = new CameraControlEngine(this);

        // BattleSimulatorEngine 사용
        this.battleSimulator = new BattleSimulatorEngine(this);

        // 파티 유닛과 몬스터 데이터를 준비합니다.
        const partyIds = partyEngine.getPartyMembers().filter(id => id !== undefined);
        const allMercs = mercenaryEngine.getAllAlliedMercenaries();
        const partyUnits = allMercs.filter(m => partyIds.includes(m.uniqueId));

        const monsters = [];
        const zombieBase = getMonsterBase('zombie');
        for (let i = 0; i < 5; i++) {
            monsters.push(monsterEngine.spawnMonster(zombieBase, 'enemy'));
        }

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
