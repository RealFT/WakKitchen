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

export default class CardInventory extends ZepetoScriptBehaviour {
    
    @SerializeField() private equipBtn: Button;
    @SerializeField() private upgradeBtn: Button;
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
    }
    
    private OnEnable(){
        this.RefreshInventoryUI();
        //this.RefreshCardInfo();
    }

    private Init(){
        this.equipSlotController = this.equipSlotControllerObj.GetComponent<EquipSlotController>();
        this.cardInfoWindow = this.cardInfoWindowObj.GetComponent<CardInfoWindow>();
        this.toggleGroup = this.contentParent.GetComponent<ToggleGroup>();

        this.equipBtn.onClick.AddListener(()=> this.OnClickEquipCard());
        this.upgradeBtn.onClick.AddListener(()=> this.OnClickUpgradeCard());

        this.cardInfoWindow.InitCardInfoWindow();
    }
    
    private RefreshInventoryUI(): void {
        const existingIds: string[] = [];
        const inventoryCache = DataManager.GetInstance().GetInventoryCache();
        console.log(inventoryCache);
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
        console.log("OnClickEquipCard: " + this.toggleGroup.GetFirstActiveToggle());
        console.log("OnClickEquipCard: " + this.toggleGroup.GetFirstActiveToggle());

        if (card === null){
            console.warn("no have card data");
            return;
        }
        this.equipSlotController.EquipCharacter(card);
        console.log("OnClickEquipCard: " + card.GetCardId());
        this.RefreshCardInfo();
    }

    private OnClickUpgradeCard(){
        const cardSlot = this.toggleGroup.GetFirstActiveToggle()?.GetComponent<CardSlot>();
        if(!cardSlot || cardSlot.GetCardQuantity() < 10){
            console.warn("not enough cards");
            return;
        }
        const card = cardSlot.GetCardData();
        if (card === null){
            console.warn("no have card data");
            return;
        }
        const grade = card.GetGrade();
        console.log(grade);
        if(grade == "s"){
            console.warn("already fully upgraded");
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
        this.RefreshInventoryUI();
    }
}