import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {Text, Button, InputField, Slider} from 'UnityEngine.UI'
import {Object, WaitForSeconds, WaitUntil} from 'UnityEngine'
import {InventoryService} from "ZEPETO.Inventory";
import {BalanceListResponse, CurrencyService, CurrencyError} from "ZEPETO.Currency";
import {ProductRecord, ProductService} from "ZEPETO.Product";
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {RoomData, Room} from "ZEPETO.Multiplay";

export default class UIBalances extends ZepetoScriptBehaviour {
    @SerializeField() private possessionMoneyTxt : Text;
    // @SerializeField() private possessionStageTxt : Text;

    private _multiplay : ZepetoWorldMultiplay;
    private _room : Room
    // private _myStage:number = 1;    

    private Start() {
        this.RefreshAllBalanceUI();
        //this.RefreshStageUI();
        this._multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();

        this._multiplay.RoomJoined += (room: Room) => {
            this._room = room;
            this.InitMessageHandler();
        }
    }
    
    // Update(){
    //     this.RefreshAllBalanceUI();
    // }

    private InitMessageHandler() {
        this._room.AddMessageHandler<BalanceSync>("SyncBalances", (message) => {
            this.RefreshAllBalanceUI();
        });
        ProductService.OnPurchaseCompleted.AddListener((product, response) => {
            this.RefreshAllBalanceUI();
        });
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
    
    // public IncreaseExp(quantity:number){
    //     this._myExp += quantity;
    //     if(this._myExp >= this._amountExp){
    //         this._myStage++;
    //         this._myExp -= this._amountExp;
    //         this.LevelUpReward();
    //     }
    //     this.RefreshStageUI();
    // }
    
    // private RefreshStageUI(){
    //     this.possessionStageTxt.text = this._myStage.toString();
    // }
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
