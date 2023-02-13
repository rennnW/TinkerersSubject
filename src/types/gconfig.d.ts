
export default GConfig;
export interface GConfig {
    meta: Meta;
    options?: Options;
    player?: Player;
    enemies: Enemies;
    skills: Skills;
    passives?: Passives;
    items?: Items;
    missions?: Missions;
    achievements: Achievements;
    prestige?: Prestige;
}

export interface Meta {
    name: string;
    description?: string;
    rawUrl: string;
    id: string;
    createdAt: number;
    lastSavedAt?: number;
}

export interface Options {

}
export interface Player {
    modList: Mod[];
}
export interface Enemies {
    enemyList: number[];
}
export interface Skills {
    attackSkills: {
        skillList: {
            name: string;
            attackSpeed: number;
            manaCost: number;
            baseDamageMultiplier: number;
            levelReq: number;
            mods?: Mod[];
        }[]
    };
    buffSkills: {
        skillSlots: {
            levelReq: number;
        }[]
        skillList: {
            name: string;
            baseDuration: number;
            manaCost: number;
            levelReq: number;
            mods?: Mod[];
        }[]
    }
}
export interface Passives {
    passiveList: {
        levelReq: number;
        points: number;
        mod: Mod;
    }[];
}
export interface ItemMod {
    levelReq: number;
    weight: number;
    mod: Mod;
}
export interface Items {
    levelReq: number;
    itemList: {
        name: string;
        levelReq: number;
    }[];
    modTables: {
        general: ItemMod[][],
        special?: ItemMod[][]
    };
    craftList: {
        id: CraftId;
        levelReq: number;
        cost: number;
    }[];
}
export interface Missions {
    levelReq: number;
    slots: {
        levelReq: number;
        cost: number;
    }[];
    list: {
        description: string;
        levelReq: number;
        goldAmount: number;
    }[][];
}
export interface Achievements {
    list: {
        description: string;
        modList?: Mod[];
    }[]
}
export interface Prestige {
    goldMultiplier: number;
    maxGoldMultiplier: number;
}

export type Mod = string;

export type CraftId =
    'reforge' | 'reforgeIncludePhysical' | 'reforgeIncludeMana' | 'reforgeIncludeCritical' | 'reforgeHigherChanceSameMods' | 'reforgeLowerChanceSameMods' |
    'addRandom' | 'addPhysical' | 'addMana' | 'addCritical' |
    'removeRandom' | 'removeRandomAddRandom' | 'removeRandomAddPhysical' | 'removeRandomAddMana' | 'removeRandomAddCritical';

