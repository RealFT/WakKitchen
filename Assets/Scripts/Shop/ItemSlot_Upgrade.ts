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

    // public SetItemSlot(item: StoreItem) {
    //     this.storeItem = item;
    //     this.buyBtn.onClick.AddListener(() => {
    //         this.buyItem(item);
    //     });
    // }

    public SetItem(ir :ProductRecord, sprite: Sprite){
        this.itemImage.sprite = sprite;
        this.itemRecord = ir;
        this.nameTxt.text = ir.name.toString();
        this.priceTxt.text = ir.price.toString();
        this.buyBtn.onClick.AddListener(() => {
            this.StartCoroutine(ItemManager.GetInstance().PurchaseItem(ir.productId));
        });
    }

    public GetItemRecord(): ProductRecord {
        return this.itemRecord;
    }
}