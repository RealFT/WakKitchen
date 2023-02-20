import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Debug, GameObject, Sprite, WaitForSeconds } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import ExpandOrderReceipt from './ExpandOrderReceipt';
import Receipt from './Receipt';
import GameManager from './GameManager';
import { System } from 'UnityEngine.Rendering.VirtualTexturing';
import DataManager from './DataManager';

enum Ingredient {
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

enum Drink {
    START = 8,
    COKE = 8,
    SPRITE = 9,
    ZERO_COKE = 10,
    FANTA = 11,
    WATER = 12,
    END = 12
}

enum Side {
    START = 13,
    FRY = 13,
    END = 13
}

enum Customer {
    START = 14,
    HAKU = 14,
    END = 14
}

export default class OrderManager extends ZepetoScriptBehaviour {

    // ΩÃ±€≈Ê ∆–≈œ
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

/*    private difficultyLevel: number = 1;*/
    public expandOrderReceiptObj: GameObject;
    public expandOrderReceipt: ExpandOrderReceipt;

    // Define the member variables for the ingredient sprites
    public ingredientSprites: Sprite[];

    public drinkSprites: Sprite[];

    public sideSprites: Sprite[];

    public characterSprites: Sprite[];

    private receipts: Receipt[] = [];
    public orders: Button[];
    private curOrderNumber: number;
    private maxOrderSize: number;
    private curStage: number;

    Awake() {
        if (this != OrderManager.GetInstance()) GameObject.Destroy(this.gameObject);
    }

    Start() {
        this.init();
    }

    public init() {
        this.curStage = GameManager.GetInstance().getCurrentStage();
        this.expandOrderReceipt = this.expandOrderReceiptObj.GetComponent<ExpandOrderReceipt>();
        if (this.expandOrderReceipt) this.expandOrderReceipt.setPanel(false);
        this.curOrderNumber = 0;
        this.maxOrderSize = this.orders.length;
        for (let i = 0; i < this.maxOrderSize; i++) {
            this.initOrderBtn(i);
        }
        this.clearOrderBtn();
        this.StartOrder();
    }

    public StartOrder(){
        this.StartCoroutine(this.DoOrder());
    }

    public StopOrder() {
        this.StopAllCoroutines();
    }

    private *DoOrder() {
        while (true) {
            if (this.maxOrderSize > this.curOrderNumber)
                this.addOrder();
            const waitTime = 10;//Math.max(60 - (this.difficultyLevel - 1) * 3, 30) + 30 * Math.random();
            yield new WaitForSeconds(waitTime);
        }
    }

    public checkOrder(receipt: Receipt): void {
        // find the same receipt
        for (let index = 0; index < this.receipts.length; index++) {
            if (this.receipts[index].compareReceipt(receipt.drink, receipt.side, receipt.ingredients)) {
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
        Debug.Log(this.receipts.length);
        const receipt = this.receipts[index];
        Debug.Log(index + " " + receipt);
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
        if (DataManager.GetInstance()) this.receipts.push(DataManager.GetInstance().getRandomStageReceipt(this.curStage));
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

    private getRandomReceipt(): Receipt{
        //getReceipt
        return null;
    }



/*    private getIngredient(): Ingredient | null {
        // Calculate the probability of each ingredient and the null value based on the difficulty level
        const nullProb = 1 / (this.difficultyLevel + 1);
        // Decreases Patty's probability.
        const pattyProb = (1 - nullProb) * (1 / this.maxIngredients + this.curIngredients);
        const otherProb = (1 - nullProb - pattyProb) / (this.maxIngredients - 1);

        // Randomly select an ingredient or the null value based on the probability distribution
        const random = Math.random();
        if (random < nullProb) {
            return null;
        } else if (random < nullProb + pattyProb) {
            return Ingredient.PATTY;
        } else if (random < nullProb + pattyProb + otherProb) {
            return Ingredient.CABBAGE;
        } else if (random < nullProb + pattyProb + 2 * otherProb) {
            return Ingredient.TOMATO;
        } else if (random < nullProb + pattyProb + 3 * otherProb) {
            return Ingredient.ONION;
        } else if (random < nullProb + pattyProb + 4 * otherProb) {
            return Ingredient.CHEESE;
        } else {
            return Ingredient.PICKLE;
        }
    }
*/
  /*  private getIngredients(): Ingredient[] {
        const numIngredients = Math.floor((2 + this.difficultyLevel * 3 / 20) * Math.random()) + 1;
        const ingredients: Ingredient[] = [];

        ingredients.push(Ingredient.BOTTOM_BURN);
        for (let i = 0; i < numIngredients; i++) {
            const ingredient = this.getIngredient();
            if (ingredient) {
                ingredients.push(ingredient);
            }
        }
        ingredients.push(Ingredient.TOP_BURN);

        return ingredients;
    }
*/


    // Create an order and add it to the receipt array
/*    public generateOrder(): Receipt {
        const receipt = new Receipt();
        // Generate the order receipt by combining the burger ingredients, fries, and drink
        const ingredients = this.getIngredients();
        const burger = `Burger with ${ingredients.join(', ')} on it`;
        const fries = 'Fries';
        const drink = this.generateDrink();
        const character = this.generateCharacter();
        //const additionalOrder = this.generateAdditionalOrder(character, burger, fries, drink);
        //receipt.setReceipt(ingredients, drink, fries, character, additionalOrder);
        return receipt;
    }
*/
    // pick a drink randomly and return it.
/*    private generateDrink(): Drink {
        // Randomly select a drink
        const drinks: Drink[] = [Drink.COKE, Drink.SPRITE, Drink.ZERO_COKE, Drink.FANTA, Drink.WATER];
        const drink = drinks[Math.floor(Math.random() * drinks.length)];

        // Determine the probability of adding ice based on the difficulty level
        //const iceProb = Math.min(0.5 + this.difficultyLevel * 0.02, 1);

        // Randomly decide whether to add ice based on the probability
        //const ice = Math.random() < iceProb ? 'with ice' : 'without ice';

        return drink;
    }*/

    // 
/*    private generateCharacter(): number {
        return null;
    }*/

/*    private generateAdditionalOrder(character:Customer, burger:string, fries:string,drink:string): string {

        return `${burger}\n${fries}\n${drink}`;
    }*/

    // Return sprite of the ingredient
    private getIngredientSprite(ingredient: Ingredient): Sprite {
        return this.ingredientSprites[ingredient - Ingredient.START];
    }

    private getDrinkSprite(drinkName: Drink): Sprite {
        return this.drinkSprites[drinkName - Drink.START];
    }

    // Return sprite of the side
    private getSideSprite(sideName: Side): Sprite {
        return this.sideSprites[sideName - Side.START];
    }

    // Return sprite of the character
    private getCharacterSprite(characterName: Customer): Sprite {
        return this.characterSprites[characterName - Customer.START];
    }

}