import StartGame from './game/main.js';
import { archetypeMemoryEngine } from './game/utils/ArchetypeMemoryEngine.js';

// [3차 강화학습 데이터] - 2025-08-06 로그 기반
const learnedData_v3 = {
    // 기존 강화학습 데이터 유지
    'ESTJ': {
        'target_medic': { 'melee_weight': 1.4 },
        'target_gunner': { 'melee_weight': 1.3 },
        'target_warrior': { 'melee_weight': 1.1 },
        'target_darkKnight': { 'melee_weight': 1.1 }
    },
    'ESFJ': {
        'target_sentinel': { 'melee_weight': 0.7 },
        'target_warrior': { 'melee_weight': 0.75 },
        'target_medic': { 'melee_weight': 1.2 },
        'target_plagueDoctor': { 'melee_weight': 1.2 }
    },
    'INFP': {
        'target_warrior': { 'magic_weight': 1.25 },
        'target_medic': { 'magic_weight': 1.5 },
        'target_paladin': { 'magic_weight': 1.4 }
    },

    // 신규 아키타입 학습 데이터
    'INTP': {
        'target_warrior': { 'magic_weight': 0.85 },
        'target_zombie': { 'melee_weight': 1.15 }
    },
    'INFJ': {
        'target_gunner': { 'melee_weight': 1.3 },
        'target_nanomancer': { 'melee_weight': 1.3 },
        'target_sentinel': { 'melee_weight': 0.8 }
    }
};

// 학습 데이터 적용 함수 (기존과 동일)
async function applyLearnedData() {
    console.log('AI 강화학습 v3 데이터를 적용합니다...');
    for (const [mbti, memory] of Object.entries(learnedData_v3)) {
        await archetypeMemoryEngine.updateMemory(mbti, memory);
    }
    console.log('모든 아키타입의 집단 기억이 성공적으로 업데이트되었습니다!');
}

document.addEventListener('DOMContentLoaded', async () => {
    await applyLearnedData();
    StartGame('game-container');
});

