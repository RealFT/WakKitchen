import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, InputField, Slider, Text, Image } from "UnityEngine.UI";
import DataManager, { Ingredient } from './DataManager';
import { Sprite, WaitForSeconds } from 'UnityEngine';

export default class Slicable extends ZepetoScriptBehaviour {

    public originImage: Image;
    public slicedSprite: Sprite;
    public ingredient: Ingredient;
    private isSliced: boolean;
    private delay: number = 5;

    private OnEnable() {
        this.StartCoroutine(this.Exit());
    }

    private *Exit() {
        yield new WaitForSeconds(this.delay);
        this.gameObject.SetActive(false);
    }

    public SetSlicable(origin: Sprite, ingredient: Ingredient) {
        this.originImage.sprite = origin;
        this.slicedSprite = DataManager.GetInstance().getIngredientSprite(ingredient);
        this.ingredient = ingredient;
        this.isSliced = false;
    }

    public Sliced() {
        this.isSliced = true;
        this.originImage.sprite = this.slicedSprite;
    }
    public GetSlicableImage(): Image {
        return this.originImage;
    }
    public GetIngredient(): Ingredient {
        return this.ingredient;
    }

}