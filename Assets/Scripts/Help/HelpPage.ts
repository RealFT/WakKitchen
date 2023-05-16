import { Button } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { TextMeshProUGUI } from 'TMPro';

export default class HelpPage extends ZepetoScriptBehaviour {
    @SerializeField() private prevBtn: Button;
    @SerializeField() private nextBtn: Button;
    @SerializeField() private discription: TextMeshProUGUI;

    public GetPrevBtn(): Button{
        return this.prevBtn;
    }
    public GetNextBtn(): Button{
        return this.nextBtn;
    }

    public SetDiscription(text: string){
        this.discription.text = text;
    }

}