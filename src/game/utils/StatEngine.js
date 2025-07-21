/**
 * \uC6A9\uB9BD(Valor) \uC2DC\uC2A4\uD15C\uC758 \uACC4\uC0B0\uC744 \uC804\uB2E8\uD558\uB294 \uC5D4\uC9C4\uC785\uB2C8\uB2E4.
 * \uBC29\uC5B4\uB9C9 \uC0DD\uC131, \uD53C\uD574 \uC99D\uD3ED \uB4F1 '\uC6A9\uB9BD' \uC2A4\uD0EF\uACFC \uAD00\uB828\uB41C \uBAA8\uB4E0 \uB85C\uC9C1\uC744 \uB2F4\uB2F9\uD569\uB2C8\uB2E4.
 */
class ValorEngine {
    constructor() {
        // \uB098\uC911\uC5D0 \uC6A9\uB9BD \uAD00\uB828 \uC124\uC815\uAC12\uB4E4\uC744 \uC5B4\uB514\uC5D0 \uCD94\uAC00\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. (\uC608: this.barrierMultiplier = 10;)
    }

    /**
     * \uC6A9\uB9BD \uC2A4\uD0EF\uC744 \uAE30\uBCF8\uC73C\uB85C \uC804\uD22C \uC2DC\uC791 \uC2DC\uC758 \uCD08\uAE30 \uBC29\uC5B4\uB9C9(Barrier) \uC591\uC744 \uACC4\uC0B0\uD569\uB2C8\uB2E4.
     * @param {number} valor - \uC720\uB2DB\uC758 \uC21C\uC218 \uC6A9\uB9BD \uC2A4\uD0EF
     * @returns {number} - \uACC4\uC0B0\uB41C \uCD08\uAE30 \uBC29\uC5B4\uB9C9 \uC218\uCE58
     */
    calculateInitialBarrier(valor = 0) {
        // \uAC1C\uB150: \uC6A9\uB9BD 1\uD3EC\uC778\uD2B8\uB2F9 \uBC29\uC5B4\uB9C9 10\uC744 \uBD80\uC5EC\uD569\uB2C8\uB2E4.
        return valor * 10;
    }

    /**
     * \uD604\uC7AC \uBC29\uC5B4\uB9C9 \uC0C1\uD0DC\uC5D0 \uB530\uB974\uC5B4 \uD53C\uD574 \uC99D\uD3ED\uB960\uC744 \uACC4\uC0B0\uD569\uB2C8\uB2E4.
     * @param {number} currentBarrier - \uD604\uC7AC \uB0A8\uC740 \uBC29\uC5B4\uB9C9 \uC218\uCE58
     * @param {number} maxBarrier - \uCD5C\uB300 \uBC29\uC5B4\uB9C9 \uC218\uCE58
     * @returns {number} - \uD53C\uD574\uB7C9\uC5D0 \uACE0\uD314\uC62C \uC99D\uD3ED\uB960 (\uC608: 1.0\uC740 100%, 1.2\uB294 120%)
     */
    calculateDamageAmplification(currentBarrier = 0, maxBarrier = 1) {
        // \uAC1C\uB150: \uBC29\uC5B4\uB9C9\uC774 \uAC00\uB454 \uC218\uB9CE\uC744\uC218\uB85D(1\uC5D0 \uAC00\uAE4C\uC774) \uCD94\uAC00 \uD53C\uD574\uB97C \uC8FC\uACE0,
        // \uBC29\uC5B4\uB9C9\uC774 \uC5C6\uC744\uC218\uB85D(0\uC5D0 \uAC00\uAE4C\uC774) \uCD94\uAC00 \uD53C\uD574\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.
        // \uD604\uC7AC\uB294 \uCD5C\uB300 20%\uC758 \uCD94\uAC00 \uD53C\uD574\uB97C \uC8FC\uB294 \uAC83\uC73C\uB85C \uC124\uC815\uD569\uB2C8\uB2E4.
        const amplification = (currentBarrier / maxBarrier) * 0.2;
        return 1.0 + amplification;
    }
}

