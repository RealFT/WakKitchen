import { Image, Button } from 'UnityEngine.UI'
import { GameObject, Sprite } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import Receipt from './Receipt';
import DataManager from './DataManager';

export default class OrderReceipt extends ZepetoScriptBehaviour {

    @SerializeField() private openReceiptBtn :Button;
    @SerializeField() private burgerImages: Image[];
    @SerializeField() private sideImage: Image;
    @SerializeField() private drinkImage: Image;

    public GetReceiptButton(): Button{
        return this.openReceiptBtn;
    }

    public SetOrderReceipt(receipt: Receipt){
        this.ClearOrderReceipt();
        if (this.drinkImage) {
            for (let i = 0; i < receipt.ingredients.length; i++) {
                let sprite = DataManager.GetInstance().getIngredientSprite(receipt.ingredients[i]);
                this.burgerImages[i].sprite = sprite;
                this.burgerImages[i].enabled = true;
            }
        }
        const drinkSprite = DataManager.GetInstance().getDrinkSprite(receipt.drink);
        const sideSprite = DataManager.GetInstance().getSideSprite(receipt.side);
        
        if (drinkSprite) this.EnableImage(this.drinkImage, drinkSprite);
        if (sideSprite) this.EnableImage(this.sideImage, sideSprite);
    }

    private ClearOrderReceipt() {
        for (let i = 0; i < this.burgerImages.length; i++) {
            this.burgerImages[i].enabled = false;
        }
        this.drinkImage.enabled = false;
        this.sideImage.enabled = false;
    }

    private EnableImage(image: Image, sprite: Sprite) {
        image.sprite = sprite;
        image.enabled = true;
    }
}