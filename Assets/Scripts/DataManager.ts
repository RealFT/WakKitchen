import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Random, Sprite, Resources, TextAsset, PlayerPrefs, Application, SystemLanguage } from 'UnityEngine';
import Receipt from './Receipt';
import { GameObject, Object, Debug } from 'UnityEngine';
import CardData from './Employee/CardData';
import { RoomData, Room } from "ZEPETO.Multiplay";
import { ZepetoWorldMultiplay } from 'ZEPETO.World';
export enum Grade {
    D = 0,
    C = 1,
    B = 2,
    A = 3,
    S = 4,
}
export enum Section {
    Dispenser = 0,
    Fryer = 1,
    Grill = 2,
    Prep = 3,
    Plating = 4
}
export enum Cost {
    TOP_BURN = 15,
    BOTTOM_BURN = 15,
    PATTY = 100,
    CABBAGE = 20,
    TOMATO = 20,
    ONION = 10,
    CHEESE = 20,
    PAENCHI = 30,
    NECKSRITE = 30,
    HOTCHS = 30,
    ORANGE = 30,
    PINEAPPLE = 30,
    FRY = 60
}
export enum Ingredient {
    START = 0,
    BOTTOM_BURN = 0,
    CABBAGE = 1,
    TOMATO = 2,
    PATTY = 3,
    CHEESE = 4,
    ONION = 5,
    TOP_BURN = 6,
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
    @SerializeField() private costFile: TextAsset;
    @SerializeField() private stageFile: TextAsset;
    @SerializeField() private unlockStageFile: TextAsset;
    @SerializeField() private cardFile: TextAsset;
    @SerializeField() private lang_ko: TextAsset;
    @SerializeField() private lang_en: TextAsset;
    @SerializeField() private lang_jp: TextAsset;
    // Define the member variables for the Receipt's sprites
    @SerializeField() private ingredientSprites: Sprite[];
    @SerializeField() private drinkSprites: Sprite[];
    @SerializeField() private sideSprites: Sprite[];
    @SerializeField() private characterSprites: Sprite[];
    @SerializeField() private characterCardSprites: Sprite[];
    @SerializeField() private characterIcons: Sprite[];
    @SerializeField() private gradeIcons: Sprite[];
    @SerializeField() private cardBackgroundSprites: Sprite[];
    @SerializeField() private cardFrameSprites: Sprite[];
    @SerializeField() private sectionSprites: Sprite[];

    private textContents_ko: Map<string, string> = new Map<string, string>();
    private textContents_en: Map<string, string> = new Map<string, string>();
    private textContents_jp: Map<string, string> = new Map<string, string>();
    private langCode: string;    // Language Setting

    private receipts: Receipt[] = [];
    private stageReceipts: Receipt[] = [];
    private costs: Map<number, number> = new Map<number, number>();

    private stages: number[][] = [];
    private unlockStages: Map<string, number> = new Map<string, number>();

    private cardDatas: Map<string, CardData> = new Map<string, CardData>();
    private inventoryCache: Map<string, number> = new Map<string, number>();

    private lastSavedStage: number;      // last saved Day(Stage).
    private _multiplay: ZepetoWorldMultiplay;
    private _room: Room
    
    Awake() {
        if (this != DataManager.GetInstance()) GameObject.Destroy(this.gameObject);
        this.SetAreaLangCode();
        this.LoadData();
    }

    Start() {
        this._multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
        this._multiplay.RoomJoined += (room: Room) => {
            this._room = room;
            this.InitMessageHandler();
        }
    }

    private async InitMessageHandler() {
        this._room.AddMessageHandler("onGetStorageResult", (message) => {
            // message가 data 처리
            if(message == "") {
                console.warn("no have data");
                return;
            }
            // const result: string = message as string;
            // const values = result.split('_');
            // switch (values[0]) {
            //     case "time":
            //         break;
            //     case "Stage":
            //         break;
            //     case "wakdu":
            //         break;
            // }
        });
    }

