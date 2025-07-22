import { debugLogEngine } from './DebugLogEngine.js';

class FormationEngine {
    constructor() {
        this.positions = new Map();
        this.grid = null; // 전투 타일 그리드 참조
    }

    registerGrid(gridEngine) {
        this.grid = gridEngine;
    }

    setPosition(unitId, cellIndex) {
        this.positions.set(unitId, cellIndex);
    }

    getPosition(unitId) {
        return this.positions.get(unitId);
    }

    removePosition(unitId) {
        this.positions.delete(unitId);
    }

    /**
     * 주어진 유닛들을 그리드에 배치합니다. 위치가 지정되지 않은 유닛은 빈 칸에 무작위로 배치됩니다.
     * 배치된 스프라이트를 반환하며 unit.sprite 속성에 저장합니다.
     * @param {Phaser.Scene} scene
     * @param {Array<object>} units
     * @param {number} startCol 배치를 시작할 최소 열 (기본값 0)
     * @returns {Array<Phaser.GameObjects.Image>}
     */
    placeUnits(scene, units, startCol = 0, endCol = 7) {
        if (!this.grid) return [];
        const sprites = [];
        const availableCells = this.grid.gridCells.filter(c => c.col >= startCol && c.col <= endCol && !c.isOccupied);

        units.forEach(unit => {
            if (availableCells.length === 0) {
                console.warn('FormationEngine: 유닛을 배치할 비어있는 셀이 없습니다.');
                return;
            }

            const cellIndex = Math.floor(Math.random() * availableCells.length);
            const cell = availableCells.splice(cellIndex, 1)[0];

            cell.isOccupied = true;
            
            const spriteKey = unit.spriteKey || unit.battleSprite || unit.id || unit.name;
            const sprite = scene.add.image(cell.x, cell.y, spriteKey);
            sprite.setData('unitId', unit.uniqueId);
            const texture = scene.textures.get(spriteKey);
            if (texture && texture.source[0]) {
                const scale = Math.min(
                    cell.width / texture.source[0].width,
                    cell.height / texture.source[0].height
                );
                sprite.setScale(scale);
            } else {
                sprite.setDisplaySize(cell.width, cell.height);
            }

            sprites.push(sprite);
            unit.sprite = sprite;
            cell.sprite = sprite;
            unit.gridX = cell.col;
            unit.gridY = cell.row;
        });

        return sprites;
    }

    /**
     * 스프라이트 위치를 통해 해당 그리드 셀 정보를 반환합니다.
     * @param {Phaser.GameObjects.Image} sprite
     * @returns {object|null}
     */
    getCellFromSprite(sprite) {
        if (!this.grid || !sprite) return null;
        return this.grid.gridCells.find(c => c.x === sprite.x && c.y === sprite.y) || null;
    }

    /**
     * 저장된 위치를 기반으로 유닛 스프라이트를 전투 그리드에 배치합니다.
     * @param {Phaser.Scene} scene 배치가 이루어질 씬
     * @param {Array<object>} units 유닛 데이터 배열
     */
    applyFormation(scene, units) {
        if (!this.grid) return [];
        const sprites = [];
        units.forEach(unit => {
            const index = this.getPosition(unit.uniqueId);
            const cell = this.grid.gridCells[index];
            if (!cell) return;
            const spriteKey = unit.spriteKey || unit.battleSprite || unit.id || unit.name;
            const sprite = scene.add.image(cell.x, cell.y, spriteKey);
            sprite.setData('unitId', unit.uniqueId);
            const texture = scene.textures.get(spriteKey);
            if (texture && texture.source[0]) {
                const scale = Math.min(
                    cell.width / texture.source[0].width,
                    cell.height / texture.source[0].height
                );
                sprite.setScale(scale);
            } else {
                sprite.setDisplaySize(cell.width, cell.height);
            }
            sprites.push(sprite);
        });
        return sprites;
    }

    /**
     * 적군 몬스터를 무작위 위치에 배치합니다.
     * @param {Phaser.Scene} scene
     * @param {Array<object>} monsters
     * @param {number} startCol 적군 배치가 시작될 최소 열
     */
    placeMonsters(scene, monsters, startCol = 8) {
        if (!this.grid) return [];
        const cells = this.grid.gridCells.filter(c => c.col >= startCol && !c.isOccupied);
        const sprites = [];
        monsters.forEach(mon => {
            const cell = cells.splice(Math.floor(Math.random() * cells.length), 1)[0];
            if (!cell) return;
            cell.isOccupied = true;
            const spriteKey = mon.spriteKey || mon.battleSprite || mon.id || mon.name;
            const sprite = scene.add.image(cell.x, cell.y, spriteKey);
            sprite.setData('unitId', mon.uniqueId);
            const texture = scene.textures.get(spriteKey);
            if (texture && texture.source[0]) {
                const scale = Math.min(
                    cell.width / texture.source[0].width,
                    cell.height / texture.source[0].height
                );
                sprite.setScale(scale);
            } else {
                sprite.setDisplaySize(cell.width, cell.height);
            }
            sprites.push(sprite);
        });
        return sprites;
    }

    /**
     * 유닛을 그리드 상의 새로운 위치로 이동시키고, 애니메이션을 재생합니다.
     * @param {object} unit - 이동할 유닛 객체 (gridX, gridY, sprite 포함)
     * @param {object} newGridPos - 새로운 그리드 좌표 { col, row }
     * @param {AnimationEngine} animationEngine - 애니메이션을 실행할 엔진
     * @param {BindingManager} bindingManager - 바인딩된 요소들을 함께 움직일 매니저
     * @param {number} duration - 이동 시간 (밀리초)
     * @returns {Promise<void>}
     */
    async moveUnitOnGrid(unit, newGridPos, animationEngine, bindingManager, duration = 500) {
        if (!this.grid || !unit || !unit.sprite) return;

        const targetCell = this.grid.getCell(newGridPos.col, newGridPos.row);
        if (!targetCell) return;

        const targetPixelPos = { x: targetCell.x, y: targetCell.y };

        await animationEngine.moveTo(unit.sprite, targetPixelPos.x, targetPixelPos.y, duration);

        const oldCell = this.grid.getCell(unit.gridX, unit.gridY);
        if (oldCell) {
            oldCell.isOccupied = false;
            oldCell.sprite = null;
        }

        unit.gridX = newGridPos.col;
        unit.gridY = newGridPos.row;
        targetCell.isOccupied = true;
        targetCell.sprite = unit.sprite;

        debugLogEngine.log('FormationEngine', `유닛을 (${newGridPos.col}, ${newGridPos.row})로 이동 완료.`);
    }
}

export const formationEngine = new FormationEngine();