/**
 * \uBB34\uAC8C(Weight) \uC2DC\uC2A4\uD15C\uC758 \uACC4\uC0B0\uC744 \uC804\uB2E8\uD558\uB294 \uC5D4\uC9C4\uC785\uB2C8\uB2E4.
 * \uC7A5\uBE44 \uBB34\uAC8C \uD569\uC0B0, \uD130\uB4F1 \uC21C\uC11C \uACB0\uC815 \uB4F1 '\uBB34\uAC8C'\uC640 \uAD00\uB828\uB41C \uBAA8\uB4E0 \uB85C\uC9C1\uC744 \uB2F4\uB2F9\uD569\uB2C8\uB2E4.
 */
class WeightEngine {
    constructor() {
        // \uB098\uC911\uC5D0 \uBB34\uAC8C \uAD00\uB828 \uC124\uC815\uAC12\uB4E4\uC744 \uC5B4\uB514\uC5D0 \uCD94\uAC00\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.
    }

    /**
     * \uC720\uB2DB\uACFC \uC7A5\uCC29\uD55C \uC544\uC774\uD15C\uB4E4\uC758 \uCD1D \uBB34\uAC8C\uB97C \uACC4\uC0B0\uD569\uB2C8\uB2E4.
     * @param {object} unitData - \uC720\uB2DB\uC758 \uAE30\uBCF8 \uC815\uBCF4 (\uAE30\uBCF8 \uBB34\uAC8C \uB4F1)
     * @param {Array<object>} equippedItems - \uC7A5\uCC29\uD55C \uBAA8\uB4E0 \uC544\uC774\uD15C \uBAA9\uB85D
     * @returns {number} - \uD569\uC0B0\uB41C \uCD1D \uBB34\uAC8C
     */
    calculateTotalWeight(unitData = {}, equippedItems = []) {
        let totalWeight = unitData.baseWeight || 0;
        for (const item of equippedItems) {
            totalWeight += item.weight || 0;
        }
        return totalWeight;
    }

    /**
     * \uCD1D \uBB34\uAC8C\uB97C \uAE30\uBCF8\uC73C\uB85C \uD589\uB3D9 \uC21C\uC11C\uB97C \uACB0\uC815\uD558\uB294 \uB370 \uC0AC\uC6A9\uB420 \uCD5C\uC885 \uC218\uCE58\uB97C \uACC4\uC0B0\uD569\uB2C8\uB2E4.
     * @param {number} totalWeight - \uC720\uB2DB\uC758 \uCD1D \uBB34\uAC8C
     * @returns {number} - \uD130\uB4F1 \uACC4\uC0B0\uC5D0 \uC0AC\uC6A9\uB420 \uCD5C\uC885 \uBB34\uAC8C \uAC12 (\uC218\uCE58\uAC00 \uB0AE\uC744\uC218\uB85D \uC120\uD130\uB144)
     */
    getTurnValue(totalWeight = 0) {
        // \uAC1C\uB150: \uC774 \uAC12\uC740 \uB2E8\uC21C\uD788 \uCD1D \uBB34\uAC8C\uAC00 \uB429\uB2C8\uB2E4.
        // \uB098\uC911\uC5D0 \uBB34\uAC8C\uC5D0 \uB9E4\uCE58\uC5B4 (agility) \uC2A4\uD0EF \uB4F1\uC73C\uB85C \uBCF4\uC815\uC744 \uBC1B\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.
        // \uC608: return totalWeight - (unit.agility * 0.5);
        return totalWeight;
    }
}

/**
 * \uAC8C\uC784 \uB0B4 \uBAA8\uB4E0 \uC720\uB2DB\uC758 \uC2A4\uD0EF\uC744 \uACC4\uC0B0\uD558\uACE0 \uAD00\uB9AC\uD558\uB294 \uD589\uC0AC \uC5D4\uC9C4.
 * \uAC01 \uC804\uBB38 \uC5D4\uC9C4(ValorEngine, WeightEngine)\uC744 \uD1B5\uD569\uD558\uC5EC \uCD5C\uC885 \uC2A4\uD0EF\uC744 \uC0DD\uCD9C\uD569\uB2C8\uB2E4.
 */
class StatEngine {
    constructor() {
        this.valorEngine = new ValorEngine();
        this.weightEngine = new WeightEngine();
    }

