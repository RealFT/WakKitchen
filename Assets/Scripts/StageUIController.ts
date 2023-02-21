import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Text } from "UnityEngine.UI";
import { GameObject } from 'UnityEngine';

//define variable to use
export default class StageUIController extends ZepetoScriptBehaviour {
    public settlementUI: GameObject;

    Start() {
        this.Init();
    }

    public Init() {
        this.SetSettlementUI(false);
    }

    public SetSettlementUI(value: boolean) {
        this.settlementUI.SetActive(value);
    }
}