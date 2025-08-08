// src/game/GameSystem.js

// 중앙 허브 시스템: 다양한 엔진과 매니저를 한 곳에서 관리합니다.

export const gameSystem = {
    /** 현재 활성화된 씬 */
    scene: null,

    /**
     * 게임 실행 초기에 반드시 호출하여 씬을 등록합니다.
     * @param {Phaser.Scene} scene - 활성화할 씬 인스턴스
     */
    initialize(scene) {
        this.scene = scene;
        console.log('GameSystem이 초기화되었습니다.');
    },

    /**
     * 엔진이나 매니저 인스턴스를 수동으로 등록할 때 사용합니다.
     * @param {string} name - 등록할 키
     * @param {*} instance - 엔진/매니저 인스턴스
     */
    register(name, instance) {
        this[name] = instance;
    }
};

// utils 폴더의 모든 모듈을 한 번에 불러옵니다.
// Vite 환경에서는 import.meta.glob을 사용하고, 그렇지 않으면 자동 등록을 건너뜁니다.
let utilModules = {};

if (typeof import.meta.glob === 'function') {
    // Vite와 같은 번들러에서 정적으로 해석됩니다.
    utilModules = import.meta.glob('./utils/*.js', { eager: true });
} else {
    console.warn('import.meta.glob is not available; util modules will not be auto-registered.');
}

// --- 자동 등록 단계 ---
// utils 폴더에서 가져온 모듈들 중 이름이 Engine/Manager로 끝나고
// 소문자로 시작하는 export를 GameSystem에 자동으로 할당합니다.
for (const mod of Object.values(utilModules)) {
    for (const [key, value] of Object.entries(mod)) {
        if (/(Engine|Manager)$/.test(key) && key[0] === key[0].toLowerCase()) {
            gameSystem[key] = value;
        }
    }
}

