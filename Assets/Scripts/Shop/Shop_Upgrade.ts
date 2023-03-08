import { Object, GameObject, Quaternion, RectTransform, Vector2, Sprite, Debug } from 'UnityEngine'
import { HorizontalLayoutGroup } from "UnityEngine.UI";
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import ItemSlot_Upgrade from './ItemSlot_Upgrade';
import { ProductRecord } from 'ZEPETO.Product';
import ItemManager from '../ItemManager';

export default class Shop_Upgrade extends ZepetoScriptBehaviour {

    @SerializeField() private upgradeSlotPref: GameObject;
    @SerializeField() private horizontalContent: RectTransform;
    @SerializeField() private layoutGroup: HorizontalLayoutGroup;
    @SerializeField() private itemImage: Sprite[];

    Start() {
        this.CreateSlot(ItemManager.GetInstance().getUpgradeCache());
    }

    private CreateSlot(items: Map<string, ProductRecord>): void {
        // // Clear the existing items in the content parent.
        // this.horizontalContent.GetComponentsInChildren<ItemSlot_Upgrade>().forEach((child) => {
        //     GameObject.Destroy(child.gameObject);
        // });
    
        // Create an Upgrade Slot for each item in the list.
        Array.from(items.values()).forEach((productRecord) => {
            Debug.Log(items.values());
            this.SetupUpgradeSlot(productRecord);
        });
    }

    private SetupUpgradeSlot(itemRecord: ProductRecord) {
        // Instantiate a new item object and set its parent to the content parent object.
        const slotObj = Object.Instantiate(this.upgradeSlotPref, this.horizontalContent.transform) as GameObject;
    
        // Calculate the new width of the Content object based on the width of the prefabs and the spacing.
        let prefabWidth = slotObj.GetComponent<RectTransform>().rect.width;
        let spacing = this.layoutGroup.spacing;
        let newWidth = this.horizontalContent.rect.width + prefabWidth + spacing;
    
        // Set the size of the Content object using its sizeDelta property.
        this.horizontalContent.sizeDelta = new Vector2(newWidth, this.horizontalContent.sizeDelta.y);
    
        // Set up the item's image using the itemImage array.
        const itemImageIndex = this.itemImage.findIndex((s) => s.name == itemRecord.productId);
        const itemImage = this.itemImage[itemImageIndex];
    
        // Set up the item's properties using its ITM_Inventory component.
        const itemScript = slotObj.GetComponent<ItemSlot_Upgrade>();
        itemScript.itemImage.sprite = itemImage;
        itemScript.SetItem(itemRecord);
    }

}