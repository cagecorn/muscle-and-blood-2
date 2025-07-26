import { debugLogEngine } from './DebugLogEngine.js';
import { monsterEngine } from './MonsterEngine.js';
import { formationEngine } from './FormationEngine.js';
import { getMonsterBase } from '../data/monster.js';
import { getSummonBase } from '../data/summon.js';

/**
 * 전투 중 유닛 소환을 담당하는 엔진
 */
class SummoningEngine {
    constructor(scene, battleSimulator) {
        this.scene = scene;
        this.battleSimulator = battleSimulator; // 전투 시뮬레이터 참조
        debugLogEngine.log('SummoningEngine', '소환 엔진이 초기화되었습니다.');
    }

    /**
     * 스킬 효과로 유닛을 소환합니다.
     * @param {object} summoner - 소환을 시전하는 유닛
     * @param {object} summonSkillData - 사용된 소환 스킬의 데이터
     * @returns {object|null} - 성공적으로 소환된 유닛 인스턴스 또는 실패 시 null
     */
    summon(summoner, summonSkillData) {
        if (!summoner || !summonSkillData || !summonSkillData.creatureId) {
            debugLogEngine.warn('SummoningEngine', '소환사 또는 소환 스킬 정보가 유효하지 않습니다.');
            return null;
        }

        // 1. 소환될 위치 찾기 (소환사 주변의 빈 칸)
        const summonCell = this._findBestSummonCell(summoner);
        if (!summonCell) {
            debugLogEngine.warn('SummoningEngine', `${summoner.instanceName} 주변에 소환할 공간이 없습니다.`);
            // 여기에 소환 실패 시 시각 효과를 추가할 수 있습니다 (예: '소환 실패!' 텍스트)
            if (this.battleSimulator.vfxManager) {
                this.battleSimulator.vfxManager.showSkillName(summoner.sprite, "소환 실패", "#ff0000");
            }
            return null;
        }

        // 2. 소환수 데이터 생성
        let monsterBase = getMonsterBase(summonSkillData.creatureId);
        if (!monsterBase) {
            monsterBase = getSummonBase(summonSkillData.creatureId);
        }
        if (!monsterBase) {
            debugLogEngine.error('SummoningEngine', `몬스터 데이터베이스에서 '${summonSkillData.creatureId}'를 찾을 수 없습니다.`);
            return null;
        }
        // 소환수는 소환사와 같은 팀으로 생성됩니다.
        const summonedUnit = monsterEngine.spawnMonster(monsterBase, summoner.team);

        // 3. 소환수 전장 배치
        formationEngine.placeUnitAt(this.scene, summonedUnit, summonCell.col, summonCell.row);

        // 4. 소환된 유닛의 VFX(이름표, 체력바 등) 설정
        // BattleSimulatorEngine의 유닛 설정 로직을 재활용합니다.
        this.battleSimulator._setupUnits([summonedUnit]);

        // 5. 소환사에게 체력 페널티 적용
        const penalty = Math.round(summoner.finalStats.hp * (summonSkillData.healthCostPercent || 0.1)); // 기본 10%
        summoner.currentHp -= penalty;

        // VFX 매니저를 통해 시각 효과 업데이트
        if (this.battleSimulator.vfxManager) {
            this.battleSimulator.vfxManager.createDamageNumber(summoner.sprite.x, summoner.sprite.y, `-${penalty}`, '#9333ea');
            this.battleSimulator.vfxManager.updateHealthBar(summoner.healthBar, summoner.currentHp, summoner.finalStats.hp);
        }

        // 6. 전투 턴 큐에 소환수 추가
        this.battleSimulator.turnQueue.push(summonedUnit);

        debugLogEngine.log('SummoningEngine', `${summoner.instanceName}이(가) ${summonedUnit.instanceName}을(를) (${summonCell.col}, ${summonCell.row})에 소환했습니다.`);

        return summonedUnit;
    }

    /**
     * 소환사를 기준으로 소환에 가장 적합한 빈 칸을 찾습니다.
     * @param {object} summoner - 소환사 유닛
     * @returns {object|null} - 최적의 그리드 셀 또는 null
     * @private
     */
    _findBestSummonCell(summoner) {
        const { gridX, gridY } = summoner;
        const directions = [
            { col: 0, row: -1 }, // Up
            { col: 0, row: 1 },  // Down
            { col: -1, row: 0 }, // Left
            { col: 1, row: 0 },  // Right
            { col: -1, row: -1 }, // Up-Left
            { col: 1, row: -1 },  // Up-Right
            { col: -1, row: 1 },  // Down-Left
            { col: 1, row: 1 },   // Down-Right
        ];

        for (const dir of directions) {
            const checkCol = gridX + dir.col;
            const checkRow = gridY + dir.row;
            const cell = formationEngine.grid.getCell(checkCol, checkRow);

            if (cell && !cell.isOccupied) {
                return cell; // 가장 먼저 찾은 빈 칸을 반환
            }
        }

        return null; // 주변에 빈 칸이 없음
    }
}

export { SummoningEngine };
