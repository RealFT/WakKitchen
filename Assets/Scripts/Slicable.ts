import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, InputField, Slider, Text, Image } from "UnityEngine.UI";
import DataManager, { Ingredient } from './DataManager';
import { GameObject, Sprite, AudioSource, WaitForSeconds } from 'UnityEngine';
import SoundManager from './SoundManager';

export default class Slicable extends ZepetoScriptBehaviour {

    @SerializeField() private originImage: Image;
    @SerializeField() private slicedSprite: Sprite;
    @SerializeField() private slicedEffect: GameObject;
    @SerializeField() private ingredient: Ingredient;
    private slicedSFX: AudioSource;
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
        this.slicedEffect.SetActive(false);
    }

    public Sliced() {
        this.isSliced = true;
        this.originImage.sprite = this.slicedSprite;
        if(!this.slicedSFX) this.slicedSFX = this.slicedEffect.GetComponent<AudioSource>();
        this.slicedSFX.volume = SoundManager.GetInstance().SFXSoundVolume;
        this.slicedSFX.mute = SoundManager.GetInstance().SFXSoundMute;
        this.slicedEffect.SetActive(true);
    }
    public GetSlicableImage(): Image {
        return this.originImage;
    }
    public GetSlicedSprite(): Sprite {
        return this.slicedSprite;
    }
    public GetIngredient(): Ingredient {
        return this.ingredient;
    }

}