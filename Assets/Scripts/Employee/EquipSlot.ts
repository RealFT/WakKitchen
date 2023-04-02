import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Image, Button, Toggle } from "UnityEngine.UI";
import { GameObject, Sprite } from 'UnityEngine';
import DataManager from '../DataManager';
export default class EquipSlot extends ZepetoScriptBehaviour {

    // Chacacter Slot
    @SerializeField() private characterSlotButton: Button;
    @SerializeField() private characterImage: Image;
    @SerializeField() private defaultCharacterSlotSprite: Sprite;

    // SelectSection Slot
    @SerializeField() private selectedSectionImage: Image;
    @SerializeField() private defaultSelectedSectionSprite: Sprite;
    @SerializeField() private selectSectionOpenToggle: Toggle;
    @SerializeField() private selectSectionPanel: GameObject;
    @SerializeField() private sectionButtons: Button[];

    private isEquip: boolean;

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
        this.selectedSectionImage.sprite = this.defaultSelectedSectionSprite;
        this.DisableSelectSectionPanel();
        //this.selectSectionOpenToggle.interactable = false;
    }

    private SelectSection(sprite : Sprite){
        this.selectedSectionImage.sprite = sprite;
    }

    public DisableSelectSectionPanel(){
        this.selectSectionOpenToggle.isOn = false;
    }

    public EquipCard(characterSprite : Sprite){
        this.selectedSectionImage.sprite = this.defaultSelectedSectionSprite;
        this.DisableSelectSectionPanel();
        this.selectSectionOpenToggle.interactable = true;
        this.characterImage.sprite = characterSprite;
        this.isEquip = true;
    }

    public UnEquipCard(){
        this.selectedSectionImage.sprite = this.defaultSelectedSectionSprite;
        this.DisableSelectSectionPanel();
        this.selectSectionOpenToggle.interactable = false;
        this.characterImage.sprite = this.defaultCharacterSlotSprite;
        this.isEquip = false;
    }

    public GetSelectSectionOpenToggle(): Toggle {
        return this.selectSectionOpenToggle;
    }

    public IsEquip():boolean{
        return this.isEquip;
    }

    private OnDisable(){
        this.DisableSelectSectionPanel();
    }
}