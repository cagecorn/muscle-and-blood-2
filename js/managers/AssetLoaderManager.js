// js/managers/AssetLoaderManager.js

export class AssetLoaderManager {
    constructor() {
        console.log("\ud83d\udce6 AssetLoaderManager initialized. Ready to load game assets. \ud83d\udce6");
        this.assets = new Map();
    }

    /**
     * 이미지를 로드하고 관리합니다.
     * @param {string} assetId - 에셋의 고유 ID
     * @param {string} url - 이미지 파일의 경로
     * @returns {Promise<HTMLImageElement>}
     */
    loadImage(assetId, url) {
        if (this.assets.has(assetId)) {
            console.warn(`[AssetLoaderManager] Asset '${assetId}' is already loaded. Returning existing asset.`);
            return Promise.resolve(this.assets.get(assetId));
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.assets.set(assetId, img);
                console.log(`[AssetLoaderManager] Image '${assetId}' loaded from ${url}`);
                resolve(img);
            };
            img.onerror = (e) => {
                console.error(`[AssetLoaderManager] Failed to load image '${assetId}' from ${url}:`, e);
                reject(new Error(`Failed to load image: ${url}`));
            };
            img.src = url;
        });
    }

    /**
     * 로드된 이미지 에셋을 ID로 가져옵니다.
     * @param {string} assetId
     * @returns {HTMLImageElement | undefined}
     */
    getImage(assetId) {
        if (!this.assets.has(assetId)) {
            console.warn(`[AssetLoaderManager] Image asset '${assetId}' not found. Was it loaded?`);
        }
        return this.assets.get(assetId);
    }
}
