import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Image, Button, Toggle } from "UnityEngine.UI";
import { GameObject, Sprite, Color } from 'UnityEngine';
import DataManager from '../DataManager';
import CardData from './CardData';

export default class EquipSlot extends ZepetoScriptBehaviour {

    // Chacacter Slot
    @SerializeField() private characterSlotButton: Button;
    @SerializeField() private characterImage: Image;

    // SelectSection Slot
    @SerializeField() private selectedSectionImage: Image;
    @SerializeField() private selectSectionOpenToggle: Toggle;
    @SerializeField() private sectionButtons: Button[];

    private isEquip: boolean = false;
    private equippedCardData: CardData;

    Start(){
        this.characterSlotButton.onClick.AddListener(() => {
            this.UnEquipCard();
        });

        var sprites = DataManager.GetInstance().GetSectionSprites();
        for (let i = 0; i < this.sectionButtons.length; i++) {
            let button = this.sectionButtons[i];
            let sprite = sprites[i];
            let image = button.transform.GetChild(0).GetComponent<Image>();
            image.sprite = sprite;
            button.onClick.AddListener(() => {
                this.SelectSection(sprite);
                this.DisableSelectSectionPanel();
            });
        }
        this.InitSlot();
    }

    public InitSlot() {
        this.selectedSectionImage.color = new Color(1, 1, 1, 0);
        this.DisableSelectSectionPanel();
        //this.selectSectionOpenToggle.interactable = false;
    }

    private SelectSection(sprite : Sprite){
        this.selectedSectionImage.sprite = sprite;
        this.selectedSectionImage.color = new Color(1, 1, 1, 1);
    }

    public DisableSelectSectionPanel(){
        this.selectSectionOpenToggle.isOn = false;
    }

    public EquipCard(cardData : CardData){
        this.equippedCardData = cardData;
        this.selectedSectionImage.color = new Color(1, 1, 1, 0);
        this.DisableSelectSectionPanel();
        this.selectSectionOpenToggle.interactable = true;
        this.characterImage.sprite = DataManager.GetInstance().getCharacterSprite(cardData.GetCharacterIndex());
        this.characterImage.color = new Color(1, 1, 1, 1);
        this.isEquip = true;
    }

    public UnEquipCard(){
        this.equippedCardData = null;
        this.selectedSectionImage.color = new Color(1,1,1,0);
        this.DisableSelectSectionPanel();
        this.selectSectionOpenToggle.interactable = false;
        this.characterImage.color = new Color(1, 1, 1, 0);
        this.isEquip = false;
    }

    public GetSelectSectionOpenToggle(): Toggle {
        return this.selectSectionOpenToggle;
    }

    public IsEquip():boolean{
        return this.isEquip;
    }

    public getEquippedCardData(): CardData {
        return this.equippedCardData;
    }

    private OnDisable(){
        this.DisableSelectSectionPanel();
    }
    
}