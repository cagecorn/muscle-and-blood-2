import { Scene } from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { imageSizeManager } from '../utils/ImageSizeManager.js';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        // 로딩 화면의 배경 이미지를 표시합니다.
        // 이 이미지는 Boot.js에서 미리 로드되었습니다.
        this.add.image(512, 384, 'background');

        // 모든 리소스 로드 완료 후 로고를 중앙에 표시하고 스케일을 조정합니다.
        this.load.on('complete', () => {
            const logo = this.add.image(512, 300, 'logo');
            const logoTexture = this.textures.get('logo');
            if (logoTexture.key !== '__MISSING') {
                const scale = imageSizeManager.getScale('LOGO', logoTexture, 'width');
                logo.setScale(scale);
            }
        });

        // --- 로딩 진행률 표시줄 ---

        // 1. 진행률 막대의 배경 (테두리)
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        // 2. "로딩 중..." 텍스트
        this.add.text(512, 430, '로딩 중...', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5,
        }).setOrigin(0.5);

        // 3. 실제 채워지는 진행률 막대
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        // 로더의 'progress' 이벤트를 사용하여 진행률 막대의 너비를 업데이트합니다.
        this.load.on('progress', (progress) => {
            // progress 값(0에서 1 사이)에 따라 막대의 너비를 조절합니다.
            bar.width = 4 + (460 * progress);
        });
    }

    preload ()
    {
        // 게임에 필요한 모든 애셋을 여기서 로드합니다.
        this.load.setPath('assets');

        // 로고 이미지를 로드합니다.
        this.load.image('logo', 'logo.png');

        // 게임 씬에서 사용할 전사 이미지를 로드합니다.
        this.load.image('warrior', 'images/unit/warrior.png');
        this.load.image('gunner', 'images/unit/gunner.png');

        // 영지 씬에 사용할 배경 이미지를 로드합니다.
        this.load.image('city-1', 'images/territory/city-1.png');

        // 여관 아이콘 이미지를 로드합니다.
        this.load.image('tavern-icon', 'images/territory/tavern-icon.png');

        // --- 추가된 애셋들 ---
        this.load.image('tavern-scene', 'images/territory/tavern-scene.png');
        this.load.image('hire-icon', 'images/territory/hire-icon.png');
        this.load.image('warrior-hire', 'images/territory/warrior-hire.png');
        this.load.image('gunner-hire', 'images/territory/gunner-hire.png');
        this.load.image('warrior-ui', 'images/territory/warrior-ui.png');
        this.load.image('gunner-ui', 'images/territory/gunner-ui.png');
        this.load.image('dungeon-icon', 'images/territory/dungeon-icon.png');
        this.load.image('dungeon-scene', 'images/territory/dungeon-scene.png');
        this.load.image('cursed-forest', 'images/territory/cursed-forest.png');
        this.load.image('formation-icon', 'images/territory/formation-icon.png');
        this.load.image('battle-stage-arena', 'images/battle/battle-stage-arena.png');
        this.load.image('battle-stage-cursed-forest', 'images/battle/battle-stage-cursed-forest.png');

        // 몬스터 스프라이트 로드
        this.load.image('zombie', 'images/unit/zombie.png');
    }

    create ()
    {
        // 전투 씬에서 사용될 주요 이미지들의 텍스처 필터링 모드를 설정하여 품질을 향상시킵니다.
        const battleTextures = [
            'warrior', 'gunner', 'zombie',
            'battle-stage-cursed-forest', 'battle-stage-arena'
        ];

        battleTextures.forEach(key => {
            if (this.textures.exists(key)) {
                this.textures.get(key).setFilter(Phaser.Textures.FilterMode.TRILINEAR);
            }
        });

        // 모든 애셋이 로드되면 영지 씬으로 전환합니다.
        this.scene.start('TerritoryScene');
    }
}
