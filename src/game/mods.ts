import EventEmitter from "@utils/EventEmitter";

//#region Types
export type ModifierTag = 'Gold' | 'Damage' | 'Attack' | 'Physical' | 'Elemental' | 'Speed' | 'Mana' | 'Critical' | 'Ailment' | 'Bleed' | 'Burn' | 'Duration' | 'Skill';
export type StatModifierValueType = 'Base' | 'Inc' | 'More';
//#region Mod Description
export type ModDescription = typeof modTemplates[number]['desc'];
//#endregion Mod Description

//#region Stat Name
export type StatName =
    | 'GoldGeneration'
    | DamageStatName
    | 'AttackManaCost'
    | 'AttackSpeed'
    | 'HitChance'
    | 'CritChance'
    | 'CritMulti'
    | 'ManaRegen'
    | 'MaxMana'
    | 'Gold'
    | 'AilmentStack'
    | 'BleedChance'
    | 'BurnChance'
    | 'Duration';
//#endregion Stat Name

//#region Damage Stat Name
type DamageStatName =
    'BaseDamageMultiplier' |
    'Damage' |
    'MinDamage' |
    'MaxDamage' |
    'ElementalConvertedToPhysical' |
    'ChaosConvertedToPhysical' |
    'ChaosConvertedToElemental' |
    'ChaosConvertedToChaos' | ConversionStatName | GainAsStatName;

export type ConversionStatName = 'ElementalConvertedToPhysical' | 'ChaosConvertedToPhysical' | 'ChaosConvertedToElemental';
export type GainAsStatName = 'ElementalGainAsPhysical' | 'ChaosGainAsElemental' | 'ChaosGainAsPhysical';
//#endregion Damage Stat Name

//#endregion Types

interface ModTemplateStats {
    readonly name: StatName;
    readonly valueType: StatModifierValueType;
    readonly flags?: number;
};
interface ModTemplate {
    readonly desc: string;
    readonly tags: ReadonlyArray<ModifierTag>,
    readonly stats: ReadonlyArray<ModTemplateStats>;
}

interface StatModifierParams {
    name: StatName;
    valueType: StatModifierValueType;
    value: number;
    flags?: number;
    min?: number;
    max?: number;
    source?: string;
}

export enum StatModifierFlags {
    None = 0,
    Attack = 1 << 0,
    Physical = 1 << 1,
    Elemental = 1 << 2,
    Chaos = 1 << 3,
    Skill = 1 << 4,
    Bleed = 1 << 5,
    Burn = 1 << 6,
    Ailment = StatModifierFlags.Bleed | StatModifierFlags.Burn,
    Damage = 1 << 7
}

