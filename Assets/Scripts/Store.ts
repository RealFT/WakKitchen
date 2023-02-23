import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import DataManager from './DataManager';
import GameManager from './GameManager';
import ItemSlot from './ItemSlot';
import UIManager from './UIManager';

// Define a product interface
export class StoreItem {
    id: number;
    name: string;
    price: number;

    SetItem(id: number, name: string, price: number) {
        this.id = id;
        this.name = name;
        this.price = price;
    }
}

export default class Store extends ZepetoScriptBehaviour {
    private items: StoreItem[] = [];
    private itemSlots: ItemSlot[] = [];

    Start() {
        this.initItems();
        this.initItemSlots();
    }

    initItems() {
        this.items = DataManager.GetInstance().getItems();
    }

    initItemSlots() {
        for (let i = 0; i < this.itemSlots.length; i++) {
            if (i < this.items.length) {
                this.itemSlots[i].gameObject.SetActive(true);
                this.itemSlots[i].SetItemSlot(this.items[i]);
            }
            else this.itemSlots[i].gameObject.SetActive(false);
        }
    }

    // Get all items
    getAllItems(): StoreItem[] {
        return this.items;
    }

    // Get a product by ID
    getItemById(id: number): StoreItem | undefined {
        return this.items.find((p) => p.id === id);
    }
}