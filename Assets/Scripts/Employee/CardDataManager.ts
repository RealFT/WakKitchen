import { Object, GameObject, PlayerPrefs } from 'UnityEngine'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from "ZEPETO.World";
import { Room, RoomData } from "ZEPETO.Multiplay";
import DataManager from '../DataManager';
import CardData from './CardData';

export default class CardDataManager extends ZepetoScriptBehaviour {
    private static Instance: CardDataManager;
    public static GetInstance(): CardDataManager {

        if (!CardDataManager.Instance) {
            //Debug.LogError("BalanceManager");

            var _obj = GameObject.Find("CardDataManager");
            if (!_obj) {
                _obj = new GameObject("CardDataManager");
                _obj.AddComponent<CardDataManager>();
            }
            CardDataManager.Instance = _obj.GetComponent<CardDataManager>();
            GameObject.DontDestroyOnLoad(_obj);
        }
        return CardDataManager.Instance;
    }
    Awake() {
        if (this != CardDataManager.GetInstance()) GameObject.Destroy(this.gameObject);
    }

    private _multiplay: ZepetoWorldMultiplay;
    private _room: Room;

    private Start() {
        this._multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();

        this._multiplay.RoomJoined += (room: Room) => {
            this._room = room;
            this.InitMessageHandler();
        }
    }
    
    private InitMessageHandler() {
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
    
    private OnClickPurchaseCardPack() {
        if(this._multiplay.Room == null){
            console.warn("server disconnect");
            return;
        }

        const data = new RoomData();
        //data.Add("key", item.productId);
        data.Add("value", 1);
        this._multiplay.Room?.Send("onSetStorage", data.GetObject());
    }

    public AddCardToStorage(id: number) {
        if (this._multiplay.Room == null) {
            console.warn("server disconnect");
            return;
        }

        const data = new RoomData();
        data.Add("key", id);
        this._multiplay.Room?.Send("onGetStorage", data.GetObject());
        data.Add("value", 1);
        this._multiplay.Room?.Send("onSetStorage", data.GetObject());
    }

    // private LoadOwnedCardDatas(cardDatas: CardData[]) {
    //     if (this._multiplay.Room == null) {
    //         console.warn("server disconnect");
    //         return;
    //     }
        
    //     for (const cardData of cardDatas){
    //         const data = new RoomData();
    //         data.Add("key", cardData.GetCardId());
    //         this._multiplay.Room?.Send("onGetStorage", data.GetObject());
    //     }
    // }

}