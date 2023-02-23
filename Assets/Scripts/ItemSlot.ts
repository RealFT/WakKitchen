import { Button } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from './GameManager';
import { StoreItem } from './Store';
import UIManager from './UIManager';

export default class ItemSlot extends ZepetoScriptBehaviour {

    public storeItem: StoreItem;
    public buyBtn: Button;

    public SetItemSlot(item: StoreItem) {
        this.storeItem = item;
        this.buyBtn.onClick.AddListener(() => {
            this.buyItem(item);
        });
    }

    public buyItem(item: StoreItem): void {
        const money = GameManager.GetInstance().getCurrentMoney();
        if (money < item.price) {
            // The player doesn't have enough money to buy the item.
            console.log('Not enough money to buy this item!');
            return;
        }

        // Subtract the cost of the item from the player's money.
        GameManager.GetInstance().changeMoney(-item.price);

        // Add the item to the player's inventory.
        //this.inventory.push(item);

        // Update the UI to reflect the changes.
        //this.updateInventoryUI();
        UIManager.GetInstance().setGameMoneyText(money);
    }

    public GetStoreItem(): StoreItem {
        return this.storeItem;
    }
}