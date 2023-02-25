import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, InputField, Slider, Text, Image } from "UnityEngine.UI";
import OrderManager, { Ingredient } from './OrderManager';
import { Sprite } from 'UnityEngine';
export default class Slicable extends ZepetoScriptBehaviour {

    public originImage: Image;
    public slicedSprite: Sprite;
    public ingredient: Ingredient;
    private isSliced: boolean;

    public SetSlicable(origin: Sprite, ingredient: Ingredient) {
        this.originImage.sprite = origin;
        this.slicedSprite = OrderManager.GetInstance().getIngredientSprite(ingredient);
        this.ingredient = ingredient;
        this.isSliced = false;
    }

    public Sliced() {
        this.isSliced = true;
        this.originImage.sprite = this.slicedSprite;
    }

    public GetIngredient(): Ingredient {
        return this.ingredient;
    }

}