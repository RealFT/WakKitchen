// import {ZepetoScriptBehaviour} from 'ZEPETO.Script'
// import {Button, Text} from 'UnityEngine.UI'
// import {GameObject, Object, WaitUntil, WaitForSeconds} from 'UnityEngine'
// import {ProductRecord, ProductService, ProductType, PurchaseType} from "ZEPETO.Product";
// import {ZepetoWorldMultiplay} from "ZEPETO.World";
// import {Room, RoomData} from "ZEPETO.Multiplay";
// import UIBallances, {BalanceSync, Currency, InventoryAction, InventorySync} from "./BalanceManager";
// import ItemManager from '../ItemManager';

// export default class UIFoodShop extends ZepetoScriptBehaviour {
//     @SerializeField() private allBtns: Button[] = [];
//     @SerializeField() private gainBalanceBtn: Button;
//     @SerializeField() private useBalanceBtn: Button;
//     @SerializeField() private purchaseOfficialUIBtn: Button;
//     @SerializeField() private purchaseImmediatelyBtn: Button;
//     @SerializeField() private informationPref: GameObject;

//     private _itemsCache: ProductRecord[] = [];
//     private _itemsPackageCache: ProductRecord[] = []
//     private _multiplay: ZepetoWorldMultiplay;
//     private _room : Room;
//     //private _uiBallances: UIBallances;

//     private Start() {
//         //this._multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
//         //this._uiBallances = Object.FindObjectOfType<UIBallances>();

//         // button Interval
//         //let allBtns : Button[] = this.GetComponentsInChildren<Button>();
//         this.allBtns.forEach(btn => btn.onClick.AddListener(() => this.StartCoroutine(this.BtnInterval(btn))));
        
//         // this.StartCoroutine(this.LoadAllItems());
//         this.InitMessageHandler();
//         // this._multiplay.RoomJoined += (room: Room) => {
//         //     this._room = room;
//         //     this.InitMessageHandler();
//         // }
//     }
    
//     private InitMessageHandler() {
//         //button listener
//         //this.gainBalanceBtn.onClick.AddListener(() => ItemManager.GetInstance().GainBalance(Currency.wak, 1000));
//         //this.useBalanceBtn.onClick.AddListener(() => ItemManager.GetInstance().UseBalance(Currency.wak, 100));
//         //sell items with id called potion1.
//         this.purchaseImmediatelyBtn.onClick.AddListener(() => this.StartCoroutine(ItemManager.GetInstance().PurchaseItemImmediately("food_test")));
//         this.purchaseOfficialUIBtn.onClick.AddListener(() => {
//             //The first non-consumable item is sold through the official ui.
//             const nonConsumableItem = this._itemsCache.find(ir => ir.PurchaseType === PurchaseType.NonConsumable);
//             if (nonConsumableItem) {
//                 //ItemManager.GetInstance().PurchaseItem(nonConsumableItem);
//             }
//             else{
//                 ItemManager.GetInstance().OpenInformation(`Non-consumable product does not exist.`);
//             }
//         });

//         // log message handler
//         // this._room.AddMessageHandler<BalanceSync>("SyncBalances", (message) => {
//         //     ItemManager.GetInstance().OpenInformation(`${message.currencyId} a Increase or decrease: ${message.quantity}`);
//         // });
//         // this._multiplay.Room.AddMessageHandler<InventorySync>("SyncInventories", (message) => {
//         //     ItemManager.GetInstance().OpenInformation(`${message.productId} has been ${InventoryAction[message.inventoryAction]} in the inventory.`);
//         //     // item use sample
//         //     /*if(message.inventoryAction == InventoryAction.Used){
//         //         if(message.productId == "potion1"){
//         //             console.log("potion use!");
//         //         }
//         //     }*/
//         // });
//         // this._room.AddMessageHandler<string>("DebitError", (message) => {
//         //     ItemManager.GetInstance().OpenInformation(message);
//         // });
//         // ProductService.OnPurchaseCompleted.AddListener((product, response) => {
//         //     ItemManager.GetInstance().OpenInformation(`${response.productId} Purchase Completed`);
//         // });
//         // ProductService.OnPurchaseFailed.AddListener((product, response) => {
//         //     ItemManager.GetInstance().OpenInformation(response.message);
//         // });
//     }

//     // private* LoadAllItems() {
//     //     const request = ProductService.GetProductsAsync();
//     //     yield new WaitUntil(() => request.keepWaiting == false);
//     //     if (request.responseData.isSuccess) {
//     //         this._itemsCache = [];
//     //         request.responseData.products.forEach((pr) => {
//     //             if (pr.ProductType == ProductType.Item) {
//     //                 this._itemsCache.push(pr);
//     //             }
//     //             if (pr.ProductType == ProductType.ItemPackage) {
//     //                 this._itemsPackageCache.push(pr);
//     //             }
//     //         });

//     //         if (this._itemsCache.length == 0) {
//     //             console.warn("no Item information");
//     //             return;
//     //         }
//     //     }
//     //     else{
//     //         console.warn("Product Load Failed");
//     //     }
//     // }
    
//     // private OpenInformation(message:string){
//     //     //const inforObj = GameObject.Instantiate(this.informationPref,this.transform.parent) as GameObject;
//     //     //inforObj.GetComponentInChildren<Text>().text = message;
//     // }
    
//     // // open offical ui
//     // private OnClickPurchaseItem(productRecord: ProductRecord) {
//     //     //ProductService.OpenPurchaseUI(productRecord);
//     // }

//     // private OnClickGainBalance(currencyId: string, quantity: number) {
//     //     const data = new RoomData();
//     //     data.Add("currencyId", currencyId);
//     //     data.Add("quantity", quantity);
//     //     this._multiplay.Room?.Send("onCredit", data.GetObject());
//     //     console.warn("OnClickGainBalance");
//     // }

//     // private OnClickUseBalance(currencyId: string, quantity: number) {
//     //     const data = new RoomData();
//     //     data.Add("currencyId", currencyId);
//     //     data.Add("quantity", quantity);
//     //     this._multiplay.Room?.Send("onDebit", data.GetObject());
//     //     console.warn("OnClickUseBalance");
//     // }

//     // an immediate purchase
//     // private* OnClickPurchaseItemImmediately(productId: string) {
//     //     const request = ProductService.PurchaseProductAsync(productId);
//     //     yield new WaitUntil(() => request.keepWaiting == false);
//     //     if (request.responseData.isSuccess) {
//     //         // is purchase success
//     //     } else {
//     //         // is purchase fail
//     //     }
//     // }

//     private * BtnInterval(btn:Button){
//         btn.interactable = false;
//         yield new WaitForSeconds(0.2);

//         btn.interactable = true;
//     }
// }