    /**
     * \uAE30\uBCF8 \uC2A4\uD0EF, \uC7A5\uBE44 \uC815\uBCF4 \uB4F1\uC744 \uBC30\uD0C0\uB85C \uCD5C\uC885 \uC801\uC6A9\uB420 \uC2A4\uD0EF \uAC1D\uCCB4\uB97C \uC0DD\uC131\uD569\uB2C8\uB2E4.
     * @param {object} unitData - \uC720\uB2DB\uC758 \uAE30\uBCF8 \uC815\uBCF4 (\uC608: { name: '\uC804\uC0AC', baseWeight: 10 })
     * @param {object} baseStats - \uC21C\uC218 \uC2A4\uD0EF \uD3EC\uC778\uD2B8 (\uC608: { hp: 100, strength: 10, valor: 5 })
     * @param {Array<object>} equippedItems - \uC7A5\uCC29\uD55C \uC544\uC774\uD15C \uBAA9\uB85D (\uC608: [{ name: '\uAC15\uCCA0\uAC80', weight: 15 }])
     * @returns {object} - \uBAA8\uB4E0 \uACC4\uC0B0\uC774 \uC644\uB8CC\uB41C \uCD5C\uC885 \uC2A4\uD0EF \uAC1D\uCCB4
     */
    calculateStats(unitData = {}, baseStats = {}, equippedItems = []) {
        const calculated = {};

        // 1. \uAE30\uBCF8 \uC2A4\uD0EF\uC744 \uBCF5\uC0AC\uD569\uB2C8\uB2E4.
        Object.assign(calculated, {
            hp: baseStats.hp || 0,
            valor: baseStats.valor || 0,
            strength: baseStats.strength || 0,
            endurance: baseStats.endurance || 0,
            agility: baseStats.agility || 0,
            intelligence: baseStats.intelligence || 0,
            wisdom: baseStats.wisdom || 0,
            luck: baseStats.luck || 0,
        });

        // 2. \uC804\uBB38 \uC5D4\uC9C4\uC744 \uD1B5\uD574 \uD30C\uC9C0 \uC2A4\uD0EF\uC744 \uACC4\uC0B0\uD569\uB2C8\uB2E4.
        calculated.barrier = this.valorEngine.calculateInitialBarrier(calculated.valor);
        calculated.damageAmplification = this.valorEngine.calculateDamageAmplification(calculated.barrier, calculated.barrier);
        calculated.totalWeight = this.weightEngine.calculateTotalWeight(unitData, equippedItems);
        calculated.turnValue = this.weightEngine.getTurnValue(calculated.totalWeight);

        // 3. \uC8FC\uC6A9 \uC804\uD22C \uB2A5\uB825\uCE58\uB97C \uACC4\uC0B0\uD569\uB2C8\uB2E4.
        calculated.physicalAttack = (calculated.strength || 0) * 1.5;
        calculated.physicalDefense = (calculated.endurance || 0) * 1.2;
        calculated.magicAttack = (calculated.intelligence || 0) * 1.5;
        calculated.magicDefense = (calculated.wisdom || 0) * 1.2;
        
        // 4. \uAE30\uD0C0 \uBCF4\uC870 \uB2A5\uB825\uCE58\uB97C \uACC4\uC0B0\uD569\uB2C8\uB2E4.
        calculated.physicalEvadeChance = (calculated.agility || 0) * 0.2;
        calculated.accuracy = (calculated.agility || 0) * 0.15;
        calculated.magicEvadeChance = (calculated.luck || 0) * 0.1;
        calculated.criticalChance = (calculated.luck || 0) * 0.05;
        calculated.criticalDamageMultiplier = 1.5;
        calculated.statusEffectResistance = (calculated.endurance || 0) * 0.1;
        calculated.statusEffectApplication = (calculated.intelligence || 0) * 0.1;

        return calculated;
    }
}

// \uB2E4\uB978 \uD30C\uC77C\uC5D0\uC11C StatEngine\uC758 \uC720\uC77C\uD55C \uC778\uC2A4\uD134\uC2A4\uB97C \uAC00\uC838\uB2F9 \uC4F0\uC77C \uC218 \uC788\uB3C4\uB85D export \uD569\uB2C8\uB2E4.
export const statEngine = new StatEngine();
