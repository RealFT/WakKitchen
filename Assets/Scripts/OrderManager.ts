import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Debug, GameObject, Sprite, WaitForSeconds } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import ExpandOrderReceipt from './ExpandOrderReceipt';
import Receipt from './Receipt';
import GameManager from './GameManager';
import DataManager from './DataManager';

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
    COKE = 8,
    SPRITE = 9,
    ZERO_COKE = 10,
    FANTA = 11,
    WATER = 12,
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

    public expandOrderReceiptObj: GameObject;
    public expandOrderReceipt: ExpandOrderReceipt;

    // Define the member variables for the Receipt's sprites
    public ingredientSprites: Sprite[];
    public drinkSprites: Sprite[];
    public sideSprites: Sprite[];
    public characterSprites: Sprite[];

    private receipts: Receipt[] = [];
    public orders: Button[];
    private curOrderNumber: number;
    private maxOrderSize: number;

    // array of produced Ingredient, Drink, Side.
    // number of items in inventory indexed by product id
    private productInventory: Map<number, number> = new Map<number, number>();

    Awake() {
        if (this != OrderManager.GetInstance()) GameObject.Destroy(this.gameObject);
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

    public init() {
        this.StopOrder();
        this.expandOrderReceipt = this.expandOrderReceiptObj.GetComponent<ExpandOrderReceipt>();
        if (this.expandOrderReceipt) this.expandOrderReceipt.setPanel(false);
        this.maxOrderSize = this.orders.length;
        for (let i = 0; i < this.maxOrderSize; i++) {
            this.initOrderBtn(i);
        }
        this.clearOrder();
        this.clearOrderBtn();
        this.initProduct();
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
                // earn this receipt's pay
                GameManager.GetInstance().changeMoney(this.receipts[index].pay);
                // remove this receipt
                this.removeOrder(index);
                return true;
            }
        }
        return false;
    }

    // Enable corresponding index order
    public displayExpandOrder(index: number): void {
        if (!this.receipts) return;
        Debug.Log("displayExpandOrder: " + this.receipts.length);
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
        this.orders[this.curOrderNumber].gameObject.SetActive(true);
        this.curOrderNumber++;
    }

    public removeOrder(index: number) {
        this.curOrderNumber--;
        this.orders[this.curOrderNumber].gameObject.SetActive(false);
        for (let i = index; i < this.receipts.length - 1; i++) {
            this.receipts[i] = this.receipts[i + 1];
        }
        this.receipts.pop();
    }

    public clearOrder() {
        this.curOrderNumber = 0;
        this.receipts = [];
    }

    public initOrderBtn(index: number) {
        this.orders[index].onClick.AddListener(() => {
            this.displayExpandOrder(index);
        });
    }

    public clearOrderBtn() {
        for(let i=0;i<this.orders.length;i++){
            this.orders[i].gameObject.SetActive(false);
        }
    }

    public disableOrder(){
        this.StopOrder();
        this.clearOrder();
        this.clearOrderBtn();
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