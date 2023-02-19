import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Image, Text, Button } from 'UnityEngine.UI';
import { GameObject, Sprite } from 'UnityEngine';

export default class ExpandOrderReceipt extends ZepetoScriptBehaviour {

    public panel: GameObject;
    public closePanelButton: Button;

    //private ingredientImages: Image[];
    public burgerImages: Image[];
    public drinkImage: Image;
    public sideImage: Image;
    public additionalOrderText: Text;
    public customerImage: Image;

    Start(){
        this.closePanelButton.onClick.AddListener(() => {
            this.setPanel(false);
        });
    }

    public SetOrderReceipt(ingredients: string[], burgerSprites: Sprite[],
        drinkSprite: Sprite, sideSprite: Sprite, additionalOrder: string,
        customerSprite: Sprite): void {

        // const ingredientCounts: number[] = new Array(ingredients.length).fill(0);
        // for (let i = 0; i < ingredients.length; i++) {
        //     for (let j = 0; j < ingredients.length; j++) {
        //         if (ingredients[i] === ingredients[j] && i !== j) {
        //             ingredientCounts[i]++;
        //         }
        //     }
        // }

        for (let i = 0; i < this.burgerImages.length; i++) {
            if (i >= this.burgerImages.length) break;
            if (i < burgerSprites.length) {
                this.burgerImages[i].sprite = burgerSprites[i];
                this.burgerImages[i].enabled = true;
            }
            else {
                this.burgerImages[i].enabled = false;
            }
        }

        this.drinkImage.sprite = drinkSprite;
        this.sideImage.sprite = sideSprite;
        this.additionalOrderText.text = additionalOrder;
        this.customerImage.sprite = customerSprite;
    }

    public setPanel(value: boolean) {
        this.panel.SetActive(value);
    }
}