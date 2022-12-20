import { gameLoop } from "../game";
import { playerStats, modDB } from "../player";
import { AttackSkillModal, BuffSkillModal } from "./skillModal";
import { AttackSkill, BuffSkill, Skill } from "./skills";



export class SkillSlot<T extends Skill> {
    public readonly element: HTMLElement;
    protected _skill?: T;
    constructor() {
        this.element = this.createElement();
    }
    get skill() { return this._skill; }
    set(skill: T) {
        this._skill = skill;
        const name = skill?.name || '[Empty]';
        this.element.setAttribute('data-skill-name', name);
        this.element.querySelector('[data-label]').textContent = name;
    }
    protected createElement() { return undefined as HTMLElement; }
}

export class AttackSkillSlot extends SkillSlot<AttackSkill> {
    private readonly skillSlotContainer = document.querySelector<HTMLElement>('.p-game .s-player .s-skills [data-attack-skill]');
    private readonly modal: AttackSkillModal;
    readonly skills: AttackSkill[];
    constructor(attackSkills: AttackSkill[], modal: AttackSkillModal) {
        super();
        this.modal = modal;
        this.skillSlotContainer.appendChild(this.element);
        this.skills = attackSkills;
    }

    set(skill: AttackSkill) {
        super.set(skill);
        this._skill?.enable();
    }

    edit() {
        this.modal.open(this);
    }

    protected createElement() {
        const element = document.createElement('div');
        element.classList.add('g-field');
        element.setAttribute('data-skill-slot', 'attack-skill');
        element.insertAdjacentHTML('beforeend', `<div data-label></div>`);
        element.insertAdjacentHTML('beforeend', `<button class="g-button" data-edit>Edit</button>`);
        element.querySelector('button').addEventListener('click', () => this.edit());
        return element;
    }
}

export class BuffSkillSlot extends SkillSlot<BuffSkill> {
    private readonly buffSkillList: HTMLUListElement = document.querySelector<HTMLUListElement>('.p-game .s-player .s-skills ul[data-buff-skill-list]');
    readonly modal: BuffSkillModal;
    readonly skills: BuffSkill[];
    private running: boolean;

    constructor(skills: BuffSkill[], modal: BuffSkillModal) {
        super();
        this.skills = skills;
        this.modal = modal;
        this.buffSkillList.appendChild(this.element);
        this.set(undefined);
    }

    private trigger() {
        if (!this._skill || this.running) {
            return;
        }
        const sufficientMana = playerStats.curMana.get() >= this._skill.manaCost;
        if (!sufficientMana) {
            return;
        }
        playerStats.curMana.subtract(this._skill.manaCost);
        this.start();
    }

    private start() {
        const calcDuration = () => this._skill.baseDuration * playerStats.skillDurationMultiplier.get();
        let time = calcDuration();
        let pct = 100;
        let duration = time;
        let loopId = -1;
        const progressBar = this.element.querySelector<HTMLElement>('.wrapper [data-progress-bar]');
        const changeId = playerStats.skillDurationMultiplier.onChange.listen(() => {
            duration = calcDuration();
            time = duration * (pct / 100);
        });

        modDB.add(this._skill.mods.flatMap(x => x.stats), this._skill.sourceName);

        const startLoops = () => {
            loopId = gameLoop.subscribe(dt => {
                if (time <= 0) {
                    gameLoop.unsubscribe(loopId);
                    stop();
                    return;
                }
                time -= dt;
                pct = Math.max(0, time / duration * 100);
                progressBar.style.width = `${pct}%`;
            });
        }

        const stop = () => {
            playerStats.skillDurationMultiplier.onChange.removeListener(changeId);
            modDB.removeBySource(this._skill.sourceName);
            this.running = false;
            progressBar.style.width = `0%`;
        }
        startLoops();
        this.running = true;
    }

    private edit() {
        this.modal.open(this);
    }

    protected createElement() {
        const element = document.createElement('li');
        element.classList.add('g-field');
        element.setAttribute('data-skill-slot', 'buff-skill');

        element.insertAdjacentHTML('beforeend', `
        <div class="wrapper">
            <div data-progress-bar></div>
            <div class="g-button" data-label></div>
        </div>`);
        element.insertAdjacentHTML('beforeend', `<button class="g-button" data-edit>Edit</button>`);
        element.querySelector('[data-edit]').addEventListener('click', () => this.edit());
        element.querySelector('[data-label]').addEventListener('click', () => this.trigger());
        return element;
    }
}