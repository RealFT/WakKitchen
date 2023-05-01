import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Image, Text, Button } from 'UnityEngine.UI';
import { GameObject, Sprite } from 'UnityEngine';

export default class ExpandOrderReceipt extends ZepetoScriptBehaviour {

    @SerializeField() private panel: GameObject;
    @SerializeField() private closePanelButton: Button;

    //private ingredientImages: Image[];
    @SerializeField() private burgerImages: Image[];
    @SerializeField() private drinkImage: Image;
    @SerializeField() private sideImage: Image;
    @SerializeField() private additionalOrderText: Text;
    @SerializeField() private priceText: Text;
    @SerializeField() private customerImage: Image;

    Start(){
        this.closePanelButton.onClick.AddListener(() => {
            this.setPanel(false);
        });
    }

    public SetOrderReceipt(burgerSprites: Sprite[], drinkSprite: Sprite, 
        sideSprite: Sprite, additionalOrder: string, pay: string, customerSprite: Sprite): void {
            
        this.ClearOrderReceipt();
        for (let i = 0; i < burgerSprites.length; i++) {
            this.burgerImages[i].sprite = burgerSprites[i];
            this.burgerImages[i].enabled = true;
        }

        if(drinkSprite) this.EnableImage(this.drinkImage, drinkSprite);
        if(sideSprite) this.EnableImage(this.sideImage, sideSprite);
        if(customerSprite) this.EnableImage(this.customerImage, customerSprite);
        this.customerImage.SetNativeSize();
        if(this.additionalOrderText) this.additionalOrderText.text = additionalOrder;
        if(this.priceText) this.priceText.text = pay;
    }

    private ClearOrderReceipt(){
        for (let i = 0; i < this.burgerImages.length; i++) {
            this.burgerImages[i].enabled = false;
        }
        this.drinkImage.enabled = false;
        this.sideImage.enabled = false;
        this.additionalOrderText.text = "";
        this.priceText.text = "";
        this.customerImage.enabled = false;
    }

    private EnableImage(image:Image, sprite: Sprite){
        image.sprite = sprite;
        image.enabled = true;
    }

    public setPanel(value: boolean) {
        this.panel.SetActive(value);
    }
}