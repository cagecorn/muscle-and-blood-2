import StartGame from './game/main.js';
import { archetypeMemoryEngine } from './game/utils/ArchetypeMemoryEngine.js';

// [1차 강화학습 데이터] - 2025-08-05 로그 기반
const learnedData_v1 = {
    // ESTJ는 '메딕'과 '거너'를 상대로 근접 공격 선호도를 대폭 상향
    'ESTJ': {
        'target_medic': { 'melee_weight': 1.4 }, // 메딕 대상 근접 공격 가중치 +40%
        'target_gunner': { 'melee_weight': 1.3 }, // 거너 대상 근접 공격 가중치 +30%
    },
    // ESFJ는 '전사'와 '센티넬'을 상대로 근접 공격을 약간 기피하고, 버프/힐을 선호하게 유도
    'ESFJ': {
        'target_warrior': { 'melee_weight': 0.85 }, // 전사 대상 근접 공격 가중치 -15%
        'target_sentinel': { 'melee_weight': 0.8 }, // 센티넬 대상 근접 공격 가중치 -20%
    },
    // INFP는 위협적인 '전사'를 상대로 디버프(마법) 사용 선호도 상향
    'INFP': {
        'target_warrior': { 'magic_weight': 1.25 }, // 전사 대상 마법(디버프) 가중치 +25%
    }
};

// 학습 데이터 적용
async function applyLearnedData() {
    console.log('AI 강화학습 v1 데이터를 적용합니다...');
    for (const [mbti, memory] of Object.entries(learnedData_v1)) {
        await archetypeMemoryEngine.updateMemory(mbti, memory);
    }
    console.log('모든 아키타입의 집단 기억이 성공적으로 업데이트되었습니다!');
}

document.addEventListener('DOMContentLoaded', async () => {
    await applyLearnedData();
    StartGame('game-container');
});