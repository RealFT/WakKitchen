import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Coroutine, Debug, GameObject, Sprite, WaitForSeconds } from 'UnityEngine';
import { Button, Slider } from 'UnityEngine.UI';
import ExpandOrderReceipt from './ExpandOrderReceipt';
import Receipt from './Receipt';
import DataManager from './DataManager';
import OrderReceipt from './OrderReceipt';
import BalanceManager, { Currency } from './Shop/BalanceManager';

export enum Ingredient {
    START = 0,
    TOP_BURN = 0,
    BOTTOM_BURN = 1,
    PATTY = 2,
    CABBAGE = 3,
    TOMATO = 4,
    ONION = 5,
    CHEESE = 6,
    END = 6
}

export enum Drink {
    START = 8,
    PAENCHI = 8,
    NECKSRITE = 9,
    HOTCHS = 10,
    ORANGE = 11,
    PINEAPPLE = 12,
    END = 12
}

export enum Side {
    START = 13,
    FRY = 13,
    END = 13
}

export enum Customer {
    START = 14,
    HAKU = 14,
    CALLYCARLY = 15,
    CHUNSIK = 16,
    DANDAPBUG = 17,
    HYEJI = 18,
    DOPAMINE = 19,
    HIKIKING = 20,
    KIMCHIMANDU = 21,
    KWONMIN = 22,
    ROENTGENIUM = 23,
    RUSUK = 24,
    SECRETTO = 25,
    BUSINESSKIM = 26,
    WAKPHAGO = 27,
    WAKGOOD = 28,
    END = 28
}

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

    // Define the member variables for the Receipt's sprites
    @SerializeField() private ingredientSprites: Sprite[];
    @SerializeField() private drinkSprites: Sprite[];
    @SerializeField() private sideSprites: Sprite[];
    @SerializeField() private characterSprites: Sprite[];

    @SerializeField() private orderReceipts: GameObject[];
    private curOrderNumber: number;
    private maxOrderSize: number;
    private receipts: Receipt[] = [];

    @SerializeField() private waitTime: number; // time to wait order
    @SerializeField() private waitSliders: Slider[] = []; // 
    private waitCoroutines:Coroutine[] = [];

    // array of produced Ingredient, Drink, Side.
    // number of items in inventory indexed by product id
    private productInventory: Map<number, number> = new Map<number, number>();

    Awake() {
        if (this != OrderManager.GetInstance()) GameObject.Destroy(this.gameObject);
    }

    public init() {
        this.StopOrder();
        this.expandOrderReceipt = this.expandOrderReceiptObj.GetComponent<ExpandOrderReceipt>();
        if (this.expandOrderReceipt) this.expandOrderReceipt.setPanel(false);
        this.maxOrderSize = this.orderReceipts.length;
        for (let i = 0; i < this.maxOrderSize; i++) {
            this.initOrderBtn(i);
        }
        this.clearOrder();
        this.clearOrderReceipts();
        this.initProduct();
        /**/ 
        if(this.waitTime == 0) this.setWaitTime(20);
    }

    public initProduct() {
        this.RemoveAllItemsFromInventory();
        this.AddItemToInventory(Ingredient.BOTTOM_BURN, 100);
        this.AddItemToInventory(Ingredient.TOP_BURN, 100);
        this.AddItemToInventory(Ingredient.PATTY, 10);
        this.AddItemToInventory(Ingredient.CABBAGE, 10);
    }

    // Add item to inventory
    public AddItemToInventory(product: number, quantity: number = 1): void {
        // if already exist same product
        if (this.productInventory.has(product)) {
            this.productInventory.set(product, this.productInventory.get(product) + quantity);
        } else {
            this.productInventory.set(product, quantity);
        }
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
            const waitTime = 10;//Math.max(60 - (this.difficultyLevel - 1) * 3, 30) + 30 * Math.random();
            yield new WaitForSeconds(waitTime);
        }
    }

    public checkOrder(products: number[]): boolean {
        let ingredients: number[] = [];
        let drink = -1;
        let side = -1;

        // split ingredients, drink, side
        for (let i = 0; i < products.length; i++) {
            if (products[i] < Ingredient.END)
                ingredients.push(products[i]);
            else if (products[i] < Drink.END)
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
    public displayExpandOrder(index: number): void {
        if (!this.receipts) return;
        const receipt = this.receipts[index];
        const ingredients = receipt.ingredients;
        const burgerSprites: Sprite[] = [];
        for (const ingredient of ingredients) {
            const sprite = this.getIngredientSprite(ingredient);
            if (sprite) {
                burgerSprites.push(sprite);
            }
        }

        const drinkSprite = this.getDrinkSprite(receipt.drink);
        const sideSprite = this.getSideSprite(receipt.side);
        const additionalOrder = receipt.additionalOrder;
        const characterSprite = this.getCharacterSprite(receipt.character);

        if (!this.expandOrderReceipt) this.expandOrderReceipt = this.expandOrderReceiptObj.GetComponent<ExpandOrderReceipt>();
        this.expandOrderReceipt.SetOrderReceipt(burgerSprites, drinkSprite, sideSprite, additionalOrder, characterSprite);
        this.expandOrderReceipt.setPanel(true);
    }

    public addOrder(): void {
        this.receipts.push(DataManager.GetInstance().getRandomStageReceipt());
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
        }
        // remove the last order
        this.receipts.pop();
        this.orderReceipts[this.curOrderNumber].gameObject.SetActive(false);
    }

    public clearOrder() {
        this.curOrderNumber = 0;
        this.receipts = [];
    }

    public initOrderBtn(index: number) {
        var openReceiptBtn = this.orderReceipts[index].GetComponent<OrderReceipt>().GetReceiptButton();
        openReceiptBtn.onClick.AddListener(() => {
            this.displayExpandOrder(index);
        });
    }

    public clearOrderReceipts() {
        for(let i=0;i<this.orderReceipts.length;i++){
            this.orderReceipts[i].gameObject.SetActive(false);
        }
    }

    public disableOrder(){
        this.StopOrder();
        this.clearOrder();
        this.clearOrderReceipts();
        if (this.expandOrderReceipt) this.expandOrderReceipt.setPanel(false);
    }

    public getProductSprite(product: number): Sprite {
        // split ingredients, drink, side
        if (product < Ingredient.END)
            return this.getIngredientSprite(product);
        else if (product < Drink.END)
            return this.getDrinkSprite(product);
        else
            return this.getSideSprite(product);
    }

    // Return sprite of the ingredient
    public getIngredientSprite(ingredient: Ingredient): Sprite {
        return this.ingredientSprites[ingredient - Ingredient.START];
    }

    public getDrinkSprite(drinkName: Drink): Sprite {
        return this.drinkSprites[drinkName - Drink.START];
    }

    // Return sprite of the side
    public getSideSprite(sideName: Side): Sprite {
        return this.sideSprites[sideName - Side.START];
    }

    // Return sprite of the character
    public getCharacterSprite(characterName: Customer): Sprite {
        return this.characterSprites[characterName - Customer.START];
    }

}