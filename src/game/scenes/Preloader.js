import { Scene } from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { imageSizeManager } from '../utils/ImageSizeManager.js';
import { statusEffects } from '../data/status-effects.js';

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

        // 유닛 기본 스프라이트 로드
        this.load.image('warrior', 'images/unit/warrior.png');
        this.load.image('gunner', 'images/unit/gunner.png');
        this.load.image('mechanic', 'images/unit/mechanic.png');
        this.load.image('medic', 'images/unit/medic.png');
        this.load.image('nanomancer', 'images/unit/nanomancer.png');
        this.load.image('flyingmen', 'images/unit/flyingmen.png');
        this.load.image('esper', 'images/unit/esper.png');
        this.load.image('commander', 'images/unit/commander.png');
        this.load.image('clown', 'images/unit/clown.png'); // 추가
        this.load.image('android', 'images/unit/android.png'); // 추가
        // ✨ [추가] 역병 의사 스프라이트 로드
        this.load.image('plague-doctor', 'images/unit/plague-doctor.png');
        // ✨ [추가] 센티넬 스프라이트 로드
        this.load.image('sentinel', 'images/unit/sentinel.png');
        // ✨ [추가] 팔라딘 스프라이트 로드
        this.load.image('paladin', 'images/unit/paladin.png');
        this.load.image('ghost', 'images/unit/ghost.png');
        this.load.image('hacker', 'images/unit/hacker.png');
        // --- ▼ [신규] 다크나이트 스프라이트 로드 ▼ ---
        this.load.image('dark-night', 'images/unit/dark-night.png');
        // --- ▲ [신규] 다크나이트 스프라이트 로드 ▲ ---

        // UI용 이미지 로드
        this.load.image('warrior-ui', 'images/territory/warrior-ui.png');
        this.load.image('gunner-ui', 'images/territory/gunner-ui.png');
        this.load.image('mechanic-ui', 'images/unit/mechanic-ui.png');
        this.load.image('medic-ui', 'images/territory/medic-ui.png');
        this.load.image('nanomancer-ui', 'images/unit/nanomancer-ui.png');
        this.load.image('flyingmen-ui', 'images/unit/flyingmen-ui.png');
        this.load.image('esper-ui', 'images/unit/esper-ui.png');
        this.load.image('commander-ui', 'images/unit/commander-ui.png');
        this.load.image('clown-ui', 'images/unit/clown-ui.png'); // 추가
        this.load.image('android-ui', 'images/unit/android-ui.png'); // 추가
        // ✨ [추가] 역병 의사 UI 이미지 로드
        this.load.image('plague-doctor-ui', 'images/unit/plague-doctor-ui.png');
        // ✨ [추가] 센티넬 UI 이미지 로드
        this.load.image('sentinel-ui', 'images/unit/sentinel-ui.png');
        // ✨ [추가] 팔라딘 UI 이미지 로드
        this.load.image('paladin-ui', 'images/unit/paladin-ui.png');
        this.load.image('ghost-ui', 'images/unit/ghost-ui.png');
        this.load.image('hacker-ui', 'images/unit/hacker-ui.png');
        // --- ▼ [신규] 다크나이트 UI 이미지 로드 ▼ ---
        this.load.image('dark-knight-ui', 'images/unit/dark-knight-ui.png');
        // --- ▲ [신규] 다크나이트 UI 이미지 로드 ▲ ---

        // 영지 씬에 사용할 배경 이미지를 로드합니다.
        this.load.image('city-1', 'images/territory/city-1.png');

        // 여관 아이콘 이미지를 로드합니다.
        this.load.image('tavern-icon', 'images/territory/tavern-icon.png');

        // --- 추가된 애셋들 ---
        this.load.image('tavern-scene', 'images/territory/tavern-scene.png');
        this.load.image('dungeon-icon', 'images/territory/dungeon-icon.png');
        this.load.image('dungeon-scene', 'images/territory/dungeon-scene.png');
        this.load.image('cursed-forest', 'images/territory/cursed-forest.png');
        this.load.image('formation-icon', 'images/territory/formation-icon.png');
        this.load.image('arena-icon', 'images/territory/arena-icon.png');
        // --- 스킬 관리 아이콘 및 씬 배경 로드 ---
        this.load.image('skills-icon', 'images/territory/skills-icon.png');
        this.load.image('skills-scene-background', 'images/territory/skills-scene.png');
        // --- ✨ [신규] 선조 소환 아이콘 및 씬 배경 로드 ---
        this.load.image('summon-icon', 'images/territory/summon-icon.png');
        this.load.image('summon-scene-background', 'images/territory/summon-scene.png');
        // --- ✨ [추가] 스킬 슬롯 이미지를 로드합니다. ---
        this.load.image('skill-slot', 'images/skills/skill-slot.png');
        // ✨ [신규] 나노맨서 패시브 아이콘 추가
        this.load.image('elemental-manifest', 'images/skills/elemental-manifest.png');
        // ✨ [신규] 메카닉 패시브 아이콘 추가
        this.load.image('mechanical-enhancement', 'images/skills/mechanical-enhancement.png');
        this.load.image('clown-s-joke', 'images/skills/clown-s-joke.png'); // ✨ 광대 패시브 아이콘 추가
        // --- ▼ [신규] 역병 의사 패시브 아이콘 추가 ▼ ---
        this.load.image('antidote', 'images/skills/antidote.png');
        // --- ▲ [신규] 역병 의사 패시브 아이콘 추가 ▲ ---
        // --- ▼ [신규] 메딕 패시브 아이콘 추가 ▼ ---
        this.load.image('first-aid', 'images/skills/first-aid.png');
        // --- ▲ [신규] 메딕 패시브 아이콘 추가 ▲ ---
        // --- ▼ [신규] 전사 패시브 아이콘 추가 ▼ ---
        this.load.image('bravery', 'images/skills/bravery.png');
        // --- ▲ [신규] 전사 패시브 아이콘 추가 ▲ ---
        // --- ▼ [신규] 팔라딘 패시브 아이콘 추가 ▼ ---
        this.load.image('paladins-guide', 'images/skills/paladins-guide.png');
        // --- ▲ [신규] 팔라딘 패시브 아이콘 추가 ▲ ---
        // --- ✨ [추가] 센티넬 패시브 아이콘 로드 ---
        this.load.image('eye-of-guard', 'images/skills/eye-of-guard.png');
        this.load.image('ghosting', 'images/skills/ghosting.png');
        // --- ▼ [신규] 다크나이트 패시브 아이콘 추가 ▼ ---
        this.load.image('curse-of-darkness', 'images/skills/curse-of-darkness.png');
        // --- ▲ [신규] 다크나이트 패시브 아이콘 추가 ▲ ---
        // --- ▼ [신규] 플라잉맨 패시브 아이콘 추가 ▼ ---
        this.load.image('juggernaut', 'images/skills/flyingmen\'s-charge.png');
        // --- ▲ [신규] 플라잉맨 패시브 아이콘 추가 ▲ ---
        this.load.image('suppress-shot', 'images/skills/suppress-shot.png');
        this.load.image('stigma', 'images/skills/stigma.png');
        this.load.image('nanobeam', 'images/skills/nanobeam.png');
        this.load.image('axe-strike', 'images/skills/axe-strike.png');
        this.load.image('commanders-shout', 'images/skills/commanders-shout.png');
        this.load.image('hacker\'s-invade', 'images/skills/hacker\'s-invade.png');
        // 공통 패널 배경 이미지
        this.load.image('panel-background', 'images/ui-panel.png');
        this.load.image('battle-stage-arena', 'images/battle/battle-stage-arena.png');
        this.load.image('battle-stage-cursed-forest', 'images/battle/battle-stage-cursed-forest.png');

        // 몬스터 스프라이트 로드
        this.load.image('zombie', 'images/unit/zombie.png');
        // 소환수 스프라이트 로드
        this.load.image('ancestor-peor', 'images/summon/ancestor-peor.png');

        // --- 추가된 토큰 이미지 로드 ---
        this.load.image('token', 'images/battle/token.png');

        // 핏방울 이펙트를 위한 간단한 빨간색 파티클 텍스처 생성
        const redParticle = this.make.graphics({ x: 0, y: 0, add: false });
        redParticle.fillStyle(0xff0000, 1);
        redParticle.fillCircle(2, 2, 2);
        redParticle.generateTexture('red-particle', 4, 4);
        redParticle.destroy();

        // ▼▼▼ [추가] 마법 효과용 플레이스홀더 이미지 로드 ▼▼▼
        this.load.image('placeholder', 'images/placeholder.png');
        // ▲▲▲ [추가] 마법 효과용 플레이스홀더 이미지 로드 ▲▲▲

        // 상태 효과 아이콘 로드
        Object.values(statusEffects).forEach(e => {
            const path = e.iconPath.replace(/^assets\//, '');
            this.load.image(e.id, path);
        });
    }

    create ()
    {
        // 전투 씬에서 사용될 주요 이미지들의 텍스처 필터링 모드를 설정하여 품질을 향상시킵니다.
        const battleTextures = [
            'warrior', 'gunner', 'mechanic', 'medic', 'nanomancer', 'flyingmen', 'esper', 'commander', 'clown', 'android', 'plague-doctor', 'sentinel', 'ghost', 'hacker', 'dark-night', 'zombie', 'ancestor-peor',
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
