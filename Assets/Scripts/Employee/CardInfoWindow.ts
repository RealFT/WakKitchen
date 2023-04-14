import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Sprite, Debug } from 'UnityEngine'
import { Image, Button, Slider } from "UnityEngine.UI";
import DataManager from '../DataManager';
import CardData from './CardData';

export default class CardInfoWindow extends ZepetoScriptBehaviour {
    private cardData: CardData;
    @SerializeField() private characterImage: Image;
    @SerializeField() private gradeImage: Image;
    @SerializeField() private cardBackgroundImage: Image;
    @SerializeField() private dispenserProficiencySlider: Slider;
    @SerializeField() private frierProficiencySlider: Slider;
    @SerializeField() private grillProficiencySlider: Slider;
    @SerializeField() private sliceProficiencySlider: Slider;

    public InitCardInfoWindow(){
        this.characterImage.enabled = false;
        this.gradeImage.enabled = false;
        this.cardBackgroundImage.enabled = false;
        this.dispenserProficiencySlider.value = 0;
        this.frierProficiencySlider.value = 0;
        this.grillProficiencySlider.value = 0;
        this.sliceProficiencySlider.value = 0;
    }

    public SetCardInfoWindow(cardData: CardData): void {
        this.cardData = cardData;
        this.characterImage.enabled = true;
        this.gradeImage.enabled = true;
        this.cardBackgroundImage.enabled = true;
        this.characterImage.sprite = DataManager.GetInstance().GetCharacterCardSprite(cardData.GetCharacterIndex());
        this.gradeImage.sprite = DataManager.GetInstance().GetGradeIconByGrade(cardData.GetGrade());
        this.cardBackgroundImage.sprite = DataManager.GetInstance().GetCardBackgroundSpriteByGrade(cardData.GetGrade());
        this.dispenserProficiencySlider.value = cardData.GetDispenserProficiency();
        this.frierProficiencySlider.value = cardData.GetFrierProficiency();
        this.grillProficiencySlider.value = cardData.GetGrillProficiency();
        this.sliceProficiencySlider.value = cardData.GetSliceProficiency();
    }

    public GetCardId(): string {
        return this.cardData.GetCardId();
    }
}