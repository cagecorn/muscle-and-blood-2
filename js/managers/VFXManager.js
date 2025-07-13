// js/managers/VFXManager.js

export class VFXManager {
    // animationManager를 추가로 받아 유닛의 애니메이션 위치를 참조합니다.
    constructor(renderer, measureManager, cameraEngine, battleSimulationManager, animationManager, eventManager) {
        console.log("\u2728 VFXManager initialized. Ready to render visual effects. \u2728");
        this.renderer = renderer;
        this.measureManager = measureManager;
        this.cameraEngine = cameraEngine;
        this.battleSimulationManager = battleSimulationManager; // 유닛 데이터를 가져오기 위함
        this.animationManager = animationManager; // ✨ AnimationManager 저장
        this.eventManager = eventManager;

        this.activeDamageNumbers = [];

        // ✨ 무기 드롭 애니메이션 관리
        this.eventManager.subscribe('weaponDropped', this._onWeaponDropped.bind(this));
        this.activeWeaponDrops = new Map(); // unitId => animation data
        console.log("[VFXManager] Subscribed to 'weaponDropped' event.");

        // ✨ subscribe to damage display events
        this.eventManager.subscribe('displayDamage', (data) => {
            this.addDamageNumber(data.unitId, data.damage, data.color);
        });
    }

    /**
     * 특정 유닛 위에 데미지 숫자를 표시하도록 큐에 추가합니다.
     * @param {string} unitId - 데미지를 받은 유닛의 ID
     * @param {number} damageAmount - 표시할 데미지 양
     * @param {string} [color='red'] - 데미지 숫자의 색상 (예: 'yellow', 'red')
     */
    addDamageNumber(unitId, damageAmount, color = 'red') {
        const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === unitId);
        if (!unit) {
            console.warn(`[VFXManager] Cannot show damage for unknown unit: ${unitId}`);
            return;
        }

