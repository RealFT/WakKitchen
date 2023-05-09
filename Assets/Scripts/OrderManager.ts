import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Coroutine, Debug, GameObject, Sprite, WaitForSeconds } from 'UnityEngine';
import { Button, Slider } from 'UnityEngine.UI';
import ExpandOrderReceipt from './ExpandOrderReceipt';
import Receipt from './Receipt';
import DataManager, { Ingredient, Drink, Side } from './DataManager';
import OrderReceipt from './OrderReceipt';
import BalanceManager, { Currency } from './Shop/BalanceManager';
import SoundManager from './SoundManager';
import UIManager from './UIManager';

export default class OrderManager extends ZepetoScriptBehaviour {
    // singleton
    private static Instance: OrderManager;
    public static GetInstance(): OrderManager {

        if (!OrderManager.Instance) {
            //Debug.LogError("OrderManager");

            var _obj = GameObject.Find("OrderManager");
            if (!_obj) {
                _obj = new GameObject("OrderManager");
                _obj.AddComponent<OrderManager>();
            }
            OrderManager.Instance = _obj.GetComponent<OrderManager>();
            GameObject.DontDestroyOnLoad(_obj);
        }
        return OrderManager.Instance;
    }

    @SerializeField() private expandOrderReceiptObj: GameObject;
    @SerializeField() private expandOrderReceipt: ExpandOrderReceipt;
    @SerializeField() private orderReceipts: GameObject[];
    private curOrderNumber: number;
    private maxOrderSize: number;
    private receipts: Receipt[] = [];

    @SerializeField() private waitTime: number; // time to wait order
    @SerializeField() private waitSliders: Slider[] = []; // 
    private waitCoroutines: Coroutine[] = [];

    // array of produced Ingredient, Drink, Side.
    // number of items in inventory indexed by product id
    private productInventory: Map<number, number> = new Map<number, number>();

    Awake() {
        if (this != OrderManager.GetInstance()) GameObject.Destroy(this.gameObject);
    }

    public Init() {
        this.StopOrder();
        this.expandOrderReceipt = this.expandOrderReceiptObj.GetComponent<ExpandOrderReceipt>();
        if (this.expandOrderReceipt) this.expandOrderReceipt.setPanel(false);
        this.maxOrderSize = this.orderReceipts.length;
        for (let i = 0; i < this.maxOrderSize; i++) {
            this.InitOrderBtn(i);
        }
        this.ClearOrder();
        this.ClearOrderReceipts();
        this.InitProduct();
        /**/ 
        if(this.waitTime == 0) this.setWaitTime(20);
    }

    public InitProduct() {
        this.RemoveAllItemsFromInventory();
        this.AddItemToInventory(Ingredient.BOTTOM_BURN, 100);
        this.AddItemToInventory(Ingredient.TOP_BURN, 100);
        this.AddItemToInventory(Ingredient.CHEESE, 100);
    }

    // Add item to inventory
    public AddItemToInventory(product: number, quantity: number = 1): void {
        // if already exist same product
        if (this.productInventory.has(product)) {
            this.productInventory.set(product, this.productInventory.get(product) + quantity);
        } else {
            this.productInventory.set(product, quantity);
        }
        SoundManager.GetInstance().OnPlayButtonSFX(SoundManager.GetInstance().keyBtnSelect);
    }

    // Remove item from inventory
    public RemoveItemFromInventory(product: number, quantity: number = 1): void {
        if (this.productInventory.has(product)) {
            const currentQuantity = this.productInventory.get(product);
            if (currentQuantity >= quantity) {
                this.productInventory.set(product, currentQuantity - quantity);
                // if product doesn't have any quantity
                if (this.productInventory.get(product) === 0) {
                    // delete product from productInventory
                    this.productInventory.delete(product);
                }
            } else {
                Debug.Log(`Not enough ${product} in productInventory`);
            }
        } else {
            Debug.Log(`${product} not found in productInventory`);
        }
    }

    // Remove all items from inventory
    public RemoveAllItemsFromInventory(): void {
        this.productInventory.clear();
    }

    public GetQuantityFromInventory(product: number): number {
        if (this.productInventory.has(product)) {
            return this.productInventory.get(product);
        } else {
            return 0;
        }
    }

    // To import an array that stores all products with one or more numbers in the inventory
    public GetProductsFromInventory(): number[] {
        const products = [];
        for (const [key, value] of this.productInventory) {
            if (value > 0) {
                products.push(key);
            }
        }
        return products;
    }

    public StartOrder(){
        this.StartCoroutine(this.DoOrder());
    }

    public StopOrder() {
        this.StopAllCoroutines();
    }

    private *DoOrder() {
        yield new WaitForSeconds(2);
        while (true) {
            if (this.maxOrderSize > this.curOrderNumber)
                this.addOrder();
            let waitTime = Math.max(2 + 8 * Math.random());
            if(this.curOrderNumber <= 1)
                waitTime *= 0.5;
            console.log("waitTime: " + waitTime);
            yield new WaitForSeconds(waitTime);
        }
    }

    public checkOrder(products: number[]): boolean {
        let ingredients: number[] = [];
        let drink = -1;
        let side = -1;

        // split ingredients, drink, side
        for (let i = 0; i < products.length; i++) {
            if (products[i] <= Ingredient.END)
                ingredients.push(products[i]);
            else if (products[i] <= Drink.END)
                drink = products[i];
            else
                side = products[i];
        }

        // find the same receipt
        for (let index = 0; index < this.receipts.length; index++) {
            if (this.receipts[index].compareReceipt(drink, side, ingredients)) {
                // stop wait Corutine
                this.StopCoroutine(this.waitCoroutines[index]);
                // earn this receipt's pay
                BalanceManager.GetInstance().GainBalance(Currency.wak, this.receipts[index].pay);
                // if waitSlider isn't 0, remove this receipt
                this.removeOrder(index);

                return true;
            }
        }
        return false;
    }

