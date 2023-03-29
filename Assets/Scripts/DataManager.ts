import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Random, Sprite, Resources, TextAsset } from 'UnityEngine';
import Receipt from './Receipt';
import { GameObject, Debug } from 'UnityEngine';

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

export enum Character {
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

export default class DataManager extends ZepetoScriptBehaviour {
    // singleton
    private static Instance: DataManager;
    public static GetInstance(): DataManager {

        if (!DataManager.Instance) {

            var _obj = GameObject.Find("DataManager");
            if (!_obj) {
                Debug.LogError("New DataManager");
                _obj = new GameObject("DataManager");
                _obj.AddComponent<DataManager>();
            }
            DataManager.Instance = _obj.GetComponent<DataManager>();
            GameObject.DontDestroyOnLoad(_obj);
        }
        return DataManager.Instance;
    }

    @SerializeField() private receiptFile: TextAsset;
    @SerializeField() private stageFile: TextAsset;
    // Define the member variables for the Receipt's sprites
    @SerializeField() private ingredientSprites: Sprite[];
    @SerializeField() private drinkSprites: Sprite[];
    @SerializeField() private sideSprites: Sprite[];
    @SerializeField() private characterSprites: Sprite[];
    @SerializeField() private sectionSprites: Sprite[];
    private receipts: Receipt[] = [];
    private stageReceipts: Receipt[] = [];
    private stages: number[][] = [];

    Awake() {
        if (this != DataManager.GetInstance()) GameObject.Destroy(this.gameObject);
        this.LoadData();
    }

    public LoadData() {    
        this.LoadReceiptData();
        this.LoadStageData();
    }

    public LoadReceiptData() {
        const lines = this.receiptFile.text.split('\n'); // split the CSV file by row
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim().replace('\r', ''); // Remove any leading/trailing whitespace and '\r' characters
            const values = line.split(','); // split the row by comma to get the values
            
            // do something with the values
            const receipt = new Receipt();
            const ingredients: number[] = [];
            for (let j = 6; j < values.length; j++) {
                ingredients.push(+values[j]);
            }
            receipt.SetReceipt(+values[0], +values[1], +values[2], +values[3], +values[4], values[5], ingredients);
            this.receipts.push(receipt);
        };
    }

    public LoadStageData() {
        const lines = this.stageFile.text.split('\n'); // split the CSV file by row
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim().replace('\r', ''); // Remove any leading/trailing whitespace and '\r' characters
            const values = line.split(','); // split the row by comma to get the values
            
            // do something with the values
            const stageIndexs = values.slice(1);
            this.stages[values[0]] = stageIndexs;
        }
    }

    public LoadCardData() {
        const lines = this.stageFile.text.split('\n'); // split the CSV file by row
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim().replace('\r', ''); // Remove any leading/trailing whitespace and '\r' characters
            const values = line.split(','); // split the row by comma to get the values
            
            // do something with the values
            const stageIndexs = values.slice(1);
            this.stages[values[0]] = stageIndexs;
        }
    }

    public SetStageReceipts(stage: number) {
        this.stageReceipts = [];
        for (let index = 0; index < this.stages[stage].length; index++) {
            this.stageReceipts.push(this.GetReceipt(this.stages[stage][index]));
        }
    }

    public GetRandomStageReceipt(): Receipt {
        const index = Math.floor(Random.Range(0, this.stageReceipts.length));
        return this.stageReceipts[index];
    }

    public GetReceipt(index: number): Receipt {
        return this.receipts[index];
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
    public getCharacterSprite(character: Character): Sprite {
        return this.characterSprites[character - Character.START];
    }

    public GetCharacterSpriteByName(characterName: string): Sprite{
        const spriteIndex = this.characterSprites.findIndex((s) => s.name.split('_')[1].toLowerCase() === characterName);
        return this.characterSprites[spriteIndex];
    }

    public GetSectionSpritesByName(sectionName: string): Sprite{
        const spriteIndex = this.sectionSprites.findIndex((s) => s.name.toLowerCase() === sectionName);
        return this.sectionSprites[spriteIndex];
    }
}