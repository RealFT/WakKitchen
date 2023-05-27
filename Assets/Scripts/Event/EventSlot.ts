import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Color } from 'UnityEngine';
import { Image, Button, Text, Slider } from 'UnityEngine.UI'
import { TextMeshProUGUI } from 'TMPro';
import DataManager from '../DataManager';
export default class EventSlot extends ZepetoScriptBehaviour {
    @SerializeField() private rewardImage: Image;   // 보상 이미지
    @SerializeField() private background: Image;   // 보상 배경. 수령 시 색상(혹은 이미지)가 변경됨.
    @SerializeField() private redeemButton: Button;   // 보상 수령 버튼
    @SerializeField() private redeemButtonColor: Color;   // 잠금 버튼
    @SerializeField() private redeemColor: Color;   // 잠금 버튼
    @SerializeField() private lockButtonColor: Color;   // 잠금 버튼
    @SerializeField() private lockColor: Color;   // 잠금 버튼
    @SerializeField() private redeemTimeText: TextMeshProUGUI;   // 보상 수령 시간 텍스트
    @SerializeField() private redeemButtonText: TextMeshProUGUI;   // 보상 수령 버튼 텍스트
    private unlockTime: number;  // 잠금 해제 시간
    public slotStatus: number; // 슬롯 상태 (0: "locked",1: "unlocked",2: "redeemed")

    OnEnable(){
        this.SetSlotStatus(this.slotStatus);
    }

    Start(){
        this.redeemButton.onClick.AddListener(()=>{
            this.SetSlotStatus(2);
        });
    }

    public SetSlot(unlockTime: number) {
        this.SetSlotStatus(0);
        this.unlockTime = unlockTime;
        this.redeemTimeText.text = `${unlockTime}min`;
    }

    // private Refresh
    public CheckUnlock(elapsedTime: number): void {
        // 잠겨있을 경우에만 동작
        if(this.slotStatus != 0) return;
        // 해금 시간이 되었을 경우
        if (elapsedTime >= this.unlockTime) {
            // 보상 수령 가능한 상태
            this.SetSlotStatus(1);
        }
    }

    public SetSlotStatus(status: number){
        this.slotStatus = status;
        switch(status){
            case 0:
                // 잠긴 상태
                this.redeemButton.image.color = this.redeemButtonColor;
                this.redeemButtonText.color = this.lockColor;
                this.redeemButton.interactable = false;
                this.redeemButtonText.text = DataManager.GetInstance().GetCurrentLanguageData("event_redeem_lock");
                this.redeemButtonText.text = "Locked";
                break;
            case 1:            
                // 보상 수령 가능한 상태
                this.redeemButton.image.color = this.redeemButtonColor;
                this.redeemButtonText.color = this.redeemColor;
                this.redeemButton.interactable = true;
                this.redeemButtonText.text = DataManager.GetInstance().GetCurrentLanguageData("event_redeem_unlock");
                this.redeemButtonText.text = "REDEEM!";
                break;
            case 2:
                // 보상 이미 수령한 상태
                this.redeemButton.image.color = this.redeemButtonColor;
                this.redeemButtonText.color = this.lockColor;
                this.redeemButton.interactable = false;
                this.redeemButtonText.text = DataManager.GetInstance().GetCurrentLanguageData("event_redeem_redeemed");
                this.redeemButtonText.text = "REDEEMED";
                break;
        }
    }
}