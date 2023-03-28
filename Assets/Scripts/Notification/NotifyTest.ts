import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button } from "UnityEngine.UI";
import Mediator, { EventNames } from './Mediator';
export default class NotifyTest extends ZepetoScriptBehaviour {

    public debugBtn: Button;

    Start() {
        this.debugBtn.onClick.AddListener(()=>{
            Mediator.GetInstance().Notify(this, EventNames.StageStarted, null);
        });
    }
}