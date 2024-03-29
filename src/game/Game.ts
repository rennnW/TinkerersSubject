import { registerTabs, querySelector, isLocalHost } from "@utils/helpers";
import Player from './Player';
import Enemy from './Enemy';
import Loop from "@utils/Loop";
import Statistics from "./Statistics";
import EventEmitter from "@src/utils/EventEmitter";
import gameHtml from '@html/game.html';
import saveManager from "@src/utils/saveManager";
import type Home from "@src/Home";

import { VisibilityObserver } from "@src/utils/Observers";
import type Component from "./components/Component";
import { componentConfigs, loadComponent } from "./components/loader";
import type GameConfig from "@src/types/gconfig/gameConfig";
import type { ComponentName } from "@src/types/gconfig/components";
import customAlert from "@src/utils/alert";
import type GameSave from "@src/types/save/save";

export default class Game {
    readonly page: HTMLElement;
    readonly gameLoop = new Loop();
    readonly enemy: Enemy;
    readonly player: Player;
    readonly statistics: Statistics;
    readonly visiblityObserver: VisibilityObserver;
    readonly componentsList: Component[] = [];
    readonly onSave = new EventEmitter<GameSave>();
    private _config: GameConfig | undefined;
    private _saveObj?: DeepPartial<GameSave>;
    constructor(readonly home: Home) {
        this.page = querySelector('.p-game', new DOMParser().parseFromString(gameHtml, 'text/html').body);
        querySelector('.p-home').after(this.page);
        this.visiblityObserver = new VisibilityObserver(this.gameLoop);
        this.page = querySelector('.p-game');
        this.enemy = new Enemy(this);
        this.player = new Player(this);

        this.statistics = new Statistics(this);

        if (isLocalHost()) {
            this.setupDevHelpers();
        }

        querySelector('[data-target="home"]', this.page).addEventListener('click', () => {
            this.page.classList.add('hidden');
            querySelector('.p-home').classList.remove('hidden');
        });
        registerTabs(querySelector('[data-main-menu]', this.page), querySelector('[data-main-view]', this.page));
    }
    get config() {
        return this._config;
    }
    get saveObj() {
        return this._saveObj;
    }

    async init(config: GameConfig, saveObj?: GameSave) {
        this._config = config;
        this._saveObj = saveObj;


        querySelector('[data-config-name]', this.page).textContent = this._config.meta.name;

        //Reset
        this.reset();

        //Initialize
        try {
            this.enemy.init();
            this.player.init();
            this.statistics.init();
            this.initComponents();
        } catch (e) {
            this.reset();
            throw new Error('Failed to initialize the game');
        }


        //Setup
        this.setup();

        await this.save();

        this.gameLoop.subscribe(() => {
            this.statistics.statistics["Time Played"].add(1);
        }, { intervalMilliseconds: 1000 });

        this.gameLoop.subscribe(() => {
            this.save();
        }, { intervalMilliseconds: 1000 * 60 });

        {
            const endPrompt = config.options?.endPrompt;
            if (endPrompt) {
                this.statistics.statistics.Level.addListener('change', level => {
                    if (level >= this.enemy.maxIndex + 1) {
                        customAlert({
                            title: endPrompt.title,
                            body: endPrompt.body,
                            footerText: endPrompt.footer,
                            buttons: [{ label: 'Continue', type: 'confirm' }]
                        });
                    }
                });
            }
        }
    }

    private reset() {
        this.onSave.removeAllListeners();
        this.disposeComponents();
        this.visiblityObserver.disconnectAll();

        this.gameLoop.reset();
        this.player.reset();
        this.enemy.reset();
        this.statistics.reset();
    }

    private setup() {
        this.statistics.setup();
        this.enemy.setup();
        this.player.setup();

        if (!isLocalHost()) {
            this.gameLoop.start();
        }
        querySelector('[data-tab-target="combat"]', this.page).click();
        document.querySelectorAll('[data-highlight-notification]').forEach(x => x.removeAttribute('data-highlight-notification'));
    }

    private initComponents() {
        const menuContainer = querySelector('[data-main-menu] .s-components', this.page);
        menuContainer.replaceChildren();
        if (!this.config?.components) {
            return;
        }
        for (const key of Object.keys(componentConfigs)) {
            const data = this.config.components[key as ComponentName];
            if (!data) {
                continue;
            }
            this.statistics.statistics.Level.registerCallback('levelReq' in data ? data.levelReq : 1, () => {
                const component = loadComponent(this, key as ComponentName);
                this.componentsList.push(component);
            });
        }

    }

    private disposeComponents() {
        Object.keys(componentConfigs).forEach(x => {
            this.page.querySelector(`[data-main-menu] [data-tab-target="${x}"]`)?.remove();
            this.page.querySelector(`[data-main-view] [data-tab-content="${x}"]`)?.remove();
        });
        this.componentsList.splice(0);
    }

    private setupDevHelpers() {
        console.log('Press Space to toggle GameLoop');
        document.body.addEventListener('keydown', x => {
            if (x.code === 'Space') {
                if (this.gameLoop.running) {
                    document.title = `Tinkerers Subject (Stopped)`;
                    this.gameLoop.stop();
                } else {
                    this.gameLoop.start();
                    document.title = 'Tinkerers Subject (Running)';
                }
            }
        });
    }

    async save() {
        if (!this.config) {
            throw Error('missing configuration');
        }
        const map = await saveManager.load('Game') || new Map<string, GameSave>();
        const saveObj = map.get(this.config.meta.id) as GameSave || { meta: { ...this.config.meta } };
        saveObj.meta.lastSavedAt = Date.now();
        this.player.save(saveObj);
        this.enemy.save(saveObj);
        this.statistics.save(saveObj);

        for (const componentData of this.componentsList) {
            componentData.save(saveObj);
        }

        map.set(this.config.meta.id, saveObj);
        await saveManager.save('Game', Object.fromEntries(map));
    }

    async load(config: GameConfig) {
        const map = await saveManager.load('Game');
        if (!map) {
            return false;
        }
        const saveObj = map.get(config.meta.id);
        if (!saveObj) {
            console.log('could not load', config.meta.id);
            return false;
        }

        try {
            await this.init(config, saveObj);
        } catch (e) {
            console.error(e);
        }
    }

    async getMostRecentSave() {
        try {
            const map = await saveManager.load('Game');
            if (!map) {
                return;
            }
            return [...map].map(x => x[1]).sort((a, b) => b.meta.lastSavedAt - a.meta.lastSavedAt)[0];
        } catch (e) {
            console.error(e);
        }
    }

    async deleteSave(id: string) {
        const map = await saveManager.load('Game');
        if (!map) {
            return;
        }
        if (map?.delete(id)) {
            return await saveManager.save('Game', Object.fromEntries(map));
        }
    }

    async hasSave(id: GameSave['meta']['id']) {
        const map = await saveManager.load('Game');
        if (!map) {
            return false;
        }
        return map.has(id);
    }
}