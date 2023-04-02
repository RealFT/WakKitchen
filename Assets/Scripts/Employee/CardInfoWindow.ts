import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Sprite, Debug } from 'UnityEngine'
import { Image, Button, Slider } from "UnityEngine.UI";

export default class CardInfoWindow extends ZepetoScriptBehaviour {
    private productId: string;
    private grade: string;
    @SerializeField() private characterImage: Image;
    @SerializeField() private dispenserProficiencySlider: Slider;
    @SerializeField() private frierProficiencySlider: Slider;
    @SerializeField() private grillProficiencySlider: Slider;
    @SerializeField() private sliceProficiencySlider: Slider;

    public SetCardInfoWindow(productId: string, grade: string, characterSprite: Sprite, 
        dispenserProficiency: number, frierProficiency: number, grillProficiency: number, sliceProficiency: number): void {
        this.productId = productId;
        this.grade = grade;
        this.characterImage.sprite = characterSprite;
        this.dispenserProficiencySlider.value = dispenserProficiency;
        this.frierProficiencySlider.value = frierProficiency;
        this.grillProficiencySlider.value = grillProficiency;
        this.sliceProficiencySlider.value = sliceProficiency;
    }

    public GetCardId(): string {
        return this.productId;
    }
}