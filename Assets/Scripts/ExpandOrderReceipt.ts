import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Image, Text, Button } from 'UnityEngine.UI';
import { GameObject, Sprite } from 'UnityEngine';

export default class ExpandOrderReceipt extends ZepetoScriptBehaviour {

    public panel: GameObject;
    public closePanelButton: Button;

    public ingredientImages: Image[];
    public burgerImages: Image[];
    public drinkImage: Image;
    public sideImage: Image;
    public additionalOrderText: Text;
    public characterImage: Image;

    Start(){
        this.closePanelButton.onClick.AddListener(() => {
            this.setPanel(false);
        });
    }

    public SetOrderReceipt(ingredients: string[], burgerSprites: Sprite[],
        drinkSprite: Sprite, sideSprite: Sprite, additionalOrder: string,
        characterSprite: Sprite): void {

        const ingredientCounts: number[] = new Array(ingredients.length).fill(0);
        for (let i = 0; i < ingredients.length; i++) {
            for (let j = 0; j < ingredients.length; j++) {
                if (ingredients[i] === ingredients[j] && i !== j) {
                    ingredientCounts[i]++;
                }
            }
        }

        for (let i = 0; i < burgerSprites.length; i++) {
            this.burgerImages[i].sprite = burgerSprites[i];
        }

        this.drinkImage.sprite = drinkSprite;
        this.sideImage.sprite = sideSprite;
        this.additionalOrderText.text = additionalOrder;
        this.characterImage.sprite = characterSprite;
    }

    public setPanel(value: boolean) {
        this.panel.SetActive(value);
    }
}