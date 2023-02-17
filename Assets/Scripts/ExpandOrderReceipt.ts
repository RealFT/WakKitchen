import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Image, Text } from 'UnityEngine.UI';
import { Sprite } from 'UnityEngine';

export default class ExpandOrderReceipt extends ZepetoScriptBehaviour {

    public orderNameText: Text;
    public ingredientImages: Image[];
    public burgerImages: Image[];
    public drinkImage: Image;
    public sideImage: Image;
    public additionalOrderText: Text;
    public characterImage: Image;

    public SetOrderReceipt(orderName: string, ingredients: string[], burgerSprites: Sprite[],
        drinkSprite: Sprite, sideSprite: Sprite, additionalOrder: string,
        characterSprite: Sprite): void {
        this.orderNameText.text = orderName;

        const ingredientCounts: number[] = new Array(ingredients.length).fill(0);
        for (let i = 0; i < ingredients.length; i++) {
            for (let j = 0; j < ingredients.length; j++) {
                if (ingredients[i] === ingredients[j] && i !== j) {
                    ingredientCounts[i]++;
                }
            }
        }

/*        for (let i = 0; i < ingredients.length; i++) {
            this.ingredientImages[i].sprite = this.GetIngredientSprite(ingredients[i]);
            if (ingredientCounts[i] > 0) {
                for (let j = 0; j < ingredientCounts[i]; j++) {
                    //const starImage;
                    starImage.sprite = this.GetStarSprite();
                }
            }
        }*/

        for (let i = 0; i < burgerSprites.length; i++) {
            this.burgerImages[i].sprite = burgerSprites[i];
        }

        this.drinkImage.sprite = drinkSprite;
        this.sideImage.sprite = sideSprite;
        this.additionalOrderText.text = additionalOrder;
        this.characterImage.sprite = characterSprite;
    }


/*    private GetStarSprite(): Sprite {
        // Return the star sprite for indicating additional ingredients
    }*/
}