import type { ModDescription } from "@src/game/mods";
import type Statistics from "@src/game/Statistics";
import type { CraftId } from "./gconfig";
import type GConfig from "./gconfig";

export interface Save {
    meta: GConfig['meta'];
    player?: {
        level: number;
        gold: number;
        curMana: number;
    };
    enemy?: {
        index: number;
        health: number;
        dummyDamage: number;
    };
    skills?: {
        attackSkillName: string;
        buffSkills: {
            name: string;
            index: number;
            time: number;
        }[];
    };
    passives?: {
        list: { index: number; desc: string }[];
    };
    items?: {
        items: {
            name: string;
            modList: {
                values: number[];
                desc: ModDescription
            }[];
        }[];
        craftPresets: { name: string, ids: CraftId[] }[];
    };
    missions?: {
        missions: {
            index: number;
            desc: string;
            startValue: number;
        }[];
    };
    statistics?: { name: keyof Statistics['statistics'], value: number }[];
}
