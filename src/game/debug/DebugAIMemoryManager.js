import { debugLogEngine } from '../utils/DebugLogEngine.js';

/**
 * AI의 기억(Memory) 및 학습 과정을 추적하고 로그로 남기는 디버그 매니저
 */
class DebugAIMemoryManager {
    constructor() {
        this.name = 'DebugAIMemory';
        debugLogEngine.register(this);
    }

    logMemoryUpdate(attackerId, targetId, attackType, oldValue, newValue) {
        const change = newValue - oldValue;
        const color = change > 0 ? '#22c55e' : '#ef4444';
        console.groupCollapsed(
            `%c[${this.name}]`, `color: #8b5cf6; font-weight: bold;`,
            `🧠 유닛 ${attackerId}의 기억 업데이트 (대상: ${targetId})`
        );
        debugLogEngine.log(this.name, `공격 타입: ${attackType}`);
        debugLogEngine.log(this.name, `가중치 변경: ${oldValue.toFixed(2)} -> %c${newValue.toFixed(2)} (${change > 0 ? '+' : ''}${change.toFixed(2)})`, `color: ${color}; font-weight: bold;`);
        console.groupEnd();
    }

    logMemoryRead(attackerId, memory) {
        if (!memory || Object.keys(memory).length === 0) return;
        console.groupCollapsed(
            `%c[${this.name}]`, `color: #8b5cf6; font-weight: bold;`,
            `🤔 유닛 ${attackerId}의 기억 조회`
        );
        console.table(memory);
        console.groupEnd();
    }
    
    logScoreModification(skillName, baseScore, weight, finalScore) {
        debugLogEngine.log(
            'SkillScoreEngine',
            `[기억 활용] 스킬 [${skillName}] 점수 보정: 기본(${baseScore.toFixed(2)}) * 가중치(${weight.toFixed(2)}) = 최종 ${finalScore.toFixed(2)}`
        );
    }
}

export const debugAIMemoryManager = new DebugAIMemoryManager();
