import { initTabs, isLocalHost } from "@utils/helpers";
import { init as initPlayer, setup as setupPlayer, playerStats } from './player';
import { init as initEnemy } from './enemy';
import { init as initSkills } from './skills';
import type GConfig from "@src/types/gconfig";
import Loop from "@utils/Loop";
import statistics, { createStatisticsElements } from "./statistics";
import loadComponents from './components/loader';
import { save, load } from './save';

initTabs(document.querySelector('.p-game > menu'), document.querySelector('.p-game'));

if (isLocalHost) {
    globalThis.dev = {
        game: {
            playerStats,
            save, load
        }
    }
    document.addEventListener('keydown', x => {
        if (x.code === 'Space') {
            if (gameLoop.running) {
                document.title = `Tinkerers Subject (Stopped)`;
                gameLoop.stop();
            } else {
                gameLoop.start();
                document.title = 'Tinkerers Subject (Running)';
            }
        }
    });
}


export const gameLoop: Loop = new Loop();


export async function init(module: GConfig) {

    gameLoop.reset();

    initEnemy(module.enemies);
    initPlayer(module.player);

    initSkills(module.skills);

    loadComponents({
        items: module.items,
        achievements: module.achievements,
    });

    gameLoop.subscribe(() => {
        statistics["Time Played"].add(1);
    }, { intervalMilliseconds: 1000 })

    await setupPlayer();

    createStatisticsElements();

    if (!isLocalHost) {
        gameLoop.start();

        gameLoop.subscribe(() => {
            save();
        }, { intervalMilliseconds: 6000 });

        await load();
    }
}
