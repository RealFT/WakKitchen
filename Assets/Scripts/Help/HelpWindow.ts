import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, Image, Slider } from "UnityEngine.UI";
import { GameObject, Sprite, WaitForSeconds, Debug, Time } from 'UnityEngine';
import { TextMeshProUGUI } from 'TMPro';
export default class HelpWindow extends ZepetoScriptBehaviour {
    @SerializeField() private helpText: TextMeshProUGUI;

    public GetHelpText(): TextMeshProUGUI{
        return this.helpText;
    }
}