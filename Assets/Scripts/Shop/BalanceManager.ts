import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {Text, Button, InputField, Slider} from 'UnityEngine.UI'
import {Object, GameObject, WaitUntil} from 'UnityEngine'
import {InventoryService} from "ZEPETO.Inventory";
import {BalanceListResponse, CurrencyService, CurrencyError} from "ZEPETO.Currency";
import {ProductRecord, ProductService} from "ZEPETO.Product";
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {RoomData, Room} from "ZEPETO.Multiplay";

export default class BalanceManager extends ZepetoScriptBehaviour {
    // 싱글톤 패턴
    private static Instance: BalanceManager;
    public static GetInstance(): BalanceManager {

        if (!BalanceManager.Instance) {
            //Debug.LogError("BalanceManager");

            var _obj = GameObject.Find("Managers");
            if (!_obj) {
                _obj = new GameObject("Managers");
                _obj.AddComponent<BalanceManager>();
            }
            BalanceManager.Instance = _obj.GetComponent<BalanceManager>();
            GameObject.DontDestroyOnLoad(_obj);
        }
        return BalanceManager.Instance;
    }
    Awake() {
        if (this != BalanceManager.GetInstance()) GameObject.Destroy(this.gameObject);
    }

    @SerializeField() private possessionMoneyTxt : Text;

    private _multiplay : ZepetoWorldMultiplay;
    private _room : Room

    private Start() {
        this.RefreshAllBalanceUI();
        this._multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();

        this._multiplay.RoomJoined += (room: Room) => {
            this._room = room;
            this.InitMessageHandler();
        }
    }

    private InitMessageHandler() {
        this._room.AddMessageHandler<BalanceSync>("SyncBalances", (message) => {
            this.RefreshAllBalanceUI();
        });
        ProductService.OnPurchaseCompleted.AddListener((product, response) => {
            this.RefreshAllBalanceUI();
        });
    }
    
    public RefreshAllBalanceUI(){
        this.StartCoroutine(this.RefreshBalanceUI());
    }
    
    private *RefreshBalanceUI(){
        const request = CurrencyService.GetUserCurrencyBalancesAsync();
        yield new WaitUntil(()=>request.keepWaiting == false);
        if(request.responseData.isSuccess) {
            this.possessionMoneyTxt.text = request.responseData.currencies?.ContainsKey(Currency.wak) ? request.responseData.currencies?.get_Item(Currency.wak).toString() :"0";
        }
    }
    
    public GainBalance(currencyId: string, quantity: number) {
        const data = new RoomData();
        data.Add("currencyId", currencyId);
        data.Add("quantity", quantity);
        this._multiplay.Room?.Send("onCredit", data.GetObject());
        console.warn("GainBalance");
    }

    public UseBalance(currencyId: string, quantity: number) {
        const data = new RoomData();
        data.Add("currencyId", currencyId);
        data.Add("quantity", quantity);
        this._multiplay.Room?.Send("onDebit", data.GetObject());
        console.warn("UseBalance");
    }

}

export interface BalanceSync {
    currencyId: string,
    quantity: number,
}

export interface InventorySync {
    productId: string,
    inventoryAction: InventoryAction,
}

export enum InventoryAction{
    Removed = -1,
    Used,
    Added,
}

export enum Currency{
    wak = "wak",
}

export enum ItemType{
    food = "food",
    upgrade = "upgrade",
    card = "card",
}
