import { Button, Text } from 'UnityEngine.UI';
import { GameObject, Sprite } from 'UnityEngine'
import { ProductRecord } from 'ZEPETO.Product';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import ItemManager from '../ItemManager';

export default class ItemSlot_Food extends ZepetoScriptBehaviour {
    
    private itemRecord: ProductRecord;
    @SerializeField() private foodParent: GameObject;
    @SerializeField() private foodPref: GameObject;
    @SerializeField() private priceTxt :Text;
    @SerializeField() private buyBtn: Button;

    public SetItem(ir :ProductRecord, foodPref: GameObject){
        this.foodPref = foodPref;
        this.itemRecord = ir;
        this.priceTxt.text = ir.price.toString();
        this.buyBtn.onClick.AddListener(() => {
            this.StartCoroutine(ItemManager.GetInstance().PurchaseItem(ir.productId));
        });
    }

    public GetItemRecord(): ProductRecord {
        return this.itemRecord;
    }
}