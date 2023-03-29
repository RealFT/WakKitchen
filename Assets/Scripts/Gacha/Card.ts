import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Sprite, Debug } from 'UnityEngine'
import { Image, Button, Slider } from "UnityEngine.UI";
export default class Card extends ZepetoScriptBehaviour {
    private productId: string;
    private grade: string;
    // private dispenserProficiencySlider: Slider;
    // private frierProficiencySlider: Slider;
    // private grillProficiencySlider: Slider;
    // private sliceProficiencySlider: Slider;

    @SerializeField() private characterImage: Image;

    public SetCard(productId: string, grade: string, characterSprite: Sprite): void {
        this.productId = productId;
        this.grade = grade;
        this.characterImage.sprite = characterSprite;
    }
    
    // public SetCard2(productId: string, grade: string, characterSprite: Sprite, 
    //     dispenserProficiency: number, frierProficiency: number, grillProficiency: number, sliceProficiency: number): void {
    //     this.productId = productId;
    //     this.grade = grade;
    //     this.characterImage.sprite = characterSprite;
    //     this.dispenserProficiencySlider.value = dispenserProficiency;
    //     this.frierProficiencySlider.value = frierProficiency;
    //     this.grillProficiencySlider.value = grillProficiency;
    //     this.sliceProficiencySlider.value = sliceProficiency;
    // }

    public GetCardId(): string {
        return this.productId;
    }

    public GetGrade(): string {
        return this.grade;
    }
}