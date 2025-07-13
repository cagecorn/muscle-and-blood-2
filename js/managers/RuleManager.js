// js/managers/RuleManager.js

export class RuleManager {
    constructor() {
        console.log("\uD83D\uDCD6 RuleManager initialized. Enforcing game rules. \uD83D\uDCD6");
        this.rules = new Map();
        this._loadBasicRules();
    }

    _loadBasicRules() {
        // 기본 규칙을 정의합니다.
        this.addRule('unitActionPerTurn', '유닛은 한 턴 당 [이동 + 공격 or 스킬]을 할 수 있다.');
        // ✨ 용맹 시스템 규칙 추가
        this.addRule('valorBarrierCalculation', '유닛의 용맹 수치에 따라 전투 시작 시 초기 배리어 양이 결정됩니다.');
        this.addRule('valorDamageAmplification', '현재 배리어 양이 높을수록 적에게 주는 피해가 증가합니다. 배리어가 깎일수록 데미지가 감소합니다.');
        // ✨ 무게 시스템 규칙 추가
        this.addRule('weightTurnOrderImpact', '유닛의 총 무게(유닛 자체 무게 + 장착 아이템 무게)가 클수록 행동 순서가 느려집니다.');
        this.addRule('strengthWeightEffect', '힘 스탯이 높을수록 유닛의 무게 가중치가 증가합니다.');
        this.addRule('itemWeightInfluence', '아이템마다 고유 무게가 존재하며, 무게 총합이 턴 순서에 영향을 줍니다.');

        // ✨ 새로운 기본 스탯 규칙 추가
        this.addRule('stat_hp', '체력: 유닛의 생명력을 나타냅니다.');
        this.addRule('stat_valor', '용맹: 초반 배리어 및 배리어에 기반한 데미지 상승에 영향을 줍니다.');
        this.addRule('stat_strength', '힘: 물리 근접 공격력 및 무게 가중치에 영향을 줍니다.');
        this.addRule('stat_endurance', '인내: 물리 방어력 및 각종 상태이상 저항력에 영향을 줍니다.');
        this.addRule('stat_agility', '민첩: 물리 원거리 공격력, 물리 공격 회피율, 정확도에 영향을 줍니다.');
        this.addRule('stat_intelligence', '지능: 마법 공격력 및 각종 상태이상 적용률에 영향을 줍니다.');
        this.addRule('stat_wisdom', '지혜: 마법 방어력 및 각종 속성 저항력에 영향을 줍니다.');
        this.addRule('stat_luck', '운: 치명타율 및 마법 공격 회피율에 영향을 줍니다.');

        // ✨ 나중에 계산되는 반영 스탯 규칙 추가
        this.addRule('derived_barrier', '배리어: 용맹에 의해 결정되는 초기 보호막입니다.');
        this.addRule('derived_weightPenalty', '무게 가중치: 유닛의 총 무게에 따라 턴 순서에 주어지는 페널티입니다.');
        this.addRule('derived_physicalAttack', '물리 공격력: 힘 스탯에 의해 계산되는 근접 및 원거리 공격력입니다.');
        this.addRule('derived_physicalDefense', '물리 방어력: 인내 스탯에 의해 계산되는 방어력입니다.');
        this.addRule('derived_magicAttack', '마법 공격력: 지능 스탯에 의해 계산되는 공격력입니다.');
        this.addRule('derived_magicDefense', '마법 방어력: 지혜 스탯에 의해 계산되는 방어력입니다.');
        this.addRule('derived_accuracy', '정확도: 민첩 스탯에 의해 계산되는 공격 명중률입니다.');
        this.addRule('derived_physicalEvade', '물리 공격 회피율: 민첩 스탯에 의해 계산되는 물리 공격 회피 확률입니다.');
        this.addRule('derived_magicEvade', '마법 공격 회피율: 운 스탯에 의해 계산되는 마법 공격 회피 확률입니다.');
        this.addRule('derived_criticalChance', '치명타율: 운 스탯에 의해 계산되는 치명타 발생 확률입니다.');
        this.addRule('derived_criticalDamageMultiplier', '치명타 피해 배율: 치명타 발생 시 추가되는 피해 배율입니다.');
        this.addRule('derived_statusEffectApplication', '상태이상 적용률: 지능 스탯에 의해 계산되는 상태이상 적용 성공률입니다.');
        this.addRule('derived_statusEffectResistance', '상태이상 저항력: 인내 스탯에 의해 계산되는 상태이상 저항률입니다.');
        console.log("[RuleManager] Basic rules loaded.");
    }

    /**
     * 새로운 게임 규칙을 추가합니다.
     * @param {string} ruleId - 규칙의 고유 ID
     * @param {string} description - 규칙에 대한 설명
     */
    addRule(ruleId, description) {
        if (this.rules.has(ruleId)) {
            console.warn(`[RuleManager] Rule '${ruleId}' already exists. Overwriting.`);
        }
        this.rules.set(ruleId, description);
        console.log(`[RuleManager] Added rule: ${ruleId} - "${description}"`);
    }

    /**
     * 특정 규칙의 설명을 가져옵니다.
     * @param {string} ruleId - 가져올 규칙의 ID
     * @returns {string | undefined} 규칙 설명 또는 undefined
     */
    getRule(ruleId) {
        return this.rules.get(ruleId);
    }
}