export const modTemplates: ReadonlyArray<ModTemplate> = [
    {
        desc: '#% Increased Physical Damage',
        tags: ['Damage', 'Physical'],
        stats: [{ name: 'Damage', valueType: 'Inc', flags: StatModifierFlags.Physical }]
    },
    {
        desc: '#% Increased Elemental Damage',
        tags: ['Damage', 'Elemental'],
        stats: [{ name: 'Damage', valueType: 'Inc', flags: StatModifierFlags.Elemental }]
    },
    {
        desc: '#% More Physical Damage',
        tags: ['Damage', 'Physical'],
        stats: [{ name: 'Damage', valueType: 'More', flags: StatModifierFlags.Physical }]
    },
    {
        desc: '#% More Elemental Damage',
        tags: ['Damage', 'Elemental'],
        stats: [{ name: 'Damage', valueType: 'More', flags: StatModifierFlags.Elemental }]
    },
    {
        desc: '#% More Bleed Damage',
        tags: ['Damage', 'Bleed', 'Physical', 'Ailment'],
        stats: [{ name: 'Damage', valueType: 'More', flags: StatModifierFlags.Physical | StatModifierFlags.Bleed }],
    },
    {
        desc: '#% More Burn Damage',
        tags: ['Damage', 'Burn', 'Elemental', 'Ailment'],
        stats: [{ name: 'Damage', valueType: 'More', flags: StatModifierFlags.Elemental | StatModifierFlags.Burn }],
    },
    {
        desc: '#% More Damage',
        tags: ['Damage'],
        stats: [{ name: 'Damage', valueType: 'More' }]
    },
    {
        desc: 'Adds # To # Physical Damage',
        tags: ['Damage', 'Physical'],
        stats: [{ name: 'MinDamage', valueType: 'Base', flags: StatModifierFlags.Physical },
        { name: 'MaxDamage', valueType: 'Base', flags: StatModifierFlags.Physical }]
    },
    {
        desc: 'Adds # To # Elemental Damage',
        tags: ['Damage', 'Elemental'],
        stats: [{ name: 'MinDamage', valueType: 'Base', flags: StatModifierFlags.Elemental },
        { name: 'MaxDamage', valueType: 'Base', flags: StatModifierFlags.Elemental }]
    },
    {
        desc: '#% Increased Bleed Damage',
        tags: ['Damage', 'Bleed', 'Physical', 'Ailment'],
        stats: [{ name: 'Damage', valueType: 'Inc', flags: StatModifierFlags.Physical | StatModifierFlags.Bleed }],
    },
    {
        desc: '#% Increased Burn Damage',
        tags: ['Damage', 'Burn', 'Elemental', 'Ailment'],
        stats: [{ name: 'Damage', valueType: 'Inc', flags: StatModifierFlags.Elemental | StatModifierFlags.Burn }],
    },
    {
        desc: '+#% Hit Chance',
        tags: ['Attack'],
        stats: [{ name: 'HitChance', valueType: 'Base' }]
    },
    {
        desc: '#% Increased Attack Speed',
        tags: ['Attack', 'Speed'],
        stats: [{ name: 'AttackSpeed', valueType: 'Inc' }]
    },
    {
        desc: '#% More Attack Speed',
        tags: ['Attack', 'Speed'],
        stats: [{ name: 'AttackSpeed', valueType: 'More' }]
    },
    {
        desc: '#% Increased Maximum Mana',
        tags: ['Mana'],
        stats: [{ name: 'MaxMana', valueType: 'Inc' }]
    },
    {
        desc: '+# Maximum Mana',
        tags: ['Mana'],
        stats: [{ name: 'MaxMana', valueType: 'Base' }]
    },
    {
        desc: '+# Mana Regeneration',
        tags: ['Mana'],
        stats: [{ name: 'ManaRegen', valueType: 'Base' }]
    },
    {
        desc: '+#% Critical Hit Chance',
        tags: ['Critical', 'Attack'],
        stats: [{ name: 'CritChance', valueType: 'Base' }]
    },
    {
        desc: '+#% Critical Hit Multiplier',
        tags: ['Critical', 'Attack'],
        stats: [{ name: 'CritMulti', valueType: 'Base' }]
    },
    {
        desc: '+# Gold Generation',
        tags: ['Gold'],
        stats: [{ name: 'GoldGeneration', valueType: 'Base' }],
    },
    {
        desc: '#% Increased Gold Generation',
        tags: ['Gold'],
        stats: [{ name: 'GoldGeneration', valueType: 'Inc' }],
    },
    {
        desc: '#% Increased Skill Duration',
        tags: ['Skill'],
        stats: [{ name: 'Duration', valueType: 'Inc', flags: StatModifierFlags.Skill }],
    },
    {
        desc: '+#% Chance To Bleed',
        tags: ['Attack', 'Bleed', 'Physical', 'Ailment'],
        stats: [{ name: 'BleedChance', valueType: 'Base', flags: StatModifierFlags.Bleed }],
    },
    {
        desc: '+#% Chance To Burn',
        tags: ['Attack', 'Burn', 'Elemental', 'Ailment'],
        stats: [{ name: 'BurnChance', valueType: 'Base', flags: StatModifierFlags.Burn }],
    },
    {
        desc: '+# Bleed Duration',
        tags: ['Duration', 'Bleed', 'Ailment'],
        stats: [{ name: 'Duration', valueType: 'Base', flags: StatModifierFlags.Bleed }],
    },
    {
        desc: '#% Increased Bleed Duration',
        tags: ['Duration', 'Bleed', 'Ailment'],
        stats: [{ name: 'Duration', valueType: 'Inc', flags: StatModifierFlags.Bleed }],
    },
    {
        desc: '+# Burn Duration',
        tags: ['Duration', 'Burn', 'Ailment'],
        stats: [{ name: 'Duration', valueType: 'Base', flags: StatModifierFlags.Burn }],
    },
    {
        desc: '#% Increased Burn Duration',
        tags: ['Duration', 'Burn', 'Ailment'],
        stats: [{ name: 'Duration', valueType: 'Inc', flags: StatModifierFlags.Burn }],
    },
    {
        desc: '+# Maximum Bleed Stack',
        tags: ['Bleed', 'Ailment'],
        stats: [{ name: 'AilmentStack', valueType: 'Base', flags: StatModifierFlags.Bleed }],
    },
    {
        desc: '+# Maximum Burn Stack',
        tags: ['Burn', 'Ailment'],
        stats: [{ name: 'AilmentStack', valueType: 'Base', flags: StatModifierFlags.Burn }],
    }
];

