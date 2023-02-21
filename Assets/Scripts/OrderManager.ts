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
    PICKLE = 7,
    END = 7
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
    END = 14
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
            //GameObject.DontDestroyOnLoad(_obj);
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
    private curStage: number;

    // array of produced Ingredient, Drink, Side.
    private products: number[];

    public initProduct() {
        this.products = [0, 2, 1];
    }

    // Add a product to the end of the products array
    public addProduct(index:number){
        Debug.Log("addProduct: " + index);
        this.products.push(index);
    }

    // Remove a product at the given index from the products array
    public subProduct(index: number) {
        this.products[index] = this.products[this.products.length-1];
        this.products.pop();
    }

    // Get a product at the given index from the products array
    public getProduct(index:number): number {
        if (this.products && index < this.products.length) return this.products[index];
        return -1;
    }

    // Get the entire products array
    public getProducts(): number[]{
        return this.products;
    }

    public init() {
        this.StopOrder();
        this.curStage = GameManager.GetInstance().getCurrentStage();
        this.expandOrderReceipt = this.expandOrderReceiptObj.GetComponent<ExpandOrderReceipt>();
        if (this.expandOrderReceipt) this.expandOrderReceipt.setPanel(false);
        this.curOrderNumber = 0;
        this.maxOrderSize = this.orders.length;
        for (let i = 0; i < this.maxOrderSize; i++) {
            this.initOrderBtn(i);
        }
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

    public checkOrder(products: number[]): void {
        let ingredients: number[] = [];
        let drink;
        let side;

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
                GameManager.GetInstance().addMoney(this.receipts[index].pay);
                // remove this receipt
                this.removeOrder(index);
                break;
            }
        }
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
        this.receipts.push(DataManager.GetInstance().getRandomStageReceipt(this.curStage));
        this.orders[this.curOrderNumber].gameObject.SetActive(true);
        this.curOrderNumber++;
    }

    public removeOrder(index: number) {
        this.orders[this.curOrderNumber].gameObject.SetActive(false);
        this.curOrderNumber--;
    }

    public clearOrder() {
        for (let i = 0; i < this.orders.length; i++) {
            this.orders[this.curOrderNumber].gameObject.SetActive(false);
        }
        this.curOrderNumber = 0;
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