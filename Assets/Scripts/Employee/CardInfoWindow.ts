import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Sprite, Debug } from 'UnityEngine'
import { Image, Button, Slider } from "UnityEngine.UI";
import DataManager from '../DataManager';
import CardData from './CardData';
import { TextMeshProUGUI } from 'TMPro';

export default class CardInfoWindow extends ZepetoScriptBehaviour {
    private cardData: CardData;
    @SerializeField() private characterImage: Image;
    @SerializeField() private gradeImage: Image;
    @SerializeField() private cardBackgroundImage: Image;
    @SerializeField() private dispenserProficiencySlider: Slider;
    @SerializeField() private fryerProficiencySlider: Slider;
    @SerializeField() private grillProficiencySlider: Slider;
    @SerializeField() private prepProficiencySlider: Slider;
    @SerializeField() private nameText: TextMeshProUGUI;   // 다음 보상 수령까지 남은 시간을 표기하는 텍스트

    public InitCardInfoWindow(){
        this.characterImage.enabled = false;
        this.gradeImage.enabled = false;
        this.cardBackgroundImage.enabled = false;
        this.dispenserProficiencySlider.value = 0;
        this.fryerProficiencySlider.value = 0;
        this.grillProficiencySlider.value = 0;
        this.prepProficiencySlider.value = 0;
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
        this.fryerProficiencySlider.value = cardData.GetFrierProficiency();
        this.grillProficiencySlider.value = cardData.GetGrillProficiency();
        this.prepProficiencySlider.value = cardData.GetSliceProficiency();
        this.nameText.text = cardData.GetCharacterName();
    }

    public GetCardId(): string {
        return this.cardData.GetCardId();
    }
}