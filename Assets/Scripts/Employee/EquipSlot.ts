import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Image, Button, Toggle } from "UnityEngine.UI";
import { GameObject, Sprite, Color } from 'UnityEngine';
import DataManager, { Character } from '../DataManager';
import EmployeeManager from './EmployeeManager';
import CardData from './CardData';
import { TextMeshProUGUI } from 'TMPro';
import Mediator, { EventNames, IListener } from '../Notification/Mediator';
import SoundManager from '../SoundManager';

export default class EquipSlot extends ZepetoScriptBehaviour {

    @SerializeField() private lockedImage: Image;

    // Chacacter Slot
    @SerializeField() private characterSlotButton: Button;
    @SerializeField() private characterImage: Image;

    // SelectSection Slot
    @SerializeField() private selectedSectionImage: Image;
    @SerializeField() private selectSectionOpenToggle: Toggle;
    @SerializeField() private sectionButtons: Button[];

    // Slot Info
    @SerializeField() private infoText: TextMeshProUGUI;
    @SerializeField() private lockColor: Color;
    @SerializeField() private emptyColor: Color;
    @SerializeField() private selectColor: Color;
    @SerializeField() private completeColor: Color;

    private slotIndex: number;
    private isEquip: boolean = false;
    private isSelectSection: boolean = false;
    private isLocked: boolean = true;
    private equippedCardData: CardData;

    Start(){
        this.characterSlotButton.onClick.AddListener(() => {
            this.UnEquipCard();
            SoundManager.GetInstance().OnPlaySFX(SoundManager.GetInstance().keyBtnEquip);
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
                SoundManager.GetInstance().OnPlaySFX(SoundManager.GetInstance().keyBtnEquip);
            });
        }
        this.InitSlot();
        //this.Lock();
    }

    public InitSlot() {
        this.equippedCardData = null;
        this.selectedSectionImage.color = new Color(1, 1, 1, 0);
        this.DisableSelectSectionPanel();
        this.selectSectionOpenToggle.interactable = false;
        this.characterImage.color = new Color(1, 1, 1, 0);
        this.isEquip = false;
        this.infoText.text = "Empty";
        this.infoText.color = this.emptyColor;
        EmployeeManager.GetInstance().UnregisterCard(this.slotIndex);
    }

    private Lock(){
        this.lockedImage.gameObject.SetActive(true);
        this.infoText.text = "Locked";
        this.infoText.color = this.lockColor;
    }

    public Unlock(){
        this.lockedImage.gameObject.SetActive(false);
        this.infoText.text = "Empty";
        this.infoText.color = this.emptyColor;
        this.isLocked = false;
    }

    private SelectSection(sprite : Sprite, sectionIndex: number){
        EmployeeManager.GetInstance().RegisterCardBySlotIndex(this.slotIndex, this.equippedCardData, sectionIndex);
        console.log("SelectSection: " +   this.slotIndex);
        this.selectedSectionImage.sprite = sprite;
        this.selectedSectionImage.color = new Color(1, 1, 1, 1);
        this.infoText.text = "Complete";
        this.infoText.color = this.completeColor;
        this.isSelectSection = true;
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
        this.infoText.text = "Select Task";
        this.infoText.color = this.selectColor;
        this.isSelectSection = false;
        DataManager.GetInstance().UseCard(this.equippedCardData.GetCardId(), 1);
    }

    public UnEquipCard(){
        if(!this.equippedCardData) return;
        DataManager.GetInstance().AddCard(this.equippedCardData.GetCardId());
        this.equippedCardData = null;
        this.selectedSectionImage.color = new Color(1,1,1,0);
        this.DisableSelectSectionPanel();
        this.selectSectionOpenToggle.interactable = false;
        this.characterImage.color = new Color(1, 1, 1, 0);
        this.isEquip = false;
        EmployeeManager.GetInstance().UnregisterCard(this.slotIndex);
        this.infoText.text = "Empty";
        this.infoText.color = this.emptyColor;
        this.isSelectSection = false;
        Mediator.GetInstance().Notify(this, EventNames.InventoryUpdated, null);
    }

    public GetSelectSectionOpenToggle(): Toggle {
        return this.selectSectionOpenToggle;
    }

    public IsEquip(): boolean{
        return this.isEquip || this.isLocked;
    }
    public IsSelected(): boolean{
        return this.isEquip && this.isSelectSection;
    }
    public IsLocked(): boolean{
        return this.isLocked;
    }
    public getEquippedCardData(): CardData {
        return this.equippedCardData;
    }

    private OnDisable(){
        this.DisableSelectSectionPanel();
    }
    
}