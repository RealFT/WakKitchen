import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {Button, Text} from 'UnityEngine.UI'
import {GameObject, Object, WaitUntil, WaitForSeconds} from 'UnityEngine'
import {ProductRecord, ProductService, ProductType, PurchaseType} from "ZEPETO.Product";
import {BalanceListResponse, CurrencyService, CurrencyError} from "ZEPETO.Currency";
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {Room, RoomData} from "ZEPETO.Multiplay";
import UIBallances, {BalanceSync, Currency, InventoryAction, InventorySync} from "./Shop/UIBalances";

export default class ItemManager extends ZepetoScriptBehaviour {
    // 싱글톤 패턴
    private static Instance: ItemManager;
    public static GetInstance(): ItemManager {

        if (!ItemManager.Instance) {
            //Debug.LogError("ItemManager");

            var _obj = GameObject.Find("ItemManager");
            if (!_obj) {
                _obj = new GameObject("ItemManager");
                _obj.AddComponent<ItemManager>();
            }
            ItemManager.Instance = _obj.GetComponent<ItemManager>();
            GameObject.DontDestroyOnLoad(_obj);
        }
        return ItemManager.Instance;
    }

    @SerializeField() private possessionMoneyTxt : Text;
    @SerializeField() private informationPref: GameObject;

    private _itemsCache: ProductRecord[] = [];
    private _multiplay: ZepetoWorldMultiplay;
    private _room : Room;

    Awake() {
        if (this != ItemManager.GetInstance()) GameObject.Destroy(this.gameObject);
    }

    Start() {    
        this.RefreshAllBalanceUI();
        //this.RefreshStageUI();
        this._multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();

        this._multiplay.RoomJoined += (room: Room) => {
            this._room = room;
            this.InitMessageHandler();
        }
    }

    private InitMessageHandler() {
        // log message handler
        this._room.AddMessageHandler<BalanceSync>("SyncBalances", (message) => {
            this.OpenInformation(`${message.currencyId} a Increase or decrease: ${message.quantity}`);
        });
        this._multiplay.Room.AddMessageHandler<InventorySync>("SyncInventories", (message) => {
            this.OpenInformation(`${message.productId} has been ${InventoryAction[message.inventoryAction]} in the inventory.`);
            // item use sample
            /*if(message.inventoryAction == InventoryAction.Used){
                if(message.productId == "potion1"){
                    console.log("potion use!");
                }
            }*/
        });
        
        this._room.AddMessageHandler<string>("DebitError", (message) => {
            this.OpenInformation(message);
        });
        ProductService.OnPurchaseCompleted.AddListener((product, response) => {
            this.OpenInformation(`${response.productId} Purchase Completed`);
        });
        ProductService.OnPurchaseFailed.AddListener((product, response) => {
            this.OpenInformation(response.message);
        });
    }


    private* LoadAllItems() {
        const request = ProductService.GetProductsAsync();
        yield new WaitUntil(() => request.keepWaiting == false);
        if (request.responseData.isSuccess) {
            this._itemsCache = [];
            request.responseData.products.forEach((pr) => {
                if (pr.ProductType == ProductType.Item) {
                    this._itemsCache.push(pr);
                }
                // if (pr.ProductType == ProductType.ItemPackage) {
                //     this._itemsPackageCache.push(pr);
                // }
            });

            if (this._itemsCache.length == 0) {
                console.warn("no Item information");
                return;
            }
        }
        else{
            console.warn("Product Load Failed");
        }
    }
    
    private RefreshAllBalanceUI(){
        this.StartCoroutine(this.RefreshBalanceUI());
    }
    
    private *RefreshBalanceUI(){
        const request = CurrencyService.GetUserCurrencyBalancesAsync();
        yield new WaitUntil(()=>request.keepWaiting == false);
        if(request.responseData.isSuccess) {
            this.possessionMoneyTxt.text = request.responseData.currencies?.ContainsKey(Currency.wak) ? request.responseData.currencies?.get_Item(Currency.wak).toString() :"0";
        }
    }

    private OpenInformation(message:string){
        //const inforObj = GameObject.Instantiate(this.informationPref,this.transform.parent) as GameObject;
        //inforObj.GetComponentInChildren<Text>().text = message;
    }
    
    public OnClickGainBalance(currencyId: string, quantity: number) {
        const data = new RoomData();
        data.Add("currencyId", currencyId);
        data.Add("quantity", quantity);
        this._multiplay.Room?.Send("onCredit", data.GetObject());
        console.warn("OnClickGainBalance");
    }

    public OnClickUseBalance(currencyId: string, quantity: number) {
        const data = new RoomData();
        data.Add("currencyId", currencyId);
        data.Add("quantity", quantity);
        this._multiplay.Room?.Send("onDebit", data.GetObject());
        console.warn("OnClickUseBalance");
    }

    // an immediate purchase
    public* OnClickPurchaseItemImmediately(productId: string) {
        const request = ProductService.PurchaseProductAsync(productId);
        yield new WaitUntil(() => request.keepWaiting == false);
        if (request.responseData.isSuccess) {
            // is purchase success
        } else {
            // is purchase fail
        }
    }

    private * BtnInterval(btn:Button){
        btn.interactable = false;
        yield new WaitForSeconds(0.2);

        btn.interactable = true;
    }

}