        this.activeDamageNumbers.push({
            unitId: unitId,
            damage: damageAmount,
            startTime: performance.now(),
            duration: 1000,
            floatSpeed: 0.05,
            color: color
        });
        console.log(`[VFXManager] Added damage number: ${damageAmount} (${color}) for ${unit.name}`);
    }

    /**
     * 'weaponDropped' 이벤트 발생 시 호출됩니다.
     * @param {{ unitId: string, weaponSpriteId: string }} data
     */
    _onWeaponDropped(data) {
        const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === data.unitId);
        if (!unit) {
            console.warn(`[VFXManager] Cannot find unit '${data.unitId}' for weapon drop animation.`);
            return;
        }

        const weaponImage = this.battleSimulationManager.assetLoaderManager.getImage(data.weaponSpriteId);
        if (!weaponImage) {
            console.warn(`[VFXManager] Weapon sprite '${data.weaponSpriteId}' not loaded.`);
            return;
        }

        const sceneContentDimensions = this.battleSimulationManager.logicManager.getCurrentSceneContentDimensions(); // 이제 순수 그리드 크기를 반환
        const canvasWidth = this.measureManager.get('gameResolution.width'); // 캔버스 실제 CSS 너비
        const canvasHeight = this.measureManager.get('gameResolution.height'); // 캔버스 실제 CSS 높이

        const stagePadding = this.measureManager.get('battleStage.padding');

        // LogicManager에서 계산된 순수 그리드 컨텐츠 크기 (패딩 제외)
        const gridContentWidth = sceneContentDimensions.width;
        const gridContentHeight = sceneContentDimensions.height;

        // 이 gridContentWidth/Height를 사용하여 effectiveTileSize를 역으로 계산
        const effectiveTileSize = gridContentWidth / this.battleSimulationManager.gridCols;

        // 전체 그리드 크기 (여기서는 gridContentWidth/Height와 동일)
        const totalGridWidth = gridContentWidth;
        const totalGridHeight = gridContentHeight;

        // ✨ 그리드를 캔버스 중앙에 배치하기 위한 오프셋 계산 (패딩 포함)
        // (캔버스 전체 크기 - 그리드 컨텐츠 크기) / 2 + 패딩
        const gridOffsetX = (canvasWidth - totalGridWidth) / 2;
        const gridOffsetY = (canvasHeight - totalGridHeight) / 2;

        const { drawX, drawY } = this.animationManager.getRenderPosition(
            unit.id,
            unit.gridX,
            unit.gridY,
            effectiveTileSize,
            gridOffsetX,
            gridOffsetY
        );

        const weaponSize = effectiveTileSize * 0.5;
        const startX = drawX + (effectiveTileSize - weaponSize) / 2;
        const startY = drawY - effectiveTileSize * 0.5;

        this.activeWeaponDrops.set(data.unitId, {
            sprite: weaponImage,
            startX: startX,
            startY: startY,
            endY: drawY + effectiveTileSize * 0.8,
            currentY: startY,
            opacity: 1,
            startTime: performance.now(),
            popDuration: 300,
            fallDuration: 500,
            fadeDuration: 500,
            totalDuration: 1300
        });
        console.log(`[VFXManager] Weapon drop animation data added for unit ${data.unitId}.`);
    }

    /**
     * ✨ 활성 데미지 숫자의 상태를 업데이트합니다.
     * @param {number} deltaTime
     */
    update(deltaTime) {
        const currentTime = performance.now();
        this.activeDamageNumbers = this.activeDamageNumbers.filter(dmgNum => {
            return currentTime - dmgNum.startTime < dmgNum.duration;
        });

        // 무기 드롭 애니메이션 업데이트
        for (const [unitId, drop] of this.activeWeaponDrops.entries()) {
            const elapsed = currentTime - drop.startTime;

            if (elapsed < drop.popDuration) {
                const progress = elapsed / drop.popDuration;
                drop.currentY = drop.startY - drop.sprite.height * progress;
            } else if (elapsed < drop.popDuration + drop.fallDuration) {
                const fallElapsed = elapsed - drop.popDuration;
                const progress = fallElapsed / drop.fallDuration;
                drop.currentY = drop.startY + (drop.endY - drop.startY) * progress;
            } else if (elapsed < drop.totalDuration) {
                const fadeElapsed = elapsed - (drop.popDuration + drop.fallDuration);
                const progress = fadeElapsed / drop.fadeDuration;
                drop.opacity = Math.max(0, 1 - progress);
            } else {
                this.activeWeaponDrops.delete(unitId);
                console.log(`[VFXManager] Weapon drop animation for unit ${unitId} completed.`);
            }
        }
    }

    /**
     * 특정 유닛의 HP 바를 그립니다.
     * 실제 그리기 위치는 AnimationManager로 계산된 값을 사용합니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트
     * @param {object} unit - HP 바를 그릴 유닛 객체
     * @param {number} effectiveTileSize - 유닛이 그려지는 타일의 유효 크기
     * @param {number} actualDrawX - 애니메이션이 적용된 x 좌표
     * @param {number} actualDrawY - 애니메이션이 적용된 y 좌표
     */
    drawHpBar(ctx, unit, effectiveTileSize, actualDrawX, actualDrawY) {
        if (!unit || !unit.baseStats) {
            console.warn("[VFXManager] Cannot draw HP bar: unit data is missing.", unit);
            return;
        }

        const maxHp = unit.baseStats.hp;
        const currentHp = unit.currentHp !== undefined ? unit.currentHp : maxHp;
        const hpRatio = currentHp / maxHp;

        const barWidth = effectiveTileSize * 0.8;
        const barHeight = effectiveTileSize * 0.1;
        const barOffsetY = -barHeight - 5; // 유닛 이미지 위에 위치

        const hpBarDrawX = actualDrawX + (effectiveTileSize - barWidth) / 2;
        const hpBarDrawY = actualDrawY + barOffsetY;

        ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
        ctx.fillRect(hpBarDrawX, hpBarDrawY, barWidth, barHeight);

        ctx.fillStyle = hpRatio > 0.5 ? 'lightgreen' : hpRatio > 0.2 ? 'yellow' : 'red';
        ctx.fillRect(hpBarDrawX, hpBarDrawY, barWidth * hpRatio, barHeight);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1;
        ctx.strokeRect(hpBarDrawX, hpBarDrawY, barWidth, barHeight);
    }

    /**
     * ✨ 특정 유닛의 배리어 바를 그립니다 (HP 바 아래에 노란색 게이지).
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트
     * @param {object} unit - 배리어 바를 그릴 유닛 객체
     * @param {number} effectiveTileSize - 유닛이 그려지는 타일의 유효 크기
     * @param {number} actualDrawX - 유닛의 실제 렌더링 x 좌표 (애니메이션이 적용된)
     * @param {number} actualDrawY - 유닛의 실제 렌더링 y 좌표 (애니메이션이 적용된)
     */
    drawBarrierBar(ctx, unit, effectiveTileSize, actualDrawX, actualDrawY) {
        if (!unit || unit.currentBarrier === undefined || unit.maxBarrier === undefined) {
            return;
        }

        const currentBarrier = unit.currentBarrier;
        const maxBarrier = unit.maxBarrier;
        const barrierRatio = maxBarrier > 0 ? currentBarrier / maxBarrier : 0;

        const barWidth = effectiveTileSize * 0.8;
        const barHeight = effectiveTileSize * 0.05;
        const barOffsetY = effectiveTileSize * 0.1 + 8;

        const barrierBarDrawX = actualDrawX + (effectiveTileSize - barWidth) / 2;
        const barrierBarDrawY = actualDrawY + barOffsetY;

        ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
        ctx.fillRect(barrierBarDrawX, barrierBarDrawY, barWidth, barHeight);

        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(barrierBarDrawX, barrierBarDrawY, barWidth * barrierRatio, barHeight);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1;
        ctx.strokeRect(barrierBarDrawX, barrierBarDrawY, barWidth, barHeight);
    }

    /**
     * 모든 활성 시각 효과를 그립니다. 이 메서드는 LayerEngine에 의해 호출됩니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트
     */
    draw(ctx) {
        const sceneContentDimensions = this.battleSimulationManager.logicManager.getCurrentSceneContentDimensions(); // 이제 순수 그리드 크기를 반환
        const canvasWidth = this.measureManager.get('gameResolution.width'); // 캔버스 실제 CSS 너비
        const canvasHeight = this.measureManager.get('gameResolution.height'); // 캔버스 실제 CSS 높이

        const stagePadding = this.measureManager.get('battleStage.padding');

        // LogicManager에서 계산된 순수 그리드 컨텐츠 크기 (패딩 제외)
        const gridContentWidth = sceneContentDimensions.width;
        const gridContentHeight = sceneContentDimensions.height;

        // 이 gridContentWidth/Height를 사용하여 effectiveTileSize를 역으로 계산
        const effectiveTileSize = gridContentWidth / this.battleSimulationManager.gridCols;

        // 전체 그리드 크기 (여기서는 gridContentWidth/Height와 동일)
        const totalGridWidth = gridContentWidth;
        const totalGridHeight = gridContentHeight;

        // ✨ 그리드를 캔버스 중앙에 배치하기 위한 오프셋 계산 (패딩 포함)
        // (캔버스 전체 크기 - 그리드 컨텐츠 크기) / 2 + 패딩
        const gridOffsetX = (canvasWidth - totalGridWidth) / 2;
        const gridOffsetY = (canvasHeight - totalGridHeight) / 2;

        for (const unit of this.battleSimulationManager.unitsOnGrid) {
            // ✨ AnimationManager를 통해 현재 애니메이션이 적용된 위치를 조회합니다.
            const { drawX, drawY } = this.animationManager.getRenderPosition(
                unit.id,
                unit.gridX,
                unit.gridY,
                effectiveTileSize,
                gridOffsetX,
                gridOffsetY
            );
            this.drawHpBar(ctx, unit, effectiveTileSize, drawX, drawY);
            this.drawBarrierBar(ctx, unit, effectiveTileSize, drawX, drawY); // ✨ 배리어 바 그리기 호출
        }

        // ✨ 데미지 숫자 그리기
        const currentTime = performance.now();
        for (const dmgNum of this.activeDamageNumbers) {
            const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === dmgNum.unitId);
            if (!unit) continue;

            const { drawX, drawY } = this.animationManager.getRenderPosition(
                unit.id,
                unit.gridX,
                unit.gridY,
                effectiveTileSize,
                gridOffsetX,
                gridOffsetY
            );

            const elapsed = currentTime - dmgNum.startTime;
            const progress = elapsed / dmgNum.duration;

            const currentYOffset = dmgNum.floatSpeed * elapsed;
            const alpha = Math.max(0, 1 - progress);

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = dmgNum.color || ((dmgNum.damage > 0) ? '#FF4500' : '#ADFF2F');
            ctx.font = `bold ${20 + (1 - progress) * 5}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(
                dmgNum.damage.toString(),
                drawX + effectiveTileSize / 2,
                drawY - currentYOffset - 5
            );
            ctx.restore();
        }

        // ✨ 무기 드롭 애니메이션 그리기
        for (const [unitId, drop] of this.activeWeaponDrops.entries()) {
            if (!drop.sprite) continue;

            const weaponSize = effectiveTileSize * 0.5; // 무기 이미지 크기

            ctx.save();
            ctx.globalAlpha = drop.opacity;
            ctx.drawImage(drop.sprite, drop.startX, drop.currentY, weaponSize, weaponSize);
            ctx.restore();
        }
    }
}
