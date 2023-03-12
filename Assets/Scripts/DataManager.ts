import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Random, Resources, TextAsset } from 'UnityEngine';
import Receipt from './Receipt';
import { GameObject, Debug } from 'UnityEngine';

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

    public receiptFile: TextAsset;
    public stageFile: TextAsset;
    private receipts: Receipt[] = [];
    private stageReceipts: Receipt[] = [];
    private stages: number[][] = [];

    Awake() {
        if (this != DataManager.GetInstance()) GameObject.Destroy(this.gameObject);
        this.loadData();
    }

    public loadData() {    
        this.loadReceiptData();
        this.loadStageData();
    }

    public loadReceiptData() {
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
            receipt.setReceipt(+values[0], +values[1], +values[2], +values[3], +values[4], values[5], ingredients);
            this.receipts.push(receipt);
        };
    }

    public loadStageData() {
        const lines = this.stageFile.text.split('\n'); // split the CSV file by row
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim().replace('\r', ''); // Remove any leading/trailing whitespace and '\r' characters
            const values = line.split(','); // split the row by comma to get the values
            
            // do something with the values
            const stageIndexs = values.slice(1);
            this.stages[values[0]] = stageIndexs;
        }
    }

    public setStageReceipts(stage: number) {
        this.stageReceipts = [];
        for (let index = 0; index < this.stages[stage].length; index++) {
            this.stageReceipts.push(this.getReceipt(this.stages[stage][index]));
        }
    }

    public getRandomStageReceipt(): Receipt {
        const index = Math.floor(Random.Range(0, this.stageReceipts.length));
        return this.stageReceipts[index];
    }

    public getReceipt(index: number): Receipt {
        return this.receipts[index];
    }
}