    public SetData(key: string, value: string) {
        if(this._multiplay.Room == null){
            console.warn("server disconnect");
            return;
        }
        const data = new RoomData();
        data.Add("key", key);
        data.Add("value", value);
        this._multiplay.Room?.Send("onSetStorage", data.GetObject());
    }

    public GetData(key: string) {
        if(this._multiplay.Room == null){
            console.warn("server disconnect");
            return;
        }
        const data = new RoomData();
        data.Add("key", key);
        this._multiplay.Room?.Send("onGetStorage", data.GetObject());
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
    public GetStrValue(key: string): string {
        if (PlayerPrefs.HasKey(key)) {
            return PlayerPrefs.GetString(key);
        } else {
            // Returns "" if key does not exist.
            return "";
        }
    }

    // Sets the value of a given key in PlayerPrefs to a given value.
    public SetValue(key: string, value: number): void {
        PlayerPrefs.SetInt(key, value);
    }
    // Sets the value of a given key in PlayerPrefs to a given value.
    public SetStrValue(key: string, value: string): void {
        PlayerPrefs.SetString(key, value);
    }    // Sets the value of a given key in PlayerPrefs to a given value.

    public LoadData() {    
        this.LoadAllLanguageData();
        this.LoadSavedStage();
        this.LoadCostData();
        this.LoadReceiptData();
        this.LoadStageData();
        this.LoadUnlockStageData();
        this.LoadCardData();
    }
    public DebugStage() {
        this.lastSavedStage = 1;
        this.SetValue("Stage", this.lastSavedStage);
    }
    public DebugStageNoHelp() {
        this.lastSavedStage = 29;
        this.SetValue("Stage", this.lastSavedStage);
    }
    public LoadSavedStage() {
        this.lastSavedStage = 29;
        //this.SetValue("Stage", this.lastSavedStage);
        //this.lastSavedStage = this.GetValue("Stage");
        //값이 없을 경우 0 리턴. 처음 시작은 1스테이지부터.
        if(this.lastSavedStage == 0) this.lastSavedStage = 1;
        this.SetValue("Stage", this.lastSavedStage);
    }
    public GetLastSavedStage(): number {
        return this.lastSavedStage;
    }
    public SetStage(stage: number) {
        this.SetValue("Stage", stage);
        this.lastSavedStage = stage;
    }
    public LoadCostData() {
        const lines = this.costFile.text.split('\n'); // split the CSV file by row
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim().replace('\r', ''); // Remove any leading/trailing whitespace and '\r' characters
            const values = line.split(','); // split the row by comma to get the values
            
            // do something with the values
            const index = +values[0];
            const cost = +values[1];
            this.costs.set(index, cost);
        }
    }
    public LoadReceiptData() {
        const lines = this.receiptFile.text.split('\n'); // split the CSV file by row
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim().replace('\r', ''); // Remove any leading/trailing whitespace and '\r' characters
            const values = line.split(','); // split the row by comma to get the values

            // do something with the values
            const receipt = new Receipt();
            let price = 0;
            const ingredients: number[] = [];
            for (let j = 3; j < values.length; j++) {
                ingredients.push(+values[j]);
                price += this.costs.get(+values[j]);
            }
            console.log("receipe:" + ingredients);
            // 오류 발생 시 해당 레시피 드랍
            if (ingredients[0] != 0) continue;
            // 값이 -1이 아닐 경우 무작위 drink 하나 선정
            const drink = +values[1] == -1 ? -1 : Math.floor(Math.random() * (Drink.END - Drink.START)) + Drink.START;
            if(drink != -1) price += this.costs.get(drink);
            // 값이 -1이 아닐 경우 무작위 side 하나 선정
            const side = +values[2] == -1 ? -1 : Math.floor(Math.random() * (Side.END - Side.START)) + Side.START;
            if(side != -1) price += this.costs.get(side);

            // values[3]이 캐릭터이나, 현재 사용하지 않는 데이터.
            let customer = Math.floor(Math.random() * (Character.END - Character.START)) + Character.START;
            // 캐릭터 블락(임시)
            switch (customer) {
                case Character.CHUNSIK:
                case Character.NOSFERATUHODD:
                    customer = Character.SOPHIA;
                    break;
                case Character.FREETER:
                case Character.WAKGOOD:
                case Character.DANDAPBUG:
                    customer = Character.HYEJI;
                    break;
                // 다른 Character 값들에 대한 처리...
                default:
                    // 기본 처리 로직
                    break;
            }
            switch(+values[0]){
                // 치즈만 있는 레시피들은 전부 단답벌레로 변경
                case 10:
                case 11:
                case 30:
                case 44:
                case 45:
                case 69:
                case 83:
                case 84:
                case 108:
                case 122:
                case 123:
                case 147:
                case 176:
                case 224:
                    customer = Character.DANDAPBUG;
                    break;
            }
            // 도둑 캐릭터의 경우 price가 0
            if(customer == Character.SOPHIA) price = 0;
            // 캐릭터에 맞는 언어 데이터 랜덤하게 가져오기
            const randomIndex = Math.floor(Math.random() * 3 + 1);  // 1~3
            const langCode = `receipts_${customer}_${randomIndex}`;
            receipt.SetReceipt(+values[0], price, drink, side, customer, langCode, ingredients);
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

    public LoadUnlockStageData() {
        const lines = this.unlockStageFile.text.split('\n'); // split the CSV file by row
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim().replace('\r', ''); // Remove any leading/trailing whitespace and '\r' characters
            const values = line.split(','); // split the row by comma to get the values
            
            // do something with the values
            const target = values[1];
            const stage = +values[2];
            this.unlockStages.set(target, stage);
        }
    }

    public SetStageReceipts(stageIndex: number) {
        // 길이가 충분하다면, 더이상 반복작업을 하지 않는다.
        if(this.stageReceipts.length >= 316) return;
        this.stageReceipts = [];
        // 최대 인덱스에 도달했을 경우, 데이터 길이가 1이다.
        // 이 값은 최대 레시피 개수가 기록된다.
        if (this.stages.length <= stageIndex + 1) {
            // 이제부터 모든 레시피를 등록
            const maxStage = this.stages.length - 1;
            const maxIndex = this.stages[maxStage][0];
            for (let index = 0; index <= maxIndex; index++) {
                this.stageReceipts.push(this.GetReceipt(index));
            }
        }
        else {
            for (let index = 0; index < this.stages[stageIndex].length; index++) {
                this.stageReceipts.push(this.GetReceipt(this.stages[stageIndex][index]));
            }
        }
    }
    // ----------- Language -------------
    public LoadAllLanguageData() {
        if(PlayerPrefs.HasKey("Language")){
            this.SetLangCode(PlayerPrefs.GetString("Language"));
        }
        else{
            this.SetAreaLangCode();
        }
        if(this.lang_ko) this.textContents_ko = this.LoadLanguageData(this.lang_ko);
        if(this.lang_en) this.textContents_en = this.LoadLanguageData(this.lang_en);
        if(this.lang_jp) this.textContents_jp = this.LoadLanguageData(this.lang_jp);
    }

    public LoadLanguageData(textAsset: TextAsset): Map<string, string> {
        const textContents = new Map<string, string>();
        const lines = textAsset.text.split('\n'); // split the CSV file by row
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim().replace('\r', ''); // Remove any leading/trailing whitespace and '\r' characters
            // Custom CSV parsing logic
            const values = [];
            let currentValue = '';
            let withinQuotes = false;

            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === '"') {
                    withinQuotes = !withinQuotes;
                } else if (char === ',' && !withinQuotes) {
                    values.push(currentValue.trim());
                    currentValue = '';
                } else if(char === '\\') {
                    currentValue += "\n";
                } else {
                    currentValue += char;
                }
            }

            values.push(currentValue.trim());

            // do something with the values
            const key = values[0];
            const contents = values[1];
            textContents.set(key, contents);
        }
        return textContents;
    }

    private SetAreaLangCode(){
        // 사용자의 지역 정보 가져오기
        switch(Application.systemLanguage){
            case SystemLanguage.Korean:
                this.langCode = "ko"; // 사용자가 한국어를 사용하는 경우
                break;
            case SystemLanguage.English:
                this.langCode = "en"; // 기본 언어 설정 (영어)
                break;
            case SystemLanguage.Japanese:
                this.langCode = "jp"; // 기본 언어 설정 (영어)
                break;
        }
        PlayerPrefs.SetString("Language", this.langCode);
    }

    public SetLangCode(langCode: string){
        this.langCode = langCode;
        PlayerPrefs.SetString("Language", this.langCode);
    }
    public GetLangCode(): string{
        return this.langCode;
    }
    public GetCurrentLanguageData(key:string): string {
        switch(this.langCode){
            case "ko":
                return this.textContents_ko?.get(key);
            case "en":
                return this.textContents_en?.get(key);
            case "jp":
                return this.textContents_jp?.get(key);
            default:
                // console.log("langCode error");
                return null;
        }
    }
    // ----------- Language -------------


    // ----------- Card -------------
    public LoadCardData() {
        const lines = this.cardFile.text.split('\n'); // split the CSV file by row
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim().replace('\r', ''); // Remove any leading/trailing whitespace and '\r' characters
            const values = line.split(','); // split the row by comma to get the values
            
            // do something with the values
            const cardData = new CardData();

            const cardId = values[1];
            cardData.SetCardData(cardId, +values[2], values[3], values[4], +values[5], +values[6], +values[7], +values[8]);
            this.cardDatas.set(cardId, cardData);

            const cardQuantity = this.GetValue(cardId);
            // console.log("ID: " + cardId, " Quantity: " + cardQuantity);
            this.SetValue(cardId, cardQuantity);
            this.inventoryCache.set(cardId, cardQuantity);
        }
    }

    public GetCardData(id: string): CardData {
        return this.cardDatas.get(id);
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
            // console.log("GetRandomCardByGrade: undefined");
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
            // console.log(`Not enough ${id} to use.`);
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

    public GetCardFrameByGrade(grade: string): Sprite{
        const index = this.GetGradeNumberByString(grade);
        return this.cardFrameSprites[index];
    }
    // ----------- Card -------------
    

    public GetInventoryCache(): Map<string, number> {
        return this.inventoryCache;
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
        if (product <= Ingredient.END)
            return this.getIngredientSprite(product);
        else if (product <= Drink.END)
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
    
    // Return sprite of the character
    public GetCharacterCardSprite(character: Character): Sprite {
        return this.characterCardSprites[character - Character.START];
    }
    
    public GetCharacterIcon(character: Character): Sprite {
        return this.characterIcons[character - Character.START];
    }
    public GetCharacterSpriteByName(characterName: string): Sprite{
        const spriteIndex = this.characterSprites.findIndex((s) => s.name.split('_')[1].toLowerCase() === characterName);
        return this.characterSprites[spriteIndex];
    }

    public GetSectionSpriteByName(sectionName: string): Sprite{
        const spriteIndex = this.sectionSprites?.findIndex((s) => s.name.toLowerCase() === sectionName);
        return this.sectionSprites[spriteIndex];
    }
    public GetUnlockStageByName(name: string): number{
        const unlockStage = this.unlockStages?.get(name);
        return unlockStage;
    }
    public GetIsUnlockByName(name: string): boolean{
        const unlockStage = this.unlockStages?.get(name);
        return this.lastSavedStage >= unlockStage;
    }
    public CheckUnlockByStage(stage: number): string | undefined {
        for (const [key, value] of this.unlockStages) {
            if (value === stage) {
                return key;
            }
        }
        return undefined;
    }
    public GetSectionSprites(): Sprite[] {
        return this.sectionSprites;
    }
}