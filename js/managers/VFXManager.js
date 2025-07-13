// js/managers/VFXManager.js

export class VFXManager {
    // ✨ resolutionEngine을 매개변수로 추가
    constructor(renderer, measureManager, cameraEngine, battleSimulationManager, animationManager, eventManager, resolutionEngine) {
        console.log("✨ VFXManager initialized. Ready to render visual effects. ✨");
        this.renderer = renderer;
        this.measureManager = measureManager;
        this.cameraEngine = cameraEngine;
        this.battleSimulationManager = battleSimulationManager;
        this.animationManager = animationManager;
        this.eventManager = eventManager;
        this.resolutionEngine = resolutionEngine; // ✨ resolutionEngine 인스턴스 저장

        this.activeDamageNumbers = [];

        this.eventManager.subscribe('weaponDropped', this._onWeaponDropped.bind(this));
        this.activeWeaponDrops = new Map();
        console.log("[VFXManager] Subscribed to 'weaponDropped' event.");

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
            floatSpeed: 0.05, // 기준 속도 (픽셀/ms)
            color: color
        });
        console.log(`[VFXManager] Added damage number: ${damageAmount} (${color}) for ${unit.name}`);
    }

    /**
     * 'weaponDropped' 이벤트 발생 시 호출됩니다.
     * 무기 드롭 애니메이션의 시작 및 종료 위치를 기준 해상도 단위로 계산한 후, 스케일링된 값을 저장합니다.
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

        // BattleSimulationManager 및 LogicManager에서 기준 해상도 단위의 그리드 정보를 가져옵니다.
        const baseCanvasWidth = this.resolutionEngine.baseWidth;
        const baseCanvasHeight = this.resolutionEngine.baseHeight;
        const sceneContentDimensions = this.battleSimulationManager.logicManager.getCurrentSceneContentDimensions();
        const gridContentWidth_base = sceneContentDimensions.width;
        const gridContentHeight_base = sceneContentDimensions.height;
        const effectiveTileSize_base = gridContentWidth_base / this.battleSimulationManager.gridCols; // 기준 타일 크기

        // 그리드 오프셋도 기준 해상도 단위로 계산합니다.
        const gridOffsetX_base = (baseCanvasWidth - gridContentWidth_base) / 2;
        const gridOffsetY_base = (baseCanvasHeight - gridContentHeight_base) / 2;

        // 유닛의 기본 픽셀 위치 (애니메이션 없이, 기준 해상도 단위)
        const unitBasePixelX = gridOffsetX_base + unit.gridX * effectiveTileSize_base;
        const unitBasePixelY = gridOffsetY_base + unit.gridY * effectiveTileSize_base;

        const weaponSize_base = effectiveTileSize_base * 0.5; // 무기 이미지 크기 (기준 해상도 단위)
        
        // 애니메이션 시작/끝 위치도 기준 해상도 단위로 계산한 후, 최종적으로 스케일링합니다.
        const startX_base = unitBasePixelX + (effectiveTileSize_base - weaponSize_base) / 2;
        const startY_base = unitBasePixelY - effectiveTileSize_base * 0.5; // 유닛 위에서 시작

        this.activeWeaponDrops.set(data.unitId, {
            sprite: weaponImage,
            startX: this.resolutionEngine.getScaledCoordinate(startX_base), // 스케일링된 시작 X
            startY: this.resolutionEngine.getScaledCoordinate(startY_base), // 스케일링된 시작 Y
            endY: this.resolutionEngine.getScaledCoordinate(unitBasePixelY + effectiveTileSize_base * 0.8), // 스케일링된 최종 Y (타일 하단)
            currentY: this.resolutionEngine.getScaledCoordinate(startY_base), // 스케일링된 현재 Y
            scaledWeaponSize: this.resolutionEngine.getScaledCoordinate(weaponSize_base), // 스케일링된 무기 크기
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
     * 활성 시각 효과의 상태를 업데이트합니다.
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
                // currentY를 스케일링된 값으로 계산
                drop.currentY = drop.startY - this.resolutionEngine.getScaledCoordinate(drop.scaledWeaponSize * progress); // 팝업 애니메이션
            } else if (elapsed < drop.popDuration + drop.fallDuration) {
                const fallElapsed = elapsed - drop.popDuration;
                const progress = fallElapsed / drop.fallDuration;
                // currentY를 스케일링된 값으로 계산
                drop.currentY = drop.startY + (drop.endY - drop.startY) * progress; // 낙하 애니메이션
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
     * @param {number} effectiveTileSize_base - 유닛이 그려지는 타일의 유효 크기 (기준 해상도 단위)
     * @param {number} actualDrawX - 애니메이션이 적용된 x 좌표 (이미 스케일링됨)
     * @param {number} actualDrawY - 애니메이션이 적용된 y 좌표 (이미 스케일링됨)
     */
    drawHpBar(ctx, unit, effectiveTileSize_base, actualDrawX, actualDrawY) {
        if (!unit || !unit.baseStats) {
            console.warn("[VFXManager] Cannot draw HP bar: unit data is missing.", unit);
            return;
        }

        const maxHp = unit.baseStats.hp;
        const currentHp = unit.currentHp !== undefined ? unit.currentHp : maxHp;
        const hpRatio = currentHp / maxHp;

        // 모든 크기/오프셋을 기준 해상도 단위로 계산한 후, 그릴 때 스케일링합니다.
        const barWidth_base = effectiveTileSize_base * 0.8;
        const barHeight_base = effectiveTileSize_base * 0.1;
        const barOffsetY_base = -barHeight_base - 5; // 유닛 이미지 위에 위치

        // HP 바의 기준 픽셀 위치
        const hpBarDrawX_base_offset = (effectiveTileSize_base - barWidth_base) / 2;
        const hpBarDrawY_base_offset = barOffsetY_base;

        // 최종 그리기 위치는 actualDrawX/Y (스케일링됨)와 스케일링된 오프셋을 더하여 계산합니다.
        const hpBarDrawX_scaled = actualDrawX + this.resolutionEngine.getScaledCoordinate(hpBarDrawX_base_offset);
        const hpBarDrawY_scaled = actualDrawY + this.resolutionEngine.getScaledCoordinate(hpBarDrawY_base_offset);
        const barWidth_scaled = this.resolutionEngine.getScaledCoordinate(barWidth_base);
        const barHeight_scaled = this.resolutionEngine.getScaledCoordinate(barHeight_base);

        ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
        ctx.fillRect(hpBarDrawX_scaled, hpBarDrawY_scaled, barWidth_scaled, barHeight_scaled);

        ctx.fillStyle = hpRatio > 0.5 ? 'lightgreen' : hpRatio > 0.2 ? 'yellow' : 'red';
        ctx.fillRect(hpBarDrawX_scaled, hpBarDrawY_scaled, barWidth_scaled * hpRatio, barHeight_scaled);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = this.resolutionEngine.getScaledCoordinate(1); // 선 굵기도 스케일링
        ctx.strokeRect(hpBarDrawX_scaled, hpBarDrawY_scaled, barWidth_scaled, barHeight_scaled);
    }

    /**
     * 특정 유닛의 배리어 바를 그립니다 (HP 바 아래에 노란색 게이지).
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트
     * @param {object} unit - 배리어 바를 그릴 유닛 객체
     * @param {number} effectiveTileSize_base - 유닛이 그려지는 타일의 유효 크기 (기준 해상도 단위)
     * @param {number} actualDrawX - 유닛의 실제 렌더링 x 좌표 (애니메이션이 적용된)
     * @param {number} actualDrawY - 유닛의 실제 렌더링 y 좌표 (애니메이션이 적용된)
     */
    drawBarrierBar(ctx, unit, effectiveTileSize_base, actualDrawX, actualDrawY) {
        if (!unit || unit.currentBarrier === undefined || unit.maxBarrier === undefined) {
            return;
        }

        const currentBarrier = unit.currentBarrier;
        const maxBarrier = unit.maxBarrier;
        const barrierRatio = maxBarrier > 0 ? currentBarrier / maxBarrier : 0;

        // 모든 크기/오프셋을 기준 해상도 단위로 계산한 후, 그릴 때 스케일링합니다.
        const barWidth_base = effectiveTileSize_base * 0.8;
        const barHeight_base = effectiveTileSize_base * 0.05;
        const barOffsetY_base = effectiveTileSize_base * 0.1 + 8; // HP 바 아래에 위치

        // 배리어 바의 기준 픽셀 위치
        const barrierBarDrawX_base_offset = (effectiveTileSize_base - barWidth_base) / 2;
        const barrierBarDrawY_base_offset = barOffsetY_base;

        // 최종 그리기 위치는 actualDrawX/Y (스케일링됨)와 스케일링된 오프셋을 더하여 계산합니다.
        const barrierBarDrawX_scaled = actualDrawX + this.resolutionEngine.getScaledCoordinate(barrierBarDrawX_base_offset);
        const barrierBarDrawY_scaled = actualDrawY + this.resolutionEngine.getScaledCoordinate(barrierBarDrawY_base_offset);
        const barWidth_scaled = this.resolutionEngine.getScaledCoordinate(barWidth_base);
        const barHeight_scaled = this.resolutionEngine.getScaledCoordinate(barHeight_base);

        ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
        ctx.fillRect(barrierBarDrawX_scaled, barrierBarDrawY_scaled, barWidth_scaled, barHeight_scaled);

        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(barrierBarDrawX_scaled, barrierBarDrawY_scaled, barWidth_scaled * barrierRatio, barHeight_scaled);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = this.resolutionEngine.getScaledCoordinate(1); // 선 굵기도 스케일링
        ctx.strokeRect(barrierBarDrawX_scaled, barrierBarDrawY_scaled, barWidth_scaled, barHeight_scaled);
    }

    /**
     * 모든 활성 시각 효과를 그립니다. 이 메서드는 LayerEngine에 의해 호출됩니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트
     */
    draw(ctx) {
        // 모든 계산을 기준 해상도 단위로 수행한 후, drawHpBar/drawBarrierBar/데미지 숫자 그리기에서 스케일링합니다.
        const baseCanvasWidth = this.resolutionEngine.baseWidth;
        const baseCanvasHeight = this.resolutionEngine.baseHeight;
        const sceneContentDimensions = this.battleSimulationManager.logicManager.getCurrentSceneContentDimensions(); // 기준 그리드 크기
        const gridContentWidth_base = sceneContentDimensions.width;
        const gridContentHeight_base = sceneContentDimensions.height;
        const effectiveTileSize_base = gridContentWidth_base / this.battleSimulationManager.gridCols; // 기준 타일 크기

        const totalGridWidth_base = gridContentWidth_base;
        const totalGridHeight_base = gridContentHeight_base;

        const gridOffsetX_base = (baseCanvasWidth - totalGridWidth_base) / 2;
        const gridOffsetY_base = (baseCanvasHeight - totalGridHeight_base) / 2;

        for (const unit of this.battleSimulationManager.unitsOnGrid) {
            // AnimationManager.getRenderPosition은 이미 스케일링된 픽셀 위치를 반환합니다.
            const { drawX, drawY } = this.animationManager.getRenderPosition(
                unit.id,
                unit.gridX,
                unit.gridY,
                effectiveTileSize_base, // 이 값은 기준 단위입니다. getRenderPosition 내부에서 스케일링됩니다.
                gridOffsetX_base,       // 이 값은 기준 단위입니다. getRenderPosition 내부에서 스케일링됩니다.
                gridOffsetY_base        // 이 값은 기준 단위입니다. getRenderPosition 내부에서 스케일링됩니다.
            );
            this.drawHpBar(ctx, unit, effectiveTileSize_base, drawX, drawY);
            this.drawBarrierBar(ctx, unit, effectiveTileSize_base, drawX, drawY);
        }

        // 데미지 숫자 그리기
        const currentTime = performance.now();
        for (const dmgNum of this.activeDamageNumbers) {
            const unit = this.battleSimulationManager.unitsOnGrid.find(u => u.id === dmgNum.unitId);
            if (!unit) continue;

            const { drawX, drawY } = this.animationManager.getRenderPosition(
                unit.id,
                unit.gridX,
                unit.gridY,
                effectiveTileSize_base,
                gridOffsetX_base,
                gridOffsetY_base
            );

            const elapsed = currentTime - dmgNum.startTime;
            const progress = elapsed / dmgNum.duration;

            // floatSpeed는 기준 픽셀/ms라고 가정하고, 스케일링합니다.
            const currentYOffset = this.resolutionEngine.getScaledCoordinate(dmgNum.floatSpeed * elapsed);
            const alpha = Math.max(0, 1 - progress);

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = dmgNum.color || ((dmgNum.damage > 0) ? '#FF4500' : '#ADFF2F');
            // 폰트 크기도 스케일링
            ctx.font = `bold ${this.resolutionEngine.getScaledCoordinate(20 + (1 - progress) * 5)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(
                dmgNum.damage.toString(),
                // 텍스트 위치도 스케일링된 값으로 계산
                drawX + this.resolutionEngine.getScaledCoordinate(effectiveTileSize_base / 2),
                drawY - currentYOffset - this.resolutionEngine.getScaledCoordinate(5) // 기준 5px 위로
            );
            ctx.restore();
        }

        // 무기 드롭 애니메이션 그리기
        for (const [unitId, drop] of this.activeWeaponDrops.entries()) {
            if (!drop.sprite) continue;

            ctx.save();
            ctx.globalAlpha = drop.opacity;
            // drop.startX, drop.currentY, drop.scaledWeaponSize는 이미 스케일링된 값입니다.
            ctx.drawImage(drop.sprite, drop.startX, drop.currentY, drop.scaledWeaponSize, drop.scaledWeaponSize);
            ctx.restore();
        }
    }
}
