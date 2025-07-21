import { Scene } from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { BattleStageManager } from '../utils/BattleStageManager.js';
import { formationEngine } from '../utils/FormationEngine.js';
import { mercenaryEngine } from '../utils/MercenaryEngine.js';
import { partyEngine } from '../utils/PartyEngine.js';
import { monsterEngine } from '../utils/MonsterEngine.js';
import { getMonsterBase } from '../data/monster.js';

export class CursedForestBattleScene extends Scene {
    constructor() {
        super('CursedForestBattle');
        this.stageManager = null;
    }

    create() {
        // DOM 컨테이너들 숨기기
        ['dungeon-container','territory-container'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        this.stageManager = new BattleStageManager(this);
        this.stageManager.createStage('battle-stage-cursed-forest');

        // 아군 배치
        const partyIds = partyEngine.getPartyMembers().filter(id => id !== undefined);
        const allMercs = mercenaryEngine.getAllAlliedMercenaries();
        const partyUnits = allMercs.filter(m => partyIds.includes(m.uniqueId));
        formationEngine.applyFormation(this, partyUnits);

        // 적 몬스터 생성 및 배치
        const monsters = [];
        const zombieBase = getMonsterBase('zombie');
        for (let i = 0; i < 5; i++) {
            monsters.push(monsterEngine.spawnMonster(zombieBase, 'enemy'));
        }
        formationEngine.placeMonsters(this, monsters, 8);

        this.events.on('shutdown', () => {
            ['dungeon-container', 'territory-container'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'block';
            });

            if (this.stageManager) {
                this.stageManager.destroy();
            }
        });
    }
}
