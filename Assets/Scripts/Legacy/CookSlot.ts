import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Sprite } from "UnityEngine";
import { Button, Image } from "UnityEngine.UI";
import { TextMeshProUGUI } from 'TMPro';
export default class CookSlot extends ZepetoScriptBehaviour {
    @SerializeField() private productSlotBtn: Button;  // Btn for stored item
    @SerializeField() private productCountText: TextMeshProUGUI;

    public SetSlot(sprite: Sprite, text: string) {    
        this.productSlotBtn.image.sprite = sprite;
        this.productCountText.text = text;
        this.SEtSlotVisivility(true);
    }

    public SEtSlotVisivility(value: boolean){
        this.productSlotBtn.image.enabled = value;
        this.productCountText.enabled = value;
    }

    public GetProductSprite(): Sprite{
        return this.productSlotBtn.image.sprite;
    }
}