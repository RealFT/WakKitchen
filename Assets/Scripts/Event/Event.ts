import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Color } from 'UnityEngine';
import { Image, Button, Text, Slider } from 'UnityEngine.UI'
import { TextMeshProUGUI } from 'TMPro';
import EventSlot from './EventSlot';
export default class Event extends ZepetoScriptBehaviour {
    @SerializeField() private eventTitleText: TextMeshProUGUI;   // 이벤트 제목
    @SerializeField() private eventDescriptionText: TextMeshProUGUI;   // 이벤트 내용
    @SerializeField() private remainingTimeText: TextMeshProUGUI;   // 다음 보상 수령까지 남은 시간을 표기하는 텍스트
    @SerializeField() private eventProgressSlider: Slider;   // 이벤트 진행도(접속시간) 표기 슬라이더
    @SerializeField() private eventSlotObjs: GameObject[];   // 이벤트 보상 슬롯 리스트
    private eventSlots: EventSlot[] = [];   // 이벤트 보상 슬롯 배열
    private totalEventTime: number = 60 * 60; // 이벤트 총 시간 (60분)
    private rewardInterval: number = 15 * 60; // 보상 수령 간격 (15분)
    private firstRewardDelay: number = 5 * 60; // 처음 보상 지연 시간 (5분)
    private elapsedTime: number = 0; // 경과 시간
    private interval: number = 1; // 초 단위로 세고 싶은 간격

    Start() {
        // eventSlotObjs에 등록된 EventSlot 컴포넌트를 가져와서 eventSlots에 등록
        this.eventSlotObjs.forEach((slotObj) => {
            const eventSlot = slotObj.GetComponent<EventSlot>();
            if (eventSlot) {
                this.eventSlots.push(eventSlot);
            }
        });
        this.StartTimer();
    }

    private StartTimer(): void {
        setInterval(() => {
            this.elapsedTime++;

            // 이벤트 진행도 업데이트
            this.UpdateEventProgress();

            // 남은 시간 업데이트
            this.UpdateRemainingTime();

            // 보상 수령 가능 체크
            this.CheckRewardAvailability();
        }, this.interval * 1000);
    }
    private UpdateEventProgress(): void {
        const progressRatio: number = this.elapsedTime / this.totalEventTime;
        this.eventProgressSlider.value = progressRatio;
    }

    private UpdateRemainingTime(): void {
        let remainingTime: number;
    
        if (this.elapsedTime <= this.firstRewardDelay) {
            remainingTime = this.firstRewardDelay - this.elapsedTime;
        } else {
            const timeSinceLastReward: number = (this.elapsedTime - this.firstRewardDelay) % this.rewardInterval;
            remainingTime = this.rewardInterval - timeSinceLastReward;
        }
    
        this.remainingTimeText.text = this.FormatTime(remainingTime);
    }

    private CheckRewardAvailability(): void {
        // const currentTime: number = this.elapsedTime - this.firstRewardDelay;

        // this.eventSlots.forEach((eventSlot) => {
        //     if (eventSlot.slotStatus === "locked") {
        //         if (currentTime >= eventSlot.unlockTime) {
        //             eventSlot.slotStatus = "unlocked";
        //             // 잠금 해제 시 처리 로직 추가
        //         }
        //     } else if (eventSlot.slotStatus === "unlocked") {
        //         if (currentTime >= eventSlot.unlockTime + this.rewardInterval) {
        //             eventSlot.slotStatus = "redeemable";
        //             // 수령 가능 상태로 변경 시 처리 로직 추가
        //         }
        //     }
        // });
    }

    private FormatTime(time: number): string {
        const minutes: number = Math.floor(time / 60);
        const seconds: number = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}