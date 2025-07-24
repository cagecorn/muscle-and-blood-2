import { Scene } from "https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js";
import { cameraEngine } from '../utils/CameraEngine.js';
import { debugCameraLogManager } from '../debug/DebugCameraLogManager.js';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x0a440a);
        this.add.image(512, 384, 'background').setAlpha(0.5);

        // --- 1. 카메라 엔진에 현재 씬 등록 ---
        // 이 과정이 있어야 엔진이 어떤 카메라를 제어할지 알 수 있습니다.
        cameraEngine.registerScene(this);
        
        // 게임 시작 시, 카메라의 초기 상태를 로그로 남깁니다.
        debugCameraLogManager.logInitialState(this.cameras.main, this.sys.game.config);

        // 예시용 9-Slice UI 패널 생성
        const helpPanel = this.add.nineslice(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            400,
            300,
            'ui-panel',
            null,
            60,
            60
        );

        this.add.text(helpPanel.x, helpPanel.y, 'Hello 9-Slice!', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }
}
