import Skills from "./skills/Skills";
import Items from "./items/Items";
import type Component from "./Component";
import Passives from "./Passives";
import Achievements from "./Achievements";
import Missions from "./Missions";

import skillsHtml from '@html/skills.html';
import passivesHtml from '@html/passives.html';
import itemsHtml from '@html/items.html';
import missionsHtml from '@html/missions.html';
import achievementsHtml from '@html/achievements.html';

import type Game from "../Game";
import { querySelector } from "@src/utils/helpers";
import type ComponentsConfig from "@src/types/gconfig/components";
import type { ComponentName } from "@src/types/gconfig/components";

export interface ComponentConfig {
    html: string;
    constr: new (game: Game, data: any) => Component;
    label: string;
}

export const componentConfigs: Record<keyof ComponentsConfig, ComponentConfig> = {
    skills: {
        constr: Skills,
        html: skillsHtml,
        label: 'Skills'
    },
    passives: {
        constr: Passives,
        html: passivesHtml,
        label: 'Passives'
    },
    items: {
        constr: Items,
        html: itemsHtml,
        label: 'Items'
    },
    missions: {
        constr: Missions,
        html: missionsHtml,
        label: 'Missions'
    },
    achievements: {
        constr: Achievements,
        html: achievementsHtml,
        label: 'Achievements'
    }
}



export function loadComponent(game: Game, key: ComponentName) {
    const gamePage = querySelector('.p-game');
    const menuContainer = querySelector('[data-main-menu] .s-components', gamePage);
    const mainView = querySelector('[data-main-view]', gamePage);

    const { constr, html, label } = componentConfigs[key];

    //page
    const page = new DOMParser().parseFromString(html, 'text/html').querySelector(`.p-${key}`);
    if (!page || !(page instanceof HTMLElement)) {
        throw Error(`invalid html of component: ${name}`);
    }
    mainView.appendChild(page);
    //menu item
    const menuItem = document.createElement('li');
    menuItem.textContent = label;
    menuItem.classList.add('g-list-item');
    menuItem.setAttribute('data-tab-target', key);
    menuContainer.appendChild(menuItem);
    {
        const keys = Object.keys(componentConfigs);
        const sort = (a: ComponentName, b: ComponentName) => keys.indexOf(a) - keys.indexOf(b);
        const sortedItems = [...menuContainer.children].sort((a, b) =>
            sort(a.getAttribute('data-tab-target') as ComponentName, b.getAttribute('data-tab-target') as ComponentName));
        menuContainer.replaceChildren(...sortedItems);
    }

    //instance
    const instance = new constr(game, game.config!.components![key]);


    return instance;
}