    // Enable corresponding index order
    public DisplayExpandOrder(index: number): void {
        if (!this.receipts) return;
        const receipt = this.receipts[index];
        const ingredients = receipt.ingredients;
        const burgerSprites: Sprite[] = [];
        for (const ingredient of ingredients) {
            const sprite = DataManager.GetInstance().getIngredientSprite(ingredient);
            if (sprite) {
                burgerSprites.push(sprite);
            }
        }

        const drinkSprite = DataManager.GetInstance().getDrinkSprite(receipt.drink);
        const sideSprite = DataManager.GetInstance().getSideSprite(receipt.side);
        const additionalOrder = receipt.additionalOrder;
        const cost = receipt.pay.toString();
        const characterSprite = DataManager.GetInstance().GetCharacterSprite(receipt.character);

        if (!this.expandOrderReceipt) this.expandOrderReceipt = this.expandOrderReceiptObj.GetComponent<ExpandOrderReceipt>();
        this.expandOrderReceipt.SetOrderReceipt(burgerSprites, drinkSprite, sideSprite, additionalOrder, cost, characterSprite);
        this.expandOrderReceipt.setPanel(true);
        SoundManager.GetInstance().OnPlayButtonSFX(SoundManager.GetInstance().keyBtnSelect);
    }

    public addOrder(): void {
        const receipt = DataManager.GetInstance().GetRandomStageReceipt();
        this.receipts.push(receipt);
        this.orderReceipts[this.curOrderNumber].GetComponent<OrderReceipt>()?.SetOrderReceipt(receipt);
        this.orderReceipts[this.curOrderNumber].gameObject.SetActive(true);
        this.waitCoroutines[this.curOrderNumber] = this.StartCoroutine(this.WaitOrder(this.curOrderNumber, 0))
        this.curOrderNumber++;
    }

    public setWaitTime(waitTime:number){
        this.waitTime = waitTime;
    }

    *WaitOrder(index: number, waitTime: number = 0) {
        const period = 0.2;
        let curTime = waitTime;
        this.waitSliders[index].value = 1;
        // loop until waitSlider's value is 0
        while(this.waitSliders[index].value > 0){
            this.waitSliders[index].value = Math.max(0, 1 - curTime / this.waitTime);
            yield new WaitForSeconds(period);
            curTime += period;
        }
        this.removeOrder(index);
    }

    public removeOrder(index: number) {
        this.curOrderNumber--;
        // stop coroutines and reset sliders
        for(let i=index; i<this.waitCoroutines.length;i++){
            this.StopCoroutine(this.waitCoroutines[i]);
            this.waitSliders[index].value = 1
        }
        // shift orderReceipts to fill the gap
        for (let i = index; i < this.receipts.length - 1; i++) {
            this.receipts[i] = this.receipts[i + 1];
            const curTime = (1 - this.waitSliders[i + 1].value) * this.waitTime;
            this.waitCoroutines[i] = this.StartCoroutine(this.WaitOrder(i, curTime));
            this.orderReceipts[i].GetComponent<OrderReceipt>()?.SetOrderReceipt(this.receipts[i]);
        }
        // remove the last order
        this.receipts.pop();
        this.orderReceipts[this.curOrderNumber].gameObject.SetActive(false);
    }

    public ClearOrder() {
        this.curOrderNumber = 0;
        this.receipts = [];
    }

    public InitOrderBtn(index: number) {
        var openReceiptBtn = this.orderReceipts[index].GetComponent<OrderReceipt>().GetReceiptButton();
        openReceiptBtn.onClick.AddListener(() => {
            this.DisplayExpandOrder(index);
        });
    }

    public ClearOrderReceipts() {
        for(let i=0;i<this.orderReceipts.length;i++){
            this.orderReceipts[i].gameObject.SetActive(false);
            this.orderReceipts[i].GetComponent<OrderReceipt>()?.ClearOrderReceipt();
        }
    }

    public DisableOrder(){
        this.StopOrder();
        this.ClearOrder();
        this.ClearOrderReceipts();
        if (this.expandOrderReceipt) this.expandOrderReceipt.setPanel(false);
    }

    // public getProductSprite(product: number): Sprite {
    //     // split ingredients, drink, side
    //     if (product < Ingredient.END)
    //         return this.getIngredientSprite(product);
    //     else if (product < Drink.END)
    //         return this.getDrinkSprite(product);
    //     else
    //         return this.getSideSprite(product);
    // }

    // // Return sprite of the ingredient
    // public getIngredientSprite(ingredient: Ingredient): Sprite {
    //     return this.ingredientSprites[ingredient - Ingredient.START];
    // }

    // public getDrinkSprite(drinkName: Drink): Sprite {
    //     return this.drinkSprites[drinkName - Drink.START];
    // }

    // // Return sprite of the side
    // public getSideSprite(sideName: Side): Sprite {
    //     return this.sideSprites[sideName - Side.START];
    // }

    // // Return sprite of the character
    // public getCharacterSprite(characterName: Customer): Sprite {
    //     return this.characterSprites[characterName - Customer.START];
    // }

}