import { Object, GameObject, Quaternion, RectTransform, Vector2, Sprite, Debug } from 'UnityEngine'
import { HorizontalLayoutGroup,Button } from "UnityEngine.UI";
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import ItemSlot_Upgrade from './ItemSlot_Upgrade';
import { ProductRecord } from 'ZEPETO.Product';
import ItemManager from '../ItemManager';

export default class Shop_Upgrade extends ZepetoScriptBehaviour {

    @SerializeField() private upgradeSlotPref: GameObject;
    @SerializeField() private horizontalContent: RectTransform;
    @SerializeField() private layoutGroup: HorizontalLayoutGroup;
    @SerializeField() private itemImages: Sprite[];

    Start() {
        this.CreateSlot(ItemManager.GetInstance().getUpgradeCache());
    }

    private CreateSlot(items: ProductRecord[]): void {
        // Clear the existing items in the content parent.
        const itemSlots = this.horizontalContent.GetComponentsInChildren<ItemSlot_Upgrade>();
        if (itemSlots) {
            for (let i = 0; i < itemSlots.length; i++) {
                GameObject.Destroy(itemSlots[i].gameObject);
            }
        }

        const regex = /(\w+)_(\w+)_(\d)/;
        // Create an Upgrade Slot for each item in the list.
        for(let productRecord of items ){
            // only not Purchased Items
            if (!productRecord.isPurchased) {
                // Set up the item's image using the itemImages array.
                const match = productRecord.productId.match(regex);
                const itemName = match ? match[2] : "";
                Debug.Log(productRecord);
                this.SetupUpgradeSlot(productRecord, match[2]);
            }
        }
        // items.forEach((productRecord) => {
        //     // only not Purchased Items
        //     if (!productRecord.isPurchased) {
        //         // Set up the item's image using the itemImages array.
        //         const match = productRecord.productId.match(regex);
        //         const itemName = match ? match[1] : "";
        //         Debug.Log(productRecord);
        //         this.SetupUpgradeSlot(productRecord, match[1]);
        //     }
        // });
    }

    private SetupUpgradeSlot(itemRecord: ProductRecord, itemName: string) {
        // Instantiate a new item object and set its parent to the content parent object.
        const slotObj = Object.Instantiate(this.upgradeSlotPref, this.horizontalContent.transform) as GameObject;
    
        // Calculate the new width of the Content object based on the width of the prefabs and the spacing.
        let prefabWidth = slotObj.GetComponent<RectTransform>().rect.width;
        let spacing = this.layoutGroup.spacing;
        let newWidth = this.horizontalContent.rect.width + prefabWidth + spacing;
    
        // Set the size of the Content object using its sizeDelta property.
        this.horizontalContent.sizeDelta = new Vector2(newWidth, this.horizontalContent.sizeDelta.y);
    
        const itemImageIndex = this.itemImages.findIndex((s) => s.name === itemName);

        // const itemImageIndex = this.itemImages.findIndex((s) => s.name == itemRecord.productId);
        const itemImage = this.itemImages[itemImageIndex];
    
        // Set up the item's properties using its ITM_Inventory component.
        const itemScript = slotObj.GetComponent<ItemSlot_Upgrade>();
        itemScript.SetItem(itemRecord, itemImage);
    }

}