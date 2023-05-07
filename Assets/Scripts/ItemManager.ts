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
import Shop_Upgrade from './Shop/Shop_Upgrade';
import SoundManager from './SoundManager';

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
    //private _cardCache: ProductRecord[] = [];
    private _multiplay: ZepetoWorldMultiplay;
    private _room: Room;
    private upgradedGroup: Map<string, number> = new Map<string, number>();

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
                            this.AddToUpgradedGroup(pr);
                            break;
                        // case ItemType.card:
                        //     this._cardCache.push(pr);
                        //     break;
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
        if (this._foodCache.length == 0) {
            return null;
        }
        return this._foodCache;
    }

    public getUpgradeCache(): ProductRecord[] {
        if (this._upgradeCache.length == 0) {
            return null;
        }
        return this._upgradeCache;
    }

    public GetUpgradedLevel(itemName: string): number{
        return this.upgradedGroup.get(itemName);
    }

    private AddToUpgradedGroup(item: ProductRecord) {
        // 1: Shop Category, 2: item Name, 3: upgrade level
        // third matches single digit separated by underscore.
        // Create groups based on match[1] value to extract items with the lowest match[2] value.
        const match = item.productId.split('_');
        const itemName = match ? match[1] : "";
        const upgradeLevel = match ? parseInt(match[2]) : 0;
        // Only retrieve purchased items.
        if (item.isPurchased) {
            // If it's already set in the group
            if (this.upgradedGroup.has(itemName)) {
                // find the maximum upgrade level and set
                const currentValue = this.upgradedGroup.get(itemName);
                const upgradedValue = Math.max(currentValue, upgradeLevel);
                this.upgradedGroup.set(itemName, upgradedValue);
            } else {
                this.upgradedGroup.set(itemName, upgradeLevel);
            }
        }
        // Set default value if not set in the group
        else if (!this.upgradedGroup.has(itemName)) {
            this.upgradedGroup.set(itemName, 0);
        }
    }

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
            const product = this.GetProduct(productId);
            product.isPurchased = true;
            this.AddToUpgradedGroup(product);
            SoundManager.GetInstance().OnPlaySFX("Purchase");
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
            // case ItemType.card:
            //     return this._cardCache.find((item) => item.productId === productId);;
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