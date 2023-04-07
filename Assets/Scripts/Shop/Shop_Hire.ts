import { Object, GameObject, Quaternion, RectTransform, Vector2, Sprite, Debug, Random } from 'UnityEngine'
import { HorizontalLayoutGroup,Button } from "UnityEngine.UI";
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ProductRecord } from 'ZEPETO.Product';
import ItemManager from '../ItemManager';
import Card from '../Employee/Card';
import DataManager from '../DataManager';
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {Room, RoomData} from "ZEPETO.Multiplay";

export default class Shop_Hire extends ZepetoScriptBehaviour{

    @SerializeField() private buyButton: Button;
    @SerializeField() private resultPanel: GameObject;
    @SerializeField() private cardObj: GameObject;
    @SerializeField() private card: Card;
    private _multiplay : ZepetoWorldMultiplay;
    private _room : Room;
    Start() {
        this.card = this.cardObj.GetComponent<Card>();
        this.buyButton.onClick.AddListener(()=>{
            this.PurchaceRandomCard();
        });
        this._multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
        this._multiplay.RoomJoined += (room: Room) => {
            this._room = room;
            this.InitMessageHandler();
        }
    }

    private InitMessageHandler(){
        // ProductService.OnPurchaseCompleted.AddListener((product, response) => {
        //     this.StartCoroutine(this.RefreshInventoryUI());
        //     this.StartCoroutine(this.RefreshBalanceUI());
        // });
        // this._room.AddMessageHandler<InventorySync>("SyncInventories", (message) => {
        //     this.StartCoroutine(this.RefreshInventoryUI());
        // });
        // this._room.AddMessageHandler<BalanceSync>("SyncBalances", (message) => {
        //     this.StartCoroutine(this.RefreshBalanceUI());
        // });
        // this.useBtn.onClick.AddListener(()=> this.OnClickUseInventoryItem());
    }

    public InitHireShop(){

    }

    private OnClickPurchaseCardPack(){
        // const toggleGroup = this.contentParent.GetComponent<ToggleGroup>();
        // const item = toggleGroup.GetFirstActiveToggle()?.GetComponent<ITM_Inventory>().itemRecord;
        
        // if(item == null){
        //     console.warn("no have item data");
        //     return;
        // }
        // if(this._multiplay.Room == null){
        //     console.warn("server disconnect");
        //     return;
        // }

        // const data = new RoomData();
        // data.Add("key", item.productId);
        // data.Add("value", 1);
        // this._multiplay.Room?.Send("onSetStorage", data.GetObject());
    }

    private PurchaceRandomCard(){
        var cardId = ItemManager.GetInstance().GetRandomCardId();
        const cardIds = [];
        if (!cardId) return; 
        console.log(cardId);
        var cardProduct = ItemManager.GetInstance().GetProduct(cardId);
        //ItemManager.GetInstance().PurchaseItem(cardId);
        cardIds.push(cardId);
        // cardProductId: card_character_grade
        this.ShowPurchaseResult(cardId);
    }

    private PurchaceCardPakage(){
        var cardId = ItemManager.GetInstance().GetRandomCardId();
        const cardIds = [];
        if (!cardId) return; 
        console.log(cardId);
        var cardProduct = ItemManager.GetInstance().GetProduct(cardId);
        //ItemManager.GetInstance().PurchaseItem(cardId);
        cardIds.push(cardId);
        // cardProductId: card_character_grade
        this.ShowPurchaseResult(cardId);
    }

    private ShowPurchaseResult(cardId: string) {
        const match = cardId.split('_');
        const characterName = match[1];
        const grade = match[2];
        this.card.SetCard(cardId, grade, DataManager.GetInstance().GetCharacterSpriteByName(characterName));
        this.resultPanel.SetActive(true);
    }

    private SetResultCard(cardId: string){
        const match = cardId.split('_');
        const characterName = match[1];
        const grade = match[2];
        this.card.SetCard(cardId, grade, DataManager.GetInstance().GetCharacterSpriteByName(characterName));
    }
}