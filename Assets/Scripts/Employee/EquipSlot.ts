import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Image, Button, Toggle } from "UnityEngine.UI";
import { GameObject, Sprite, Color } from 'UnityEngine';
import DataManager, { Character } from '../DataManager';
import EmployeeManager from './EmployeeManager';
import CardData from './CardData';

export default class EquipSlot extends ZepetoScriptBehaviour {

    // Chacacter Slot
    @SerializeField() private characterSlotButton: Button;
    @SerializeField() private characterImage: Image;

    // SelectSection Slot
    @SerializeField() private selectedSectionImage: Image;
    @SerializeField() private selectSectionOpenToggle: Toggle;
    @SerializeField() private sectionButtons: Button[];

    private slotIndex: number;
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
                this.SelectSection(sprite, i);
                this.DisableSelectSectionPanel();
            });
        }
        this.InitSlot();
    }

    public InitSlot() {
        this.equippedCardData = null;
        this.selectedSectionImage.color = new Color(1, 1, 1, 0);
        this.DisableSelectSectionPanel();
        this.selectSectionOpenToggle.interactable = false;
        this.characterImage.color = new Color(1, 1, 1, 0);
        this.isEquip = false;
        EmployeeManager.GetInstance().UnregisterCard(this.slotIndex);
    }

    private SelectSection(sprite : Sprite, sectionIndex: number){
        EmployeeManager.GetInstance().RegisterCardBySlotIndex(this.slotIndex, this.equippedCardData, sectionIndex);
        console.log("SelectSection: "+this.slotIndex);
        this.selectedSectionImage.sprite = sprite;
        this.selectedSectionImage.color = new Color(1, 1, 1, 1);
    }

    public DisableSelectSectionPanel(){
        this.selectSectionOpenToggle.isOn = false;
    }

    public EquipCard(cardData : CardData, slotIndex: number){
        this.equippedCardData = cardData;
        this.slotIndex = slotIndex;
        this.selectedSectionImage.color = new Color(1, 1, 1, 0);
        this.DisableSelectSectionPanel();
        this.selectSectionOpenToggle.interactable = true;
        this.characterSlotButton.interactable = true;
        this.characterImage.sprite = DataManager.GetInstance().GetCharacterIcon(cardData.GetCharacterIndex());
        this.characterImage.color = new Color(1, 1, 1, 1);
        this.isEquip = true;
    }

    public UnEquipCard(){
        if(!this.equippedCardData) return;
        this.equippedCardData = null;
        this.selectedSectionImage.color = new Color(1,1,1,0);
        this.DisableSelectSectionPanel();
        this.selectSectionOpenToggle.interactable = false;
        this.characterImage.color = new Color(1, 1, 1, 0);
        this.isEquip = false;
        EmployeeManager.GetInstance().UnregisterCard(this.slotIndex);
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