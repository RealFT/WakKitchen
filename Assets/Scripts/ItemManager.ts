import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, Text } from 'UnityEngine.UI'
import { GameObject, Object, WaitUntil, WaitForSeconds, Debug, Random } from 'UnityEngine'
import { ProductRecord, ProductService, ProductStatus, ProductType, PurchaseType } from "ZEPETO.Product";
import { BalanceListResponse, CurrencyService, CurrencyError } from "ZEPETO.Currency";
import { ZepetoWorldMultiplay } from "ZEPETO.World";
import { Room, RoomData } from "ZEPETO.Multiplay";
import UIBallances, { BalanceSync, Currency, ItemType, InventoryAction, InventorySync } from "./Shop/BalanceManager";
import UIManager from './UIManager';
import Mediator from './Notification/Mediator';

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

    private _foodCache: ProductRecord[] = [];
    private _upgradeCache: ProductRecord[] = [];
    private _cardCache: ProductRecord[] = [];
    private _multiplay: ZepetoWorldMultiplay;
    private _room: Room;

    Awake() {
        if (this != ItemManager.GetInstance()) GameObject.Destroy(this.gameObject);
    }

    Start() {
        //this.RefreshAllBalanceUI();
        //this.RefreshStageUI();
        this._multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();

        this.StartCoroutine(this.LoadAllItems());

        this._multiplay.RoomJoined += (room: Room) => {
            this._room = room;
            this.InitMessageHandler();
        }
    }

    private InitMessageHandler() {
        // log message handler
        this._room.AddMessageHandler<BalanceSync>("SyncBalances", (message) => {
            //UIManager.GetInstance().OpenInformation(`${message.currencyId} a Increase or decrease: ${message.quantity}`);
        });

        this._multiplay.Room.AddMessageHandler<InventorySync>("SyncInventories", (message) => {
            UIManager.GetInstance().OpenInformation(`${message.productId} has been ${InventoryAction[message.inventoryAction]} in the inventory.`);
            // item use sample
            /*if(message.inventoryAction == InventoryAction.Used){
                if(message.productId == "potion1"){
                    console.log("potion use!");
                }
            }*/
        });

        this._room.AddMessageHandler<string>("DebitError", (message) => {
            UIManager.GetInstance().OpenInformation(message);
        });
        ProductService.OnPurchaseCompleted.AddListener((product, response) => {
            UIManager.GetInstance().OpenInformation(`${response.productId} Purchase Completed`);
        });
        ProductService.OnPurchaseFailed.AddListener((product, response) => {
            UIManager.GetInstance().OpenInformation(response.message);
        });
    }

    private * LoadAllItems() {
        const request = ProductService.GetProductsAsync();
        yield new WaitUntil(() => request.keepWaiting == false);
        if (request.responseData.isSuccess) {
            request.responseData.products.forEach((pr) => {
                // Determine the prefix of the productId and add the product to the appropriate map.
                if (pr.ProductStatus == ProductStatus.Active) {
                    const prefix = pr.productId.split('_')[0];
                    switch (prefix) {
                        case ItemType.food:
                            this._foodCache.push(pr);
                            break;
                        case ItemType.upgrade:
                            this._upgradeCache.push(pr);
                            break;
                        case ItemType.card:
                            this._cardCache.push(pr);
                            break;
                        default:
                            // Ignore products with unrecognized prefixes.
                            break;
                    }
                }
            });
        }
        // this.StartCoroutine(this.RefreshInventoryUI());
        // this.StartCoroutine(this.RefreshBalanceUI());
    }

    public getFoodCache(): ProductRecord[] {
        if (this._foodCache.Length == 0) {
            return null;
        }
        return this._foodCache;
    }

    public getUpgradeCache(): ProductRecord[] {
        if (this._upgradeCache.Length == 0) {
            return null;
        }
        return this._upgradeCache;
    }

    public getCardCache(): ProductRecord[] {
        if (this._cardCache.Length == 0) {
            return null;
        }
        return this._cardCache;
    }

    public GetRandomCardId(): string{
        if (this._cardCache.Length == 0) {
            return null;
        }
        return this._cardCache[Random.Range(0,this._cardCache.Length)].productId;
    }

    // public GainBalance(currencyId: string, quantity: number) {
    //     const data = new RoomData();
    //     data.Add("currencyId", currencyId);
    //     data.Add("quantity", quantity);
    //     this._multiplay.Room?.Send("onCredit", data.GetObject());
    //     console.warn("GainBalance");
    // }

    // public UseBalance(currencyId: string, quantity: number) {
    //     const data = new RoomData();
    //     data.Add("currencyId", currencyId);
    //     data.Add("quantity", quantity);
    //     this._multiplay.Room?.Send("onDebit", data.GetObject());
    //     console.warn("UseBalance");
    // }

    // an immediate purchase
    public * PurchaseItemImmediately(productId: string) {
        const request = ProductService.PurchaseProductAsync(productId);
        yield new WaitUntil(() => request.keepWaiting == false);
        if (request.responseData.isSuccess) {
            // is purchase success
        } else {
            // is purchase fail
        }
    }

    public * PurchaseItem(productId: string) {
        const request = ProductService.PurchaseProductAsync(productId);
        yield new WaitUntil(() => request.keepWaiting == false);
        if (request.responseData.isSuccess) {
            // is purchase success
            // Mediator를 통해 UI 클래스에 possessionMoney값 전달
            Mediator.GetInstance().Notify(this, "UpgradeUpdated", productId);
        } else {
            // is purchase fail
        }
    }

    public GetProduct(productId: string): ProductRecord | undefined {
        const prefix = productId.split('_')[0];
        switch (prefix) {
            case ItemType.food:
                return this._foodCache.find((item) => item.productId === productId);
            case ItemType.upgrade:
                return this._upgradeCache.find((item) => item.productId === productId);
            case ItemType.card:
                return this._cardCache.find((item) => item.productId === productId);;
            default:
                return undefined; // Return undefined for products with unrecognized prefixes.
        }
    }

    private * BtnInterval(btn: Button) {
        btn.interactable = false;
        yield new WaitForSeconds(0.2);

        btn.interactable = true;
    }

}