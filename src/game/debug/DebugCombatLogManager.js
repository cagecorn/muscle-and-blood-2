import { debugLogEngine } from '../utils/DebugLogEngine.js';

class DebugCombatLogManager {
    constructor() {
        // 이 매니저의 이름을 'DebugCombat'으로 정합니다.
        this.name = 'DebugCombat';
        debugLogEngine.register(this);
    }

    /**
     * 공격의 상세 계산식을 콘솔에 그룹화하여 출력합니다.
     * @param {object} attacker - 공격자 정보
     * @param {object} defender - 방어자 정보
     * @param {number} baseDamage - 기본 데미지
     * @param {number} finalDamage - 최종 데미지
     */
    logAttackCalculation(attacker, defender, baseDamage, finalDamage) {
        const atkName = attacker.instanceName || attacker.name || 'unknown';
        const defName = defender.instanceName || defender.name || 'unknown';
        const atkValue = attacker.finalStats?.physicalAttack ?? attacker.atk;
        const defValue = defender.finalStats?.physicalDefense ?? defender.def;

        console.groupCollapsed(
            `%c[${this.name}]`,
            `color: #d946ef; font-weight: bold;`,
            `${atkName}이(가) ${defName}을(를) 공격!`
        );

        debugLogEngine.log(this.name, '--- 공격 상세 계산 ---');
        debugLogEngine.log(this.name, `공격자: ${atkName} (공격력: ${atkValue})`);
        debugLogEngine.log(this.name, `방어자: ${defName} (방어력: ${defValue})`);
        debugLogEngine.log(this.name, `기본 데미지: ${baseDamage}`);
        debugLogEngine.log(this.name, `데미지 공식: 기본 데미지 - 방어자 방어력`);
        debugLogEngine.log(this.name, `계산: ${baseDamage} - ${defValue} = ${finalDamage}`);
        debugLogEngine.log(this.name, `최종 적용 데미지: ${finalDamage}`);
        
        console.groupEnd();
    }
}

// 내보내는 인스턴스 이름도 변경합니다.
export const debugCombatLogManager = new DebugCombatLogManager();
