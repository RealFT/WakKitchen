import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Text } from "UnityEngine.UI";
import { GameObject } from 'UnityEngine';

//define variable to use
export default class UIController extends ZepetoScriptBehaviour {
    public messageUI: Text;

    Start() {
        this.Init();
    }

    public Init() {
        this.messageUI.text = " ";
    }

    public Loading() {
        this.messageUI.text = "Let's Cook!";
    }

}