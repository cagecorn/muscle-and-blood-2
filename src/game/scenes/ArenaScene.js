import { Scene } from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { DOMEngine } from '../utils/DOMEngine.js';
import { ArenaDOMEngine } from '../dom/ArenaDOMEngine.js';

export class ArenaScene extends Scene {
    constructor() {
        super('ArenaScene');
        this.arenaDomEngine = null;
    }

    create() {
        const territoryContainer = document.getElementById('territory-container');
        if (territoryContainer) {
            territoryContainer.style.display = 'none';
        }

        const domEngine = new DOMEngine(this);
        this.arenaDomEngine = new ArenaDOMEngine(this, domEngine);

        this.events.on('shutdown', () => {
            if (this.arenaDomEngine) {
                this.arenaDomEngine.destroy();
            }
        });
    }
}
