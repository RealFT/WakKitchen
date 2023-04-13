import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Random, Sprite, Resources, TextAsset, PlayerPrefs } from 'UnityEngine';
import Receipt from './Receipt';
import { GameObject, Debug } from 'UnityEngine';
import CardData from './Employee/CardData';

export enum Grade {
    D = 0,
    C = 1,
    B = 2,
    A = 3,
    S = 4,
}

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
    PUNGSIN = 29,
    SOPHIA = 30,
    FREETER = 31,
    CARNARJUNGTUR = 32,
    LEEDEOKSU = 33,
    NOSFERATUHODD = 34,
    BUJUNGINGAN = 35,
    DOVE = 36,
    PARROT = 37,
    PAENCHI = 38,
    LION = 39,
    END = 39
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
    @SerializeField() private cardFile: TextAsset;
    // Define the member variables for the Receipt's sprites
    @SerializeField() private ingredientSprites: Sprite[];
    @SerializeField() private drinkSprites: Sprite[];
    @SerializeField() private sideSprites: Sprite[];
    @SerializeField() private characterSprites: Sprite[];
    @SerializeField() private characterIcons: Sprite[];
    @SerializeField() private gradeIcons: Sprite[];
    @SerializeField() private cardBackgroundSprites: Sprite[];
    @SerializeField() private sectionSprites: Sprite[];
    private receipts: Receipt[] = [];
    private stageReceipts: Receipt[] = [];
    private stages: number[][] = [];
    private cardDatas: Map<string, CardData> = new Map<string, CardData>();
    private inventoryCache: Map<string, number> = new Map<string, number>();
    private playStage: string = 'Stage';
    private lastSavedStage: number;      // last saved Day(Stage).

    Awake() {
        if (this != DataManager.GetInstance()) GameObject.Destroy(this.gameObject);
        this.LoadData();
    }

    Start() {
        // 사용 예시
        // const itemId = 'health_potion';
        // console.log(`Current ${itemId} count: ${this.getItemCount(itemId)}`);
        // this.addItem(itemId, 1);
        // console.log(`Added 1 ${itemId}, now count: ${this.getItemCount(itemId)}`);
        // const success = this.useItem(itemId,10);
        // console.log(`Tried to use ${itemId}, success: ${success}, now count: ${this.getItemCount(itemId)}`);
    }

    // Returns the value of a given key from PlayerPrefs as an integer. 
    public GetValue(key: string): number {
        if (PlayerPrefs.HasKey(key)) {
            return PlayerPrefs.GetInt(key);
        } else {
            // Returns 0 if key does not exist.
            return 0;
        }
    }

    // Sets the value of a given key in PlayerPrefs to a given value.
    public SetValue(key: string, value: number): void {
        PlayerPrefs.SetInt(key, value);
    }

    public LoadData() {    
        this.LoadSavedStage();
        this.LoadReceiptData();
        this.LoadStageData();
        this.LoadCardData();
    }

    public LoadSavedStage() {
        this.lastSavedStage = this.GetValue("Stage");
        this.SetValue("Stage", this.lastSavedStage);
    }
    public GetLastSavedStage(): number {
        return this.lastSavedStage;
    }
    public SetStage(stage: number) {
        this.SetValue("Stage", stage);
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
        const lines = this.cardFile.text.split('\n'); // split the CSV file by row
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim().replace('\r', ''); // Remove any leading/trailing whitespace and '\r' characters
            const values = line.split(','); // split the row by comma to get the values
            
            // do something with the values
            const cardData = new CardData();
            const ingredients: number[] = [];
            for (let j = 6; j < values.length; j++) {
                ingredients.push(+values[j]);
            }
            const cardId = values[1];
            cardData.SetCardData(cardId, +values[2], values[3], values[4], +values[5], +values[6], +values[7], +values[8]);
            this.cardDatas.set(cardId, cardData);

            const cardQuantity = this.GetValue(cardId);
            console.log("ID: " + cardId, " Quantity: " + cardQuantity);
            this.SetValue(cardId, cardQuantity);
            this.inventoryCache.set(cardId, cardQuantity);
        }
    }

    public GetCardData(id: string): CardData {
        return this.cardDatas.get(id);
    }

    public GetInventoryCache(): Map<string, number> {
        return this.inventoryCache;
    }

    public GetCardQuantity(id: string): number {
        return this.inventoryCache.get(id) || 0;
    }

    public GetRandomCardByGrade(grade: string): CardData | undefined {
        // 등급에 맞는 카드 목록 가져오기
        const cardsByGrade = Array.from(this.cardDatas.values()).filter(cardData => cardData.GetGrade() === grade.toLowerCase());
        
        // 랜덤 카드 선택
        if (cardsByGrade.length > 0) {
            const randomIndex = Math.floor(Math.random() * cardsByGrade.length);
            return cardsByGrade[randomIndex];
        } else {
            console.log("GetRandomCardByGrade: undefined");
            return undefined;
        }
    }
    // Adds a given quantity of cards with a given ID to the inventory.
    public AddCard(id: string, quantity: number = 1): void {
        const currentQuantity = this.inventoryCache.get(id) || 0;
        const newQuantity = currentQuantity + quantity;
        this.inventoryCache.set(id, newQuantity);
        this.SetValue(id, newQuantity);
    }

    // Uses a given quantity of cards with a given ID from the inventory.
    // Returns true if the operation is successful, false otherwise.
    public UseCard(id: string, quantity: number = 1): boolean {
        const currentQuantity = this.inventoryCache.get(id) || 0;
        // If the ID is in the inventory and the current quantity is greater than the given quantity,
        // the given quantity is subtracted from the current quantity and the new quantity is saved to PlayerPrefs.
        if (currentQuantity >= quantity) {
            const newQuantity = currentQuantity - quantity;
            this.inventoryCache.set(id, newQuantity);
            this.SetValue(id, newQuantity);
            return true;
        } else {
            console.log(`Not enough ${id} to use.`);
            return false;
        }
    }

    public GetGradeNumberByString(grade: string): Grade{
        switch (grade.toLowerCase()) {
            case "d":
                return Grade.D;
            case "c":
                return Grade.C;
            case "b":
                return Grade.B;
            case "a":
                return Grade.A;
            case "s":
                return Grade.S;
            default:
                return Grade.D;
        }
    }

    public GetGradeIconByGrade(grade: string): Sprite{
        const index = this.GetGradeNumberByString(grade);
        console.log(index);
        return this.gradeIcons[index];
    }

    public GetCardBackgroundSpriteByGrade(grade: string): Sprite{
        const index = this.GetGradeNumberByString(grade);
        return this.cardBackgroundSprites[index];
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
    public GetCharacterSprite(character: Character): Sprite {
        return this.characterSprites[character - Character.START];
    }

    public GetCharacterIcon(character: Character): Sprite {
        return this.characterIcons[character - Character.START];
    }
    public GetCharacterSpriteByName(characterName: string): Sprite{
        const spriteIndex = this.characterSprites.findIndex((s) => s.name.split('_')[1].toLowerCase() === characterName);
        return this.characterSprites[spriteIndex];
    }

    public GetSectionSpriteByName(sectionName: string): Sprite{
        const spriteIndex = this.sectionSprites.findIndex((s) => s.name.toLowerCase() === sectionName);
        return this.sectionSprites[spriteIndex];
    }
    public GetSectionSprites(): Sprite[] {
        return this.sectionSprites;
    }
}