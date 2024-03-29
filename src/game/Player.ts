import { ModDB, Modifier } from "./mods";
import { calcAttack } from "./calc/calcDamage";
import { invLerp, querySelector } from "@src/utils/helpers";
import type Game from './Game';
import type GameSave from "@src/types/save/save";

export default class Player {
    private readonly manaBar: HTMLProgressElement;
    readonly modDB = new ModDB();
    private _attackProgressPct: number = 0;
    constructor(readonly game: Game) {
        this.manaBar = querySelector<HTMLProgressElement>('[data-mana-bar]', this.game.page);
    }

    get attackProgressPct() {
        return this._attackProgressPct;
    }

    init() {
        this.game.onSave.listen(this.save.bind(this));

        if (this.game.config!.player) {
            this.game.config!.player.modList.forEach(x => {
                this.modDB.add(new Modifier(x).stats, 'Player');
            });
        }

        this.game.gameLoop.subscribeAnim(() => {
            this.updateManaBar();
        });

        this.game.statistics.statistics['Current Mana'].addListener('change', curMana => {
            const maxMana = this.game.statistics.statistics['Maximum Mana'].get();
            if (curMana > maxMana) {
                this.game.statistics.statistics['Current Mana'].set(maxMana);
            }
        });

        this.game.gameLoop.subscribe(() => {
            const amount = this.game.statistics.statistics['Gold Generation'].get();
            this.game.statistics.statistics.Gold.add(amount);
            this.game.statistics.statistics["Gold Generated"].add(amount);
        }, { intervalMilliseconds: 1000 });

        this.game.gameLoop.subscribe((dt) => {
            const manaRegen = this.game.statistics.statistics['Mana Regeneration'].get() * dt;
            this.game.statistics.statistics['Current Mana'].add(manaRegen);
            this.game.statistics.statistics["Mana Generated"].add(manaRegen);
        });

        this._attackProgressPct = this.game.saveObj?.player?.attackTimePct || 0;
    }

    reset() {
        this.modDB.clear();
    }

    async setup() {
        this.game.statistics.statistics['Current Mana'].set(this.game.saveObj?.player?.curMana || this.game.statistics.statistics['Maximum Mana'].get());
        this.updateManaBar();

        this.startAutoAttack();
    }

    private updateManaBar() {
        if (this.game.statistics.statistics['Maximum Mana'].get() <= 0) {
            return;
        }
        const pct = this.game.statistics.statistics['Current Mana'].get() / this.game.statistics.statistics['Maximum Mana'].get();
        this.manaBar.value = pct;
    }

    private startAutoAttack() {

        const calcWaitTime = () => 1 / this.game.statistics.statistics['Attack Speed'].get();
        this.game.statistics.statistics['Attack Speed'].addListener('change', () => {
            waitTimeSeconds = calcWaitTime();
            time = waitTimeSeconds * this._attackProgressPct;
        });
        let waitTimeSeconds = calcWaitTime();
        let time = 0;
        this.game.gameLoop.subscribe(dt => {
            this._attackProgressPct = Math.min(invLerp(0, waitTimeSeconds, time), 1);
            time += dt;
            if (time >= waitTimeSeconds) {
                const curMana = this.game.statistics.statistics['Current Mana'].get();
                const manaCost = this.game.statistics.statistics['Attack Mana Cost'].get();
                if (curMana > manaCost) {
                    this.game.statistics.statistics['Current Mana'].subtract(manaCost);
                    this.performAttack();
                    waitTimeSeconds = calcWaitTime();
                    time = 0;
                }
            }
        });
    }

    private performAttack() {
        const result = calcAttack(this.modDB.modList);
        if (!result) {
            return;
        }

        this.game.statistics.statistics.Hits.add(1);
        this.game.statistics.statistics["Total Damage"].add(result.totalDamage);
        this.game.statistics.statistics["Total Physical Damage"].add(result.totalPhysicalDamage);
        this.game.statistics.statistics["Total Elemental Damage"].add(result.totalElementalDamage);
        if (result.crit) {
            this.game.statistics.statistics["Critical Hits"].add(1);
        }
        this.game.enemy.dealDamage(result.totalDamage);

        this.game.enemy.applyAilments(result.ailments);
    }

    save(saveObj: GameSave) {
        saveObj.player = {
            level: this.game.statistics.statistics.Level.get(),
            gold: this.game.statistics.statistics.Gold.get(),
            curMana: this.game.statistics.statistics['Current Mana'].get(),
            attackTimePct: this.attackProgressPct
        };
    }
}