import {ZepetoScriptBehaviour} from 'ZEPETO.Script'
import { Button, GridLayoutGroup, ToggleGroup } from 'UnityEngine.UI'
import { GameObject, Object, RectTransform, Transform, Vector2 } from 'UnityEngine'
import {CurrencyService} from "ZEPETO.Currency";
import {ProductRecord, ProductService, PurchaseType} from "ZEPETO.Product";
import {BalanceSync, InventorySync, Currency} from "../Shop/BalanceManager";
import CardSlot from './CardSlot';
import DataManager from '../DataManager';
import EquipSlotController from './EquipSlotController';

export default class CardInventory extends ZepetoScriptBehaviour {
    
    @SerializeField() private equipBtn: Button;
    @SerializeField() private upgradeBtn: Button;
    @SerializeField() private contentParent: Transform;
    @SerializeField() private equipSlotControllerObj: GameObject;
    @SerializeField() private cardSlotPrefab: GameObject;
    private cardSlots: CardSlot[] = [];
    private equipSlotController: EquipSlotController;

    private Start() {
        this.Init();
        const inventoryCache = DataManager.GetInstance().GetInventoryCache();
        this.CreateInventory(inventoryCache);
        this.equipSlotController = this.equipSlotControllerObj.GetComponent<EquipSlotController>();
    }
    
    private Init(){
        // ProductService.OnPurchaseCompleted.AddListener((product, response) => {
        //     this.RefreshInventoryUI()
        // });
        // this._room.AddMessageHandler<InventorySync>("SyncInventories", (message) => {
        //     this.RefreshInventoryUI()
        // });
        this.equipBtn.onClick.AddListener(()=> this.OnClickEquipCard());
    }
    
    private RefreshInventoryUI(): void {
        const existingIds: string[] = [];
        const inventoryCache = DataManager.GetInstance().GetInventoryCache();
        // Update existing slots
        this.cardSlots.forEach((cardSlot) => {
            const cardId = cardSlot.GetCardData().GetCardId();
            const quantity = inventoryCache.get(cardId) || 0;

            if (quantity > 0) {
                cardSlot.RefreshItem(quantity);
                existingIds.push(cardId);
            } else {
                cardSlot.ClearSlot();
                cardSlot.gameObject.SetActive(false);
            }
        });

        // Add new slots for cards that were not already displayed
        for (const [id, quantity] of inventoryCache) {
            if (!existingIds.includes(id)) {
                this.CreateSlot(id, quantity);
            }
        }
    }
    
    private CreateInventory(inventoryCache: Map<string, number>){
        this.contentParent.GetComponentsInChildren<CardSlot>().forEach((child)=>{
            GameObject.Destroy(child.gameObject);
        });

        /*Sort by Create Order (descending order)*/

        for (const [id, quantity] of inventoryCache) {
            //if (quantity > 0)
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
        const cardObj = Object.Instantiate(this.cardSlotPrefab, this.contentParent) as GameObject;
        const slot = cardObj.GetComponent<CardSlot>();
        const cardData = DataManager.GetInstance().GetCardData(id);

        slot.SetSlot(cardData, quantity);
        //slot.IsOn(false);
        this.cardSlots.push(slot);
    }

    private OnClickEquipCard(){
        const toggleGroup = this.contentParent.GetComponent<ToggleGroup>();
        const card = toggleGroup.GetFirstActiveToggle()?.GetComponent<CardSlot>().GetCardData();
        
        if (card == null){
            console.warn("no have card data");
            return;
        }
        this.equipSlotController.EquipCharacter(card);
        console.log("OnClickEquipCard: " + card.GetCardId());
    }
}