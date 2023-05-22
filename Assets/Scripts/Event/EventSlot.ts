import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Color } from 'UnityEngine';
import { Image, Button, Text, Slider } from 'UnityEngine.UI'
import { TextMeshProUGUI } from 'TMPro';
import DataManager from '../DataManager';
export default class EventSlot extends ZepetoScriptBehaviour {
    @SerializeField() private rewardImage: Image;   // 보상 이미지
    @SerializeField() private background: Image;   // 보상 배경. 수령 시 색상(혹은 이미지)가 변경됨.
    @SerializeField() private redeemButton: Button;   // 보상 수령 버튼
    @SerializeField() private lockButton: Button;   // 잠금 버튼
    @SerializeField() private redeemTimeText: TextMeshProUGUI;   // 보상 수령 시간 텍스트
    @SerializeField() private redeemButtonText: TextMeshProUGUI;   // 보상 수령 버튼 텍스트
    private unlockTime: number;  // 잠금 해제 시간
    public slotStatus: string; // 슬롯 상태 ("locked", "unlocked", "redeemable")

    OnEnable(){
        this.redeemButtonText.text = DataManager.GetInstance().GetCurrentLanguageData("event_")
    }

    public SetSlot(unlockTime: number) {
        this.slotStatus = "locked";
        this.unlockTime = unlockTime;
    }

    // private Refresh

    public CheckRewardAvailability(elapsedTime: number): void {
        // if (this.isRedeemed) {
        //     // 보상 이미 수령한 상태
        //     this.redeemButton.interactable = false;
        //     this.redeemButtonText.text = "REDEEMED";
        // } else if (this.isLocked) {
        //     // 잠긴 상태
        //     this.redeemButton.interactable = false;
        //     this.redeemButtonText.text = "Locked";
        // } else {
        //     // 보상 수령 가능한 상태
        //     this.redeemButton.interactable = true;
        //     this.redeemButtonText.text = "REDEEM!";
        // }
    }
}