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
        const rows = this.receiptFile.text.split('\n'); // split the CSV file by row
        rows.forEach((row) => {

            const values = row.split(','); // split the row by comma to get the values
            // do something with the values
            const receipt = new Receipt();
            const ingredients: number[] = [];
            for (let i = 5; i < values.length; i++) {
                ingredients.push(+values[i]);
            }
            receipt.setReceipt(+values[0], +values[1], +values[2], +values[3], values[4], ingredients);
            this.receipts.push(receipt);
        });
        Debug.Log("Loaded Receipt Data:" + rows.length);
    }

    public loadStageData() {
        const rows = this.stageFile.text.split('\n'); // split the CSV file by row
        rows.forEach((row) => {
            const values = row.split(','); // split the row by comma to get the values
            // do something with the values
            const stageIndexs = values.slice(1);
            this.stages[values[0]] = stageIndexs;
        });
        Debug.Log("Loaded Stage Data:" + rows.length);
    }

    public setStageReceipts(stage: number) {
        this.stageReceipts = [];
        Debug.Log("setStageReceipts stages[stage].length:" + this.stages[stage].length);
        for (let index = 0; index < this.stages[stage].length-1; index++) {
            Debug.Log("setStageReceipts stage index:" + this.stages[stage][index]);
            this.stageReceipts.push(this.getReceipt(this.stages[stage][index]));
            Debug.Log("setStageReceipts stage id:" + this.stageReceipts[index].id);
        }
        Debug.Log("setStageReceipts:" + this.stageReceipts.length);
    }

    public getRandomStageReceipt(stage: number): Receipt {
        Debug.Log("getRandomStageReceipt:" + this.stageReceipts.length);
        const index = Math.floor(Random.Range(0, this.stageReceipts.length));
        Debug.Log("getRandomStageReceipt index:" + index);
        Debug.Log("getRandomStageReceipt return:" + this.stageReceipts[index].id);
        return this.stageReceipts[0];
    }

    public getReceipt(index: number): Receipt {
        Debug.Log("getReceipt id:" + this.receipts[index].id);
        return this.receipts[index];
    }


}