export class Modifier {
    readonly text: string;
    readonly template: ModTemplate;
    readonly stats: StatModifier[] = [];
    constructor(text: string) {

        this.text = text;

        const parsedData = Modifier.parseText(text);
        this.template = parsedData.template;
        this.stats = parsedData.stats;
    }

    get tags() { return this.template.tags }

    get templateDesc() { return this.template.desc; }

    get desc() {
        return Modifier.parseDescription(this.template.desc, this.stats);
    }

    static compare(a: Modifier, b: Modifier) {
        return a.compare(b);
    }
    static sort(a: Modifier, b: Modifier) {
        return a.sort(b);
    }

    static parseText(text: string) {
        const match = [...text.matchAll(/{(?<v1>\d+(\.\d+)?)(-(?<v2>\d+(\.\d+)?))?\}/g)];
        const desc = text.replace(/{[^}]+}/g, '#');
        const template = modTemplates.find(x => x.desc === desc);
        if (!template) {
            throw Error(`Failed to find mod template. Invalid mod description: ${text}`);
        }
        const stats: StatModifier[] = [];
        for (const [index, statTemplate] of template.stats.entries()) {
            const matchValue = match[index];
            if (!matchValue || !matchValue.groups) {
                throw Error('invalid modifier');
            }
            const { v1, v2 } = matchValue.groups;
            if (!v1) {
                throw Error('invalid modifier');
            }
            const min = parseFloat(v1);
            const max = v2 ? parseFloat(v2) : min;
            const value = min;
            stats.push(new StatModifier({ name: statTemplate.name, valueType: statTemplate.valueType, value, min, max, flags: statTemplate.flags || 0 }));
        }
        return { template, stats };
    }

    static parseDescription(desc: ModTemplate['desc'], stats: StatModifier[]) {
        let i = 0;
        return desc.replace(/#+/g, (x) => {
            const stat = stats[i++];
            if (!stat) {
                throw Error('invalid mod description');
            }
            const value = stat.value.toFixed(x.length - 1) || '#';
            return value;
        });
    }

    sort(other: Modifier) {
        return modTemplates.findIndex(x => x.desc === this.templateDesc) - modTemplates.findIndex(x => x.desc === other.templateDesc);
    }

    compare(other: Modifier) {
        return this.templateDesc === other.templateDesc;
    }

    copy() {
        return new Modifier(this.text);
    }
}

export class StatModifier {

    readonly name: StatName;
    readonly valueType: StatModifierValueType;
    value: number;
    readonly flags: number;
    readonly min: number;
    readonly max: number;
    source?: string;
    constructor(data: StatModifierParams) {
        this.name = data.name;
        this.valueType = data.valueType;
        this.value = data.value;
        this.flags = data.flags || 0;
        this.min = data.min || this.value;
        this.max = data.max || this.value || this.min;
        this.source = data.source;
    }

    randomizeValue() {
        this.value = Math.random() * (this.max - this.min) + this.min;
    }
}

export class ModDB {
    private _modList: StatModifier[];
    public readonly onChange: EventEmitter<StatModifier[]>;
    constructor() {
        this._modList = [];
        this.onChange = new EventEmitter<StatModifier[]>();
    }

    get modList() { return this._modList; }

    add(statMods: StatModifier[], source: string) {
        statMods.forEach(x => x.source = source);
        this.modList.push(...statMods);
        this.onChange.invoke([...this.modList]);
    }

    removeBySource(source: string) {
        this._modList = this.modList.filter(x => x.source !== source);
        this.onChange.invoke([...this.modList]);
    }

    clear() {
        this._modList = [];
        this.onChange.invoke([...this.modList]);
    }


}