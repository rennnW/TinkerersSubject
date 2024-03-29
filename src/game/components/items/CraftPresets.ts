import { querySelector } from "@src/utils/helpers";
import type { CraftId } from "./crafting";
import type Items from "./Items";

export default class CraftPresets {
    presets: CraftPreset[] = [];
    activePreset?: CraftPreset;
    private readonly modal: HTMLDialogElement;
    constructor(readonly items: Items) {

        this.modal = querySelector<HTMLDialogElement>('.p-game .p-items [data-preset-modal]', this.items.page);

        //new preset button
        querySelector('.s-preset-container [data-new]', this.items.page).addEventListener('click', () => {
            const preset = this.newPreset();
            this.editActivePreset();
            preset.element.click();
        });
        //edit preset button
        querySelector('.s-preset-container [data-edit]', this.items.page).addEventListener('click', () => this.editActivePreset());

        //preset modal apply button
        querySelector('[data-apply]', this.modal).addEventListener('click', () => {
            if (!this.activePreset) {
                return;
            }
            const newIds = [...this.modal.querySelectorAll<HTMLTableRowElement>('[data-craft-list] table [data-id]')].filter(x => x.classList.contains('selected')).map(x => x.getAttribute('data-id'));
            this.activePreset!.ids = newIds as CraftId[];
            const name = querySelector<HTMLInputElement>('input[data-name]', this.modal).value;
            if (name !== this.activePreset.name) {
                this.activePreset.name = name;
            }
            this.selectPreset(this.activePreset);
        });
        //preset modal delete button
        querySelector('[data-delete]', this.modal).addEventListener('click', () => this.deleteActivePreset());

        if (items.game.saveObj?.items?.craftPresets) {
            for (const savedPreset of items.game.saveObj.items?.craftPresets) {
                if(savedPreset?.name && savedPreset.ids){
                    this.newPreset(savedPreset.name, savedPreset.ids as CraftId[]);
                }
            }
        } else {
            this.newPreset('Default', items.data.craftList.map(x => x.id));
        }
    }

    newPreset(name = 'New', ids: CraftId[] = this.items.data.craftList.map(x => x.id)) {
        const preset = new CraftPreset(name, ids);
        preset.element.addEventListener('click', () => {
            this.presets.forEach(x => x.element.classList.toggle('selected', x === preset));
            this.selectPreset(preset);
        });
        querySelector('.s-preset-container [data-preset-list]').appendChild(preset.element);
        this.presets.push(preset);
        preset.element.click();
        return preset;
    }

    selectPreset(preset?: CraftPreset) {
        this.activePreset = preset;
        this.items.updateCraftList(this.activePreset?.ids);
        querySelector<HTMLButtonElement>('.s-preset-container [data-edit]', this.items.page).disabled = typeof this.activePreset === 'undefined';
    }

    editActivePreset() {
        if (!this.activePreset) {
            return;
        }
        const modal = querySelector<HTMLDialogElement>('.p-game .p-items [data-preset-modal]');

        querySelector<HTMLInputElement>('input[data-name]', modal).value = this.activePreset?.name;
        const filteredCraftList = this.items.data.craftList.filter(x => x.levelReq <= this.items.game.statistics.statistics.Level.get());
        const rows = [] as HTMLTableRowElement[];
        for (const craftData of filteredCraftList) {
            const label = this.items.craftDescToHtml(craftData.id);
            const row = document.createElement('tr');
            row.classList.add('g-list-item');
            row.classList.toggle('selected', this.activePreset.ids.includes(craftData.id));
            row.setAttribute('data-id', craftData.id);
            row.insertAdjacentHTML('beforeend', `
                <td>${label}</td>
                <td>${craftData.levelReq}</td>
                <td class="g-gold">${craftData.cost}</td>`);
            row.addEventListener('click', () => {
                row.classList.toggle('selected', !row.classList.contains('selected'));
            })
            rows.push(row);
        }

        querySelector<HTMLTableElement>('[data-craft-list] table tbody', modal).replaceChildren(...rows);
        modal.showModal();
    }

    deleteActivePreset() {
        if (!this.activePreset) {
            return;
        }
        this.activePreset.element.remove();
        this.presets.splice(this.presets.indexOf(this.activePreset), 1);
        if(this.presets.length === 0){
            this.items.updateCraftList();
            this.selectPreset(undefined);
        } else {
            this.presets[0]?.element.click();
        }
    }
}

class CraftPreset {
    readonly element: HTMLLIElement;
    constructor(private _name: string, public ids: CraftId[]) {
        this.element = this.createElement();
    }

    get name() {
        return this._name;
    }
    set name(v: string) {
        this.element.textContent = v;
    }
    private createElement() {
        const li = document.createElement('li');
        li.classList.add('g-list-item');
        li.setAttribute('data-name', this.name);
        li.textContent = this.name;
        return li;
    }
}