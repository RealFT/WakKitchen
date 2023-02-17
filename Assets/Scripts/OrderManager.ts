import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { GameObject, Sprite, Dictionary } from 'UnityEngine';
import ExpandOrderReceipt from './ExpandOrderReceipt';

enum Ingredient {
    PATTY = 'patty',
    LETTUCE = 'lettuce',
    TOMATO = 'tomato',
    ONION = 'onion',
    CHEESE = 'cheese',
    PICKLE = 'pickle'
}

enum Beverage {
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
    // Define the member variables for the ingredient sprites
    public pattySprite: Sprite;
    public lettuceSprite: Sprite;
    public tomatoSprite: Sprite;
    public onionSprite: Sprite;
    public cheeseSprite: Sprite;
    public pickleSprite: Sprite;

    public friesSprite: Sprite;
    public cheeseSticksSprite: Sprite;

    public cokeSprite: Sprite;
    public spriteSprite: Sprite;
    public zeroCokeSprite: Sprite;
    public fantaSprite: Sprite;
    public waterSprite: Sprite;


    Start() {
        this.expandOrderReceipt = this.expandOrderReceiptObj.GetComponent<ExpandOrderReceipt>();
    }

    private getIngredient(): Ingredient | null {
        // Calculate the probability of each ingredient and the null value based on the difficulty level
        const nullProb = 1 / (this.difficultyLevel + 1);
        const pattyProb = (1 - nullProb) * (1 / (6 - this.difficultyLevel));
        const otherProb = (1 - nullProb - pattyProb) / 5;

        // Randomly select an ingredient or the null value based on the probability distribution
        const random = Math.random();
        if (random < nullProb) {
            return null;
        } else if (random < nullProb + pattyProb) {
            return Ingredient.PATTY;
        } else if (random < nullProb + pattyProb + otherProb) {
            return Ingredient.LETTUCE;
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

        for (let i = 0; i < numIngredients; i++) {
            const ingredient = this.getIngredient();
            if (ingredient) {
                ingredients.push(ingredient);
            }
        }

        return ingredients;
    }

    private generateBeverage(): string {
        // Randomly select a beverage
        const beverages: Beverage[] = [Beverage.COKE, Beverage.SPRITE, Beverage.ZERO_COKE, Beverage.FANTA, Beverage.WATER];
        const beverage = beverages[Math.floor(Math.random() * beverages.length)];

        // Determine the probability of adding ice based on the difficulty level
        const iceProb = Math.min(0.5 + this.difficultyLevel * 0.02, 1);

        // Randomly decide whether to add ice based on the probability
        const ice = Math.random() < iceProb ? 'with ice' : 'without ice';

        return `${beverage} ${ice}`;
    }



    public generateOrder(): void {
        // Generate the order receipt by combining the burger ingredients, fries, and beverage
        const ingredients = this.getIngredients();
        const burger = `Burger with ${ingredients.join(', ')} on it`;
        const fries = 'Fries';
        const beverage = this.generateBeverage();
        const burgerSprites: Sprite[] = [];

        for (const ingredient of ingredients) {
            const sprite = this.getIngredientSprite(ingredient); 
            if (sprite) {
                burgerSprites.push(sprite);
            }
        }

        const drinkSprite = this.getDrinkSprite(this.generateBeverage());
        const sideSprite = this.getSideSprite(fries);
        const additionalOrder = `${burger}\n${fries}\n${beverage}`;
        //const characterSprite = this.getCharacterSprite();

        // Set the order receipt using the ExpandOrderReceipt component
        //const expandOrderReceipt = this.gameObject.GetComponent<ExpandOrderReceipt>("ExpandOrderReceipt");
        //expandOrderReceipt.SetOrderReceipt(orderName, ingredients, burgerSprites, drinkSprite, sideSprite, additionalOrder, characterSprite);
    }

    public getAdditionalOrder(): string {
        // Generate the order receipt by combining the burger ingredients, fries, and beverage
        const ingredients = this.getIngredients();
        const burger = `Burger with ${ingredients.join(', ')} on it`;
        const fries = 'Fries';
        const beverage = this.generateBeverage();
        return `${burger}\n${fries}\n${beverage}`;
    }

    private getIngredientSprite(ingredient: string): Sprite {
        switch (ingredient) {
            case Ingredient.PATTY:
                return this.pattySprite;
            case Ingredient.LETTUCE:
                return this.lettuceSprite;
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
            case 'Coke':
                return this.cokeSprite;
            case 'Sprite':
                return this.spriteSprite;
            case 'Zero Coke':
                return this.zeroCokeSprite;
            case 'Fanta':
                return this.fantaSprite;
            case 'Water':
                return this.waterSprite;
            default:
                return null;
        }
    }

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

    private getCharacterSprite(characterName: string): Sprite {
        switch (characterName) {
            default:
                return null;
        }
    }

    public setDifficultyLevel(difficultyLevel: number): void {
        this.difficultyLevel = difficultyLevel;
    }
}