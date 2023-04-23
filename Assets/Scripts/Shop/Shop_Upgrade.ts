import { Object, GameObject, Quaternion, RectTransform, Vector2, Sprite, Debug, Rect } from 'UnityEngine'
import { HorizontalLayoutGroup, Button } from "UnityEngine.UI";
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import ItemSlot_Upgrade from './ItemSlot_Upgrade';
import { ProductRecord } from 'ZEPETO.Product';
import ItemManager from '../ItemManager';
import Mediator, { EventNames, IListener } from '../Notification/Mediator';
import DataManager from '../DataManager';

export default class Shop_Upgrade extends ZepetoScriptBehaviour implements IListener {
    static readonly MaxUpgradeLevel: number = 3;
    @SerializeField() private upgradeSlotPref: GameObject;
    @SerializeField() private horizontalContent: RectTransform;
    @SerializeField() private layoutGroup: HorizontalLayoutGroup;
    @SerializeField() private contentHeight: number;
    private upgradSlotPool: ItemSlot_Upgrade[] = [];

    Start() {
        Mediator.GetInstance().RegisterListener(this);
    }
    private OnDestroy() {
        Mediator.GetInstance().UnregisterListener(this);
    }
    public InitUpgradeShop(){
        this.CreateUpgradeSlots(ItemManager.GetInstance().getUpgradeCache());
    }

    private RefreshUpgradSlot(product: ProductRecord) {
        this.upgradSlotPool.forEach((slot) => {
            if(slot.GetItemRecord().productId === product.productId){
                const match = product.productId.split('_');
                const itemName = match ? match[1] : "";
                const itemSprite = DataManager.GetInstance().GetSectionSpriteByName(itemName);
                const upgradeLevel = match ? parseInt(match[2]) : 0;
                slot.SetItem(product, itemSprite, upgradeLevel, upgradeLevel === Shop_Upgrade.MaxUpgradeLevel);
            }
        });
    }

    public OnNotify(sender: any, eventName: string, eventData: any): void {
        if (eventName == EventNames.UpgradeUpdated) {
            const product = ItemManager.GetInstance().GetProduct(eventData);
            if (product){
                this.CreateUpgradeSlots(ItemManager.GetInstance().getUpgradeCache());
                //this.RefreshUpgradSlot(product);
            }
        }
    }

    private CreateUpgradeSlots(items: ProductRecord[]): void {
        // Clear the existing items in the content parent.
        const existingSlots = this.horizontalContent.GetComponentsInChildren<ItemSlot_Upgrade>();
        if (existingSlots) {
            for (let i = 0; i < existingSlots.length; i++) {
                GameObject.Destroy(existingSlots[i].gameObject);
            }
        }
        // reset horizontalContent width.
        this.horizontalContent.sizeDelta = new Vector2(0, this.contentHeight);

        // /^(.+)_(.+)_(\d+)$/ captures 3 groups separated by underscore:
        // 1: Shop Category, 2: item Name, 3: upgrade level
        // third matches single digit separated by underscore.
        //const regex: RegExp = /^(.+)_(.+)_(\d+)$/;
        // Create groups based on match[2] value to extract items with the lowest match[3] value.
        const upgradeGroups  = {};
        const fullyUpgradedGroups  = {};
        for (let item of items) {
            const match = item.productId.split('_');
            const itemName = match[1];
            if (match) {
                console.log(match[1]+match[2]+item.isPurchased);
                // Only retrieve purchased items.
                if (item.isPurchased) {
                    // if item is fully upgraded, add to fullyUpgradedGroups.
                    if (parseInt(match[2]) === Shop_Upgrade.MaxUpgradeLevel) {
                        if (!fullyUpgradedGroups[itemName]) {
                            fullyUpgradedGroups[itemName] = [];
                        }
                        fullyUpgradedGroups[itemName].push(item);
                    }
                    continue;
                }
                if (!upgradeGroups[itemName]) {
                    upgradeGroups[itemName] = [];
                }
                upgradeGroups[itemName].push(item);
            }
        }

        this.SetSlotGroup(upgradeGroups);
        this.SetSlotGroup(fullyUpgradedGroups);
    }

    private SetSlotGroup(groups: {}){
        // Extract items with the lowest match[3] value from each group.
        for (let groupName in groups ) {
            const groupItems = groups[groupName];
            let minItem = groupItems[0];
            for (let i = 1; i < groupItems.length; i++) {
                const currentItem = groupItems[i];
                const currentUpgradeLevel = parseInt(currentItem.productId.split('_')[2]);
                const minUpgradeLevel = parseInt(minItem.productId.split('_')[2]);
                if (currentUpgradeLevel < minUpgradeLevel) {
                    minItem = currentItem;
                }
            }
            // Create an Upgrade Slot for each item in the list.
            const match = minItem.productId.split('_');
            const itemName = match ? match[1] : "";
            const upgradeLevel = match ? parseInt(match[2]) : 0;
            DataManager.GetInstance().SetValue(itemName, upgradeLevel);
            console.log("Section: " + itemName +"Level: "+ upgradeLevel);
            this.SetupUpgradeSlot(minItem, itemName, upgradeLevel, upgradeLevel === Shop_Upgrade.MaxUpgradeLevel);
        }
    }

    private SetupUpgradeSlot(itemRecord: ProductRecord, itemName: string, upgradeLevel: number, isFullyUpgraded: boolean) {
        // Instantiate a new item object and set its parent to the content parent object.
        const slotObj = Object.Instantiate(this.upgradeSlotPref, this.horizontalContent.transform) as GameObject;
    
        // Calculate the new width of the Content object based on the width of the prefabs and the spacing.
        let prefabWidth = slotObj.GetComponent<RectTransform>().rect.width;
        let spacing = this.layoutGroup.spacing;
        let newWidth = this.horizontalContent.rect.width + prefabWidth + spacing;
    
        // Set the size of the Content object using its sizeDelta property.
        this.horizontalContent.sizeDelta = new Vector2(newWidth, this.contentHeight);
    
        const itemSprite = DataManager.GetInstance().GetSectionSpriteByName(itemName);
    
        // Set up the item's properties using its ITM_Inventory component.
        const itemScript = slotObj.GetComponent<ItemSlot_Upgrade>();
        itemScript.SetItem(itemRecord, itemSprite, upgradeLevel, isFullyUpgraded);
        this.upgradSlotPool.push(itemScript);
    }
}