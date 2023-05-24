import {ZepetoScriptBehaviour} from 'ZEPETO.Script'
import { Button, GridLayoutGroup, Toggle, ToggleGroup } from 'UnityEngine.UI'
import { GameObject, Object, RectTransform, Transform, Vector2 } from 'UnityEngine'
import {CurrencyService} from "ZEPETO.Currency";
import {ProductRecord, ProductService, PurchaseType} from "ZEPETO.Product";
import {BalanceSync, InventorySync, Currency} from "../Shop/BalanceManager";
import CardSlot from './CardSlot';
import DataManager from '../DataManager';
import EquipSlotController from './EquipSlotController';
import CardInfoWindow from './CardInfoWindow';
import UIManager from '../UIManager';
import SoundManager from '../SoundManager';
import Mediator, { EventNames, IListener } from '../Notification/Mediator';
import HelpManager from '../Help/HelpManager';

export default class CardInventory extends ZepetoScriptBehaviour implements IListener {

    @SerializeField() private inventoryPanel: GameObject;
    @SerializeField() private equipBtn: Button;
    @SerializeField() private upgradeBtn: Button;
    @SerializeField() private closeBtn: Button;
    @SerializeField() private helpBtn: Button;
    @SerializeField() private contentParent: Transform;
    @SerializeField() private equipSlotControllerObj: GameObject;
    @SerializeField() private cardInfoWindowObj: GameObject;
    @SerializeField() private cardSlotPrefab: GameObject;
    private equipSlotController: EquipSlotController;
    private cardInfoWindow: CardInfoWindow;
    private cardSlots: CardSlot[] = [];
    private toggleGroup: ToggleGroup;

    Start() {
        this.Init();
        this.CreateInventory();
        Mediator.GetInstance().RegisterListener(this);
    }

    private OnDestroy() {
        Mediator.GetInstance().UnregisterListener(this);
    }
    
    private OnEnable(){
        this.RefreshInventoryUI();
        //this.RefreshCardInfo();
    }

    public OnNotify(sender: any, eventName: string, eventData: any): void {
        if (!this.gameObject.activeSelf) return;
        if (eventName == EventNames.InventoryUpdated) {
            this.RefreshInventoryUI();
        }
    }

    private Init(){
        this.equipSlotController = this.equipSlotControllerObj.GetComponent<EquipSlotController>();
        this.cardInfoWindow = this.cardInfoWindowObj.GetComponent<CardInfoWindow>();
        this.toggleGroup = this.contentParent.GetComponent<ToggleGroup>();

        this.equipBtn.onClick.AddListener(()=> this.OnClickEquipCard());
        this.upgradeBtn.onClick.AddListener(()=> this.OnClickUpgradeCard());
        this.closeBtn.onClick.AddListener(()=>{
            if(!this.equipSlotController.CheckSlots()){
                SoundManager.GetInstance().OnPlayButtonSFX("Tresh");
                UIManager.GetInstance().OpenInformation(DataManager.GetInstance().GetCurrentLanguageData("info_require_section"));
            }
            else{
                SoundManager.GetInstance().OnPlayButtonClick();
                this.inventoryPanel.SetActive(false);
            }
        });
        this.helpBtn.onClick.AddListener(()=> HelpManager.GetInstance().OpenHelpSection("employee"));

        this.cardInfoWindow.InitCardInfoWindow();
    }
    
    private RefreshInventoryUI(): void {
        const existingIds: string[] = [];
        const inventoryCache = DataManager.GetInstance().GetInventoryCache();

        // Update existing slots
        this.cardSlots.forEach((cardSlot) => {
            const cardId = cardSlot.GetCardData()?.GetCardId();
            if(cardId) {
                const quantity = inventoryCache.get(cardId) || 0;
                if (quantity > 0) {
                    cardSlot.RefreshItem(quantity);
                    existingIds.push(cardId);
                } else {
                    cardSlot.ClearSlot();
                    cardSlot.gameObject.SetActive(false);
                }
            }
            else {
                cardSlot.gameObject.SetActive(false);
            }
        });

        // Add new slots for cards that were not already displayed
        for (const [id, quantity] of inventoryCache) {
            if (!existingIds.includes(id) && quantity > 0) {
                this.CreateSlot(id, quantity);
            }
        }

        // Sort existing slots by grade
        this.cardSlots.sort((a, b) => {
            const cardGradeA = a.GetCardData()?.GetGrade();
            const cardGradeB = b.GetCardData()?.GetGrade();
            return this.CompareGrades(cardGradeA, cardGradeB);
        });

        // Update the size of the content to fit the number of slots
        this.UpdateContentSize();
    }
    
    private CompareGrades(gradeA: string | undefined, gradeB: string | undefined): number {
        // Define grade order (from high to low)
        const gradeOrder = { s: 4, a: 3, b: 2, c: 1, d: 0 };

        // Compare grades using the grade order
        if (gradeA && gradeB) {
            const orderA = gradeOrder[gradeA.toLowerCase()] || 0;
            const orderB = gradeOrder[gradeB.toLowerCase()] || 0;
            return orderB - orderA; // Sort in descending order
        }
        return 0;
    }
    private RefreshCardInfo(): void {
        console.warn("RefreshCardInfo");
        if(this.toggleGroup == null) this.toggleGroup = this.contentParent.GetComponent<ToggleGroup>();
        const card = this.toggleGroup.GetFirstActiveToggle()?.GetComponent<CardSlot>()?.GetCardData();
        if(card) this.cardInfoWindow.SetCardInfoWindow(card);
    }

    private CreateInventory(){
        this.cardSlots = [];
        const remains = this.contentParent.gameObject.GetComponentsInChildren<CardSlot>();
        remains.forEach((slot)=>{
            console.log(slot.gameObject);
            GameObject.Destroy(slot.gameObject);
        });

        /*Sort by Create Order (descending order)*/
        const inventoryCache = DataManager.GetInstance().GetInventoryCache();
        for (const [id, quantity] of inventoryCache) {
            if (quantity > 0)
                this.CreateSlot(id, quantity);
        }
        
        // Update the size of the content to fit the number of slots
        this.UpdateContentSize();
    }

    // Update the size of the content to fit the number of slots
    private UpdateContentSize(): void {
        const layoutGroup = this.contentParent.GetComponent<GridLayoutGroup>();
        const cellSize = layoutGroup.cellSize;
        const spacing = layoutGroup.spacing;
        const constraintCount = layoutGroup.constraintCount;
        const rowCount = Math.ceil(this.cardSlots.length / constraintCount);
    
        // Cast contentParent to RectTransform
        const contentRectTransform = this.contentParent.transform as RectTransform;
        const newContentSize = new Vector2(
            contentRectTransform.sizeDelta.x,
            (rowCount + 1) * (cellSize.y + spacing.y)
        );
        contentRectTransform.sizeDelta = newContentSize;
    }

    private CreateSlot(id: string, quantity: number) {
        let slot: CardSlot;
        const inactiveSlotIndex = this.cardSlots.findIndex(s => !s.gameObject.activeSelf);
        if (inactiveSlotIndex !== -1) { // reuse inactive slot
            slot = this.cardSlots[inactiveSlotIndex];
            slot.gameObject.SetActive(true);
        } else { // instantiate new slot
            const cardObj = Object.Instantiate(this.cardSlotPrefab, this.contentParent) as GameObject;
            slot = cardObj.GetComponent<CardSlot>();
            const toggle = cardObj.GetComponent<Toggle>();
            toggle.group = this.toggleGroup;
            toggle.onValueChanged.AddListener(() => {
                if (toggle.isOn) {
                  this.RefreshCardInfo();
                }
            });
            this.cardSlots.push(slot);
        }
    
        const cardData = DataManager.GetInstance().GetCardData(id);
        slot.SetSlot(cardData, quantity);
        //slot.IsOn(false);
    }

    private OnClickEquipCard(){
        const card = this.toggleGroup.GetFirstActiveToggle()?.GetComponent<CardSlot>().GetCardData();
        if (card == undefined){
            UIManager.GetInstance().OpenInformation("No card selected.");
            SoundManager.GetInstance().OnPlaySFX("Tresh");
            return;
        }
        else {
            SoundManager.GetInstance().OnPlaySFX(SoundManager.GetInstance().keyBtnEquip);
            this.equipSlotController.EquipCharacter(card);
            this.RefreshInventoryUI();
        }
    }

    private OnClickUpgradeCard(){
        const cardSlot = this.toggleGroup.GetFirstActiveToggle()?.GetComponent<CardSlot>();
        if(!cardSlot || cardSlot.GetCardQuantity() < 10){
            UIManager.GetInstance().OpenInformation("Not enough cards to Upgrade");
            SoundManager.GetInstance().OnPlaySFX("Tresh");
            return;
        }
        const card = cardSlot.GetCardData();
        const grade = card.GetGrade();
        if(grade == "s"){
            UIManager.GetInstance().OpenInformation("Fully upgraded");
            SoundManager.GetInstance().OnPlaySFX("Tresh");
            return;
        }
        let upperGrade = "c";
        switch (grade) {
            case "d":
                upperGrade = "c";
                break;
            case "c":
                upperGrade = "b";
                break;
            case "b":
                upperGrade = "a";
                break;
            case "a":
                upperGrade = "s";
                break;
        }
        const resultCard = DataManager.GetInstance().GetRandomCardByGrade(upperGrade);
        DataManager.GetInstance().UseCard(card.GetCardId(), 10);
        DataManager.GetInstance().AddCard(resultCard.GetCardId());
        SoundManager.GetInstance().OnPlaySFX("Card_Upgrade");
        this.RefreshInventoryUI();
    }
}