import { Scene } from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { BattleStageManager } from '../utils/BattleStageManager.js';
import { CameraControlEngine } from '../utils/CameraControlEngine.js';
import { formationEngine } from '../utils/FormationEngine.js';
import { mercenaryEngine } from '../utils/MercenaryEngine.js';
import { partyEngine } from '../utils/PartyEngine.js';
import { monsterEngine } from '../utils/MonsterEngine.js';
import { getMonsterBase } from '../data/monster.js';
import { DOMEngine } from '../utils/DOMEngine.js';
import { createNameLabelCanvas } from '../utils/NameLabelFactory.js';
import { debugCoordinateManager } from '../debug/DebugCoordinateManager.js';

export class CursedForestBattleScene extends Scene {
    constructor() {
        super('CursedForestBattle');
        this.stageManager = null;
        this.cameraControl = null;
        this.domEngine = null;
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
        this.domEngine = new DOMEngine(this);

        // 아군 배치
        const partyIds = partyEngine.getPartyMembers().filter(id => id !== undefined);
        const allMercs = mercenaryEngine.getAllAlliedMercenaries();
        const partyUnits = allMercs.filter(m => partyIds.includes(m.uniqueId));
        const allySprites = formationEngine.applyFormation(this, partyUnits);

        // 적 몬스터 생성 및 배치
        const monsters = [];
        const zombieBase = getMonsterBase('zombie');
        for (let i = 0; i < 5; i++) {
            monsters.push(monsterEngine.spawnMonster(zombieBase, 'enemy'));
        }
        const enemySprites = formationEngine.placeMonsters(this, monsters, 8);

        // 이름표 생성
        allySprites.forEach((sprite, idx) => {
            const unit = partyUnits[idx];
            const label = createNameLabelCanvas(
                unit.instanceName || unit.name,
                'rgba(0,0,255,0.7)'
            );

            // 이름표 위치 보정 및 디버그 로그 추가
            const labelWidth = parseFloat(label.style.width) || 0;
            const labelHeight = parseFloat(label.style.height) || 0;
            label.style.marginLeft = `-${labelWidth / 2}px`;
            label.style.marginTop = `${sprite.displayHeight / 2 - labelHeight}px`;

            const syncedElement = this.domEngine.syncElement(sprite, label);

            // 디버그: 좌표 기록
            const imageCoord = { x: sprite.x, y: sprite.y };
            const labelRect = syncedElement.getBoundingClientRect();
            const gameRect = this.sys.game.canvas.getBoundingClientRect();
            const labelCoord = {
                x: labelRect.left - gameRect.left,
                y: labelRect.top - gameRect.top
            };
            debugCoordinateManager.logCoordinates(
                unit.instanceName || unit.name,
                imageCoord,
                labelCoord
            );
        });

        enemySprites.forEach((sprite, idx) => {
            const mon = monsters[idx];
            const label = createNameLabelCanvas(
                mon.instanceName || mon.name,
                'rgba(255,0,0,0.7)'
            );

            // 이름표 위치 보정 및 디버그 로그 추가
            const labelWidth = parseFloat(label.style.width) || 0;
            const labelHeight = parseFloat(label.style.height) || 0;
            label.style.marginLeft = `-${labelWidth / 2}px`;
            label.style.marginTop = `${sprite.displayHeight / 2 - labelHeight}px`;

            const syncedElement = this.domEngine.syncElement(sprite, label);

            // 디버그: 좌표 기록
            const imageCoord = { x: sprite.x, y: sprite.y };
            const labelRect = syncedElement.getBoundingClientRect();
            const gameRect = this.sys.game.canvas.getBoundingClientRect();
            const labelCoord = {
                x: labelRect.left - gameRect.left,
                y: labelRect.top - gameRect.top
            };
            debugCoordinateManager.logCoordinates(
                mon.instanceName || mon.name,
                imageCoord,
                labelCoord
            );
        });

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
            if (this.domEngine) {
                this.domEngine.shutdown();
            }
        });
    }
}
