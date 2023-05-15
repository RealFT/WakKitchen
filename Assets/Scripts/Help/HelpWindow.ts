import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, Image, Slider } from "UnityEngine.UI";
import { GameObject, Sprite, WaitForSeconds, Debug, Time } from 'UnityEngine';
import { TextMeshProUGUI } from 'TMPro';
export default class HelpWindow extends ZepetoScriptBehaviour {

    @SerializeField() private background: Image;
    @SerializeField() private helpText: TextMeshProUGUI;

    public SetBackgroundAlpha(alpha: number){
        this.background.color.a = alpha;
    }

    public GetHelpText(): TextMeshProUGUI{
        return this.helpText;
    }
}