import { Button, Image, Text } from 'UnityEngine.UI';
import { GameObject, Sprite } from 'UnityEngine'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ProductRecord } from 'ZEPETO.Product';
import ItemManager from '../ItemManager';

export default class ItemSlot_Upgrade extends ZepetoScriptBehaviour {

    private itemRecord: ProductRecord;
    @SerializeField() private  itemImage: Image;
    @SerializeField() private starObjs : GameObject[] = [];
    @SerializeField() private nameTxt :Text;
    @SerializeField() private priceTxt :Text;
    @SerializeField() private buyBtn: Button;

    public SetItem(ir: ProductRecord, sprite: Sprite, upgradeLevel: number, isFullyUpgraded: boolean) {
        this.itemImage.sprite = sprite;
        this.itemRecord = ir;
        this.nameTxt.text = ir.name.toString();
        this.priceTxt.text = ir.price.toString();
        if (!isFullyUpgraded) {
            this.buyBtn.onClick.AddListener(() => {
                this.StartCoroutine(ItemManager.GetInstance().PurchaseItem(ir.productId));
            });
            this.SetStar(upgradeLevel);
        }
        else{
            this.buyBtn.gameObject.SetActive(false);
            this.SetStar(upgradeLevel+1);
        }
        
    }

    private SetStar(upgradeLevel: number) {
        for (const index in this.starObjs) {
            this.starObjs[index].SetActive(false);
        }
        for (let visibleIndex = 0; visibleIndex < upgradeLevel - 1; visibleIndex++) {
            this.starObjs[visibleIndex].SetActive(true);
        }
    }

    public GetItemRecord(): ProductRecord {
        return this.itemRecord;
    }
}