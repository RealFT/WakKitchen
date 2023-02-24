import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, InputField, Slider, Text, Image } from "UnityEngine.UI";
import { Ingredient } from './OrderManager';
import { Sprite } from 'UnityEngine';
export default class Slicable extends ZepetoScriptBehaviour {

    public originImage: Image;
    public slicedSprite: Sprite;
    public ingredient: Ingredient;
    private isSliced: boolean;


    public SetSlicable(origin: Sprite, sliced: Sprite, ingredient: Ingredient) {
        this.originImage.sprite = origin;
        this.slicedSprite = sliced;
        this.ingredient = ingredient;
        this.isSliced = false;
    }

    public Sliced() {
        this.isSliced = true;
    }

    public GetIngredient(): Ingredient {
        return this.ingredient;
    }

}