import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Color, Sprite } from 'UnityEngine';
import { Image, Button, Text, Slider } from 'UnityEngine.UI'
import { TextMeshProUGUI } from 'TMPro';
import DataManager from '../DataManager';
import SoundManager from '../SoundManager';
import RedeemCodePanel from './RedeemCodePanel';
import UIManager from '../UIManager';

export default class EventSlot extends ZepetoScriptBehaviour {
    @SerializeField() private rewardImage: Image;   // 보상 이미지
    @SerializeField() private background: Image;   // 보상 배경. 수령 시 색상(혹은 이미지)가 변경됨.
    @SerializeField() private backDefault: Color;   // 보상 배경. 수령 시 색상(혹은 이미지)가 변경됨.
    @SerializeField() private backRedeem: Color;   // 보상 배경. 수령 시 색상(혹은 이미지)가 변경됨.
    @SerializeField() private redeemButton: Button;   // 보상 수령 버튼
    @SerializeField() private redeemButtonColor: Color;   // 잠금 버튼
    @SerializeField() private redeemColor: Color;   // 잠금 버튼
    @SerializeField() private lockButtonColor: Color;   // 잠금 버튼
    @SerializeField() private lockColor: Color;   // 잠금 버튼
    @SerializeField() private redeemTimeText: TextMeshProUGUI;   // 보상 수령 시간 텍스트
    @SerializeField() private redeemButtonText: TextMeshProUGUI;   // 보상 수령 버튼 텍스트
    @SerializeField() private rewardIcon: Image;   // 슬라이더 보상 아이콘
    @SerializeField() private redeemObj: GameObject;   // 슬라이더 보상 아이콘
    private redeemPanel: RedeemCodePanel;   // redeem panel
    private unlockTime: number;  // 잠금 해제 시간
    public slotStatus: number; // 슬롯 상태 (0: "locked",1: "unlocked",2: "redeemed")
    public isCode: boolean; // 코드 사용 여부
    public redeemValue: string; // 보상 관련 값

    OnEnable(){
        this.SetSlotStatus(this.slotStatus);
    }

    Start(){
        this.redeemButton.onClick.AddListener(()=>{
            this.SetSlotStatus(2);
            SoundManager.GetInstance().OnPlaySFX("Purchase");
            if(this.isCode){
                //  Activate redeem panel
                this.redeemPanel = this.redeemObj.GetComponent<RedeemCodePanel>();
                this.redeemObj.SetActive(true);
                this.redeemPanel.SetRedeemCode(this.redeemValue);
            } else {
                // Give normal item
                this.GetNormalItem(+this.redeemValue);
            }
        });
    }

    private GetNormalItem(rewardAmount: number){
        if(rewardAmount == undefined) return;
        // Grant the daily reward
        let currentWakdu: number = DataManager.GetInstance().GetValue("wakdu");
        currentWakdu += rewardAmount;
        if(currentWakdu >= 12) {
            UIManager.GetInstance().OpenInformation(DataManager.GetInstance().GetCurrentLanguageData("info_stampfull"));
            this.SetSlotStatus(1);
            return;
        }
        DataManager.GetInstance().SetValue("wakdu", currentWakdu);
    }

    public SetSlot(unlockTime: number, hasCode: boolean, value: string) {
        this.SetSlotStatus(0);
        this.unlockTime = unlockTime;
        this.redeemTimeText.text = `${unlockTime}min`;
        this.isCode = hasCode;
        this.redeemValue = value;
    }

    // private Refresh
    public CheckUnlock(elapsedTime: number): bool {
        // 잠겨있을 경우에만 동작
        if (this.slotStatus == 2) return false;
        if(this.slotStatus == 1) return true;
        // 해금 시간이 되었을 경우
        if (elapsedTime >= this.unlockTime * 60) {
            // 보상 수령 가능한 상태
            this.SetSlotStatus(1);
            return true;
        }else return false;
    }

    public SetSlotStatus(status: number){
        this.slotStatus = status;
        // Status does not go to 2 if there is a redem code.
        if(this.isCode && status == 2) this.slotStatus = 1;
        switch(this.slotStatus){
            case 0:
                // 잠긴 상태
                this.redeemButton.image.color = this.redeemButtonColor;
                this.redeemButtonText.color = this.lockColor;
                this.redeemButton.interactable = false;
                this.redeemButtonText.text = DataManager.GetInstance().GetCurrentLanguageData("event_redeem_lock");
                this.redeemButtonText.text = "Locked";
                this.background.color = this.backDefault;
                this.rewardIcon.color = new Color(0.5, 0.5, 0.5, 1);
                break;
            case 1:            
                // 보상 수령 가능한 상태
                this.redeemButton.image.color = this.redeemButtonColor;
                this.redeemButtonText.color = this.redeemColor;
                this.redeemButton.interactable = true;
                this.redeemButtonText.text = DataManager.GetInstance().GetCurrentLanguageData("event_redeem_unlock");
                this.redeemButtonText.text = "REDEEM!";
                this.background.color = this.backRedeem;
                this.rewardIcon.color = new Color(1, 1, 1, 1);
                break;
            case 2:
                // 보상 이미 수령한 상태
                this.redeemButton.image.color = this.redeemButtonColor;
                this.redeemButtonText.color = this.lockColor;
                this.redeemButton.interactable = false;
                this.redeemButtonText.text = DataManager.GetInstance().GetCurrentLanguageData("event_redeem_redeemed");
                this.redeemButtonText.text = "REDEEMED";
                this.background.color = this.backRedeem;
                this.rewardIcon.color = new Color(1, 1, 1, 1);
                break;
        }
    }

    public GetSlotStatus():number{
        return this.slotStatus;
    }
}