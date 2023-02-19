import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { GameObject, Sprite, WaitForSeconds } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import ExpandOrderReceipt from './ExpandOrderReceipt';
import Receipt from './Receipt';

enum Ingredient {
    TOP_BURN = 'topBun',
    BOTTOM_BURN = 'bottomBun',
    PATTY = 'patty',
    CABBAGE = 'cabbage',
    TOMATO = 'tomato',
    ONION = 'onion',
    CHEESE = 'cheese',
    PICKLE = 'pickle'
}

enum Drink {
    COKE = 'Coke',
    SPRITE = 'Sprite',
    ZERO_COKE = 'Zero Coke',
    FANTA = 'Fanta',
    WATER = 'Water'
}

export default class OrderManager extends ZepetoScriptBehaviour {
    private difficultyLevel: number = 1;
    public expandOrderReceiptObj: GameObject;
    public expandOrderReceipt: ExpandOrderReceipt;
    
    private curIngredients: number;
    private maxIngredients: number;

    // Define the member variables for the ingredient sprites
    public pattySprite: Sprite;
    public cabbage: Sprite;
    public tomatoSprite: Sprite;
    public onionSprite: Sprite;
    public cheeseSprite: Sprite;
    public pickleSprite: Sprite;
    public topBunSprite: Sprite;
    public bottomBunSprite: Sprite;

    public friesSprite: Sprite;
    public cheeseSticksSprite: Sprite;

    public cokeSprite: Sprite;
    public spriteSprite: Sprite;
    public zeroCokeSprite: Sprite;
    public fantaSprite: Sprite;
    public waterSprite: Sprite;

    public characterSprites: Sprite[];
    
    public receipts: Receipt[];
    public orders: Button[];
    private curOrderNumber: number;
    private maxOrderSize: number;

    Start() {
        this.init();
    }

    public init(){
        this.expandOrderReceipt = this.expandOrderReceiptObj.GetComponent<ExpandOrderReceipt>();
        if (this.expandOrderReceipt) this.expandOrderReceipt.setPanel(false);
        this.curIngredients = 0;
        this.maxIngredients = 6;
        this.curOrderNumber = 0;
        this.maxOrderSize = this.orders.length;
        for (let i = 0; i < this.maxOrderSize; i++) {
            this.initOrderBtn(i);
        }
        this.receipts = [];
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

    // the level of difficulty of the order
    public setDifficultyLevel(difficultyLevel: number): void {
        this.difficultyLevel = difficultyLevel;
    }

    // Enable corresponding index order
    public diplayExpandOrder(index: number): void {
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
        this.expandOrderReceipt.SetOrderReceipt(ingredients, burgerSprites, drinkSprite, sideSprite, additionalOrder, characterSprite);
        this.expandOrderReceipt.setPanel(true);
    }

    public initOrderBtn(index: number) {
        this.orders[index].onClick.AddListener(() => {
            this.diplayExpandOrder(index);
        });
    }

    public clearOrderBtn() {
        for(let i=0;i<this.orders.length;i++){
            this.orders[i].gameObject.SetActive(false);
        }
    }

    public clearOrder() {
        while (this.receipts.length != 0) {
            this.receipts.pop();
        }
        this.curOrderNumber = 0;
    }

    public removeOrder(index: number) {
        this.receipts.splice(index, 1);
        this.orders[this.curOrderNumber].gameObject.SetActive(false);
        this.curOrderNumber--;
    }

    private getIngredient(): Ingredient | null {
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

    private getIngredients(): Ingredient[] {
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

    public addOrder(): void {
        this.receipts.push(this.generateOrder());
        this.orders[this.curOrderNumber].gameObject.SetActive(true);
        this.curOrderNumber++;
    }

    // Create an order and add it to the receipt array
    public generateOrder(): Receipt {
        const receipt = new Receipt();
        // Generate the order receipt by combining the burger ingredients, fries, and drink
        const ingredients = this.getIngredients();
        const burger = `Burger with ${ingredients.join(', ')} on it`;
        const fries = 'Fries';
        const drink = this.generateDrink();
        const character = this.generateCharacter();
        const additionalOrder = this.generateAdditionalOrder(character, burger, fries, drink);
        receipt.setReceipt(ingredients, drink, fries, character, additionalOrder);
        return receipt;
    }

    // pick a drink randomly and return it.
    private generateDrink(): string {
        // Randomly select a drink
        const drinks: Drink[] = [Drink.COKE, Drink.SPRITE, Drink.ZERO_COKE, Drink.FANTA, Drink.WATER];
        const drink = drinks[Math.floor(Math.random() * drinks.length)];

        // Determine the probability of adding ice based on the difficulty level
        //const iceProb = Math.min(0.5 + this.difficultyLevel * 0.02, 1);

        // Randomly decide whether to add ice based on the probability
        //const ice = Math.random() < iceProb ? 'with ice' : 'without ice';

        return drink;
    }

    // 
    private generateCharacter(): string {
        return null;
    }

    private generateAdditionalOrder(character:string, burger:string, fries:string,drink:string): string {

        return `${burger}\n${fries}\n${drink}`;
    }

    // Return sprite of the ingredient
    private getIngredientSprite(ingredient: string): Sprite {
        switch (ingredient) {
            case Ingredient.TOP_BURN:
                return this.topBunSprite;
            case Ingredient.BOTTOM_BURN:
                return this.bottomBunSprite;
            case Ingredient.PATTY:
                return this.pattySprite;
            case Ingredient.CABBAGE:
                return this.cabbage;
            case Ingredient.TOMATO:
                return this.tomatoSprite;
            case Ingredient.ONION:
                return this.onionSprite;
            case Ingredient.CHEESE:
                return this.cheeseSprite;
            case Ingredient.PICKLE:
                return this.pickleSprite;
            default:
                return null;
        }
    }

    private getDrinkSprite(drinkName: string): Sprite {
        switch (drinkName) {
            case Drink.COKE:
                return this.cokeSprite;
            case Drink.SPRITE:
                return this.spriteSprite;
            case Drink.ZERO_COKE:
                return this.zeroCokeSprite;
            case Drink.FANTA:
                return this.fantaSprite;
            case Drink.WATER:
                return this.waterSprite;
            default:
                return null;
        }
    }

    // Return sprite of the side
    private getSideSprite(sideName: string): Sprite {
        switch (sideName) {
            case 'Fries':
                return this.friesSprite;
            case 'Cheese Sticks':
                return this.cheeseSticksSprite;
            default:
                return null;
        }
    }

    // Return sprite of the character
    private getCharacterSprite(characterName: string): Sprite {
        switch (characterName) {
            default:
                return this.characterSprites[0];
        }
    }

}