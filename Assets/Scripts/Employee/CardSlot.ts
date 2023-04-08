import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Image, Text, Toggle, ToggleGroup, Slider } from 'UnityEngine.UI'
import { GameObject } from 'UnityEngine'
import { InventoryRecord } from 'ZEPETO.Inventory';
import CardData from './CardData';
import DataManager from '../DataManager';

export default class CardSlot extends ZepetoScriptBehaviour {

    @SerializeField() private cardIcon: Image;
    @SerializeField() private gradeIcon: Image;
    @SerializeField() private quantityTxt: Text;
    @SerializeField() private quantitySlide: Slider;
    @SerializeField() private isOnUIObj: GameObject;
    private cardData: CardData;

    private Start() {
        this.GetComponent<Toggle>().group = this.transform.parent.GetComponent<ToggleGroup>();
    }

    public SetSlot(cardData: CardData, quantity: number = 0) {
        this.cardData = cardData;
        this.cardIcon.sprite = DataManager.GetInstance().GetCharacterIcon(cardData.GetCharacterIndex());
        this.cardIcon.color.a = 1;
        this.quantityTxt.text = quantity > 0 ? quantity.toString() : "";
    }

    public RefreshItem(quantity: number = 0){
        if (quantity > 0){
            this.quantityTxt.text = `${quantity} / 10`;
            this.quantitySlide.value = quantity / 10;
        }
        else
            this.ClearSlot();
    }
    
    // public IsOn(boolean:boolean){
    //     this.GetComponent<Toggle>().isOn = boolean;
    //     this.isOnUIObj.SetActive(boolean);
    // }

    public ClearSlot(){
        this.cardIcon.color.a = 0;
        this.cardIcon.sprite = null;
        this.cardData = null;
        this.quantityTxt.text = "0 / 0";
        this.quantitySlide.value = 0;
    }

    public GetCardData(): CardData{
        return this.cardData;
    }
}