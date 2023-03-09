import { Button, Text } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import ItemManager from '../ItemManager';

export default class ItemSlot_Food extends ZepetoScriptBehaviour {
    
    // @SerializeField() private productId: string;
    // @SerializeField() private purchaseButton: Button;
    // @SerializeField() private priceText: Text;

    // Start(){
    //     this.purchaseButton.onClick.AddListener(()=>{
    //         ItemManager.GetInstance().PurchaseItem(this.productId);
    //     });
    //     //this.priceText.text = ItemManager.GetInstance().GetProduct(this.productId).price.toString();
    // }

    // public SetItem(productId:string){
    //     this.productId = productId;
    //     //this.priceText.text = ItemManager.GetInstance().GetProduct(this.productId).price.toString();
    //     this.purchaseButton.onClick.AddListener(()=>{
    //         ItemManager.GetInstance().PurchaseItem(this.productId);
    //     });
    // }
}