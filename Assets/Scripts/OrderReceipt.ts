import { Button } from 'UnityEngine.UI'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class OrderReceipt extends ZepetoScriptBehaviour {

    @SerializeField() private openReceiptBtn :Button;
    
    public GetReceiptButton(): Button{
        return this.openReceiptBtn;
    }
}