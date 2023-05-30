import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { TMP_InputField, TextMeshProUGUI } from 'TMPro';
import { Button } from "UnityEngine.UI";
import DataManager from '../DataManager';
import SoundManager from '../SoundManager';

export default class RedeemCodePanel extends ZepetoScriptBehaviour {
    @SerializeField() private mainText: TextMeshProUGUI;
    @SerializeField() private infoText: TextMeshProUGUI;
    @SerializeField() private redeemCode: TMP_InputField;
    @SerializeField() private closeButton: Button;

    Start() {
        this.closeButton.onClick.AddListener(()=>{
            this.gameObject.SetActive(false);
            SoundManager.GetInstance().OnPlayButtonSFX("Button_Close");
        });
    }

    OnEnable(){
        this.RefreshText();
    }

    private RefreshText(){
        this.mainText.text = DataManager.GetInstance().GetCurrentLanguageData("redeem_main");
        this.infoText.text = DataManager.GetInstance().GetCurrentLanguageData("redeem_info");
    }

    public SetRedeemCode(code: string) {
        this.redeemCode.text = code;
    }
}