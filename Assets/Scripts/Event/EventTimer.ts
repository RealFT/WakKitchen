import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, PlayerPrefs, Color } from 'UnityEngine';
import { Image, Button, Text, Slider } from 'UnityEngine.UI'
import { TextMeshProUGUI } from 'TMPro';
import EventSlot from './EventSlot';
import DataManager from '../DataManager';

export default class EventTimer extends ZepetoScriptBehaviour {
    @SerializeField() private eventTitleText: TextMeshProUGUI;   // 이벤트 제목
    @SerializeField() private eventDescriptionText: TextMeshProUGUI;   // 이벤트 내용
    @SerializeField() private remainingTimeText: TextMeshProUGUI;   // 다음 보상 수령까지 남은 시간을 표기하는 텍스트
    @SerializeField() private eventProgressSlider: Slider;   // 이벤트 진행도(접속시간) 표기 슬라이더
    @SerializeField() private eventSlotObjs: GameObject[];   // 이벤트 보상 슬롯 리스트
    @SerializeField() private newObj: GameObject;   // 신규 보상 수령 가능 알림 오브젝트
    private eventSlots: EventSlot[] = [];   // 이벤트 보상 슬롯 배열
    private totalEventTime: number = 60 * 60; // 이벤트 총 시간 (60분)
    private rewardInterval: number = 15 * 60; // 보상 수령 간격 (15분)
    private firstRewardDelay: number = 5 * 60; // 처음 보상 지연 시간 (5분)
    private elapsedTime: number = 0; // 경과 시간
    private interval: number = 1; // 초 단위로 세고 싶은 간격
    private redeemedIndex: number = 0; // 초 단위로 세고 싶은 간격

    OnEnable(){
        this.eventTitleText.text = DataManager.GetInstance().GetCurrentLanguageData("event_title");
        this.eventDescriptionText.text = DataManager.GetInstance().GetCurrentLanguageData("event_description");
    }

    OnDisable(){
        // 보상 획득 가능 여부 업데이트
        this.UpdateNewReward();
    }

    OnDestroy(){
        // 종료될 때 시점의 시간 저장
        DataManager.GetInstance().SetValue("time", this.elapsedTime);
        const redeemedIndex = `${this.eventSlots[0].GetSlotStatus()}_${this.eventSlots[1].GetSlotStatus()}_${this.eventSlots[2].GetSlotStatus()}_${this.eventSlots[3].GetSlotStatus()}_${this.eventSlots[4].GetSlotStatus()}`;
        PlayerPrefs.SetString("redeemedIndex", redeemedIndex);
    }

    Start() {
        // 이전에 저장된 시간 불러오기
        const savedTime = DataManager.GetInstance().GetValue("time");
        if (savedTime !== null) {
            this.elapsedTime = savedTime;
        }

        // eventSlotObjs에 등록된 EventSlot 컴포넌트를 가져와서 eventSlots에 등록
        this.eventSlotObjs.forEach((slotObj) => {
            const eventSlot = slotObj.GetComponent<EventSlot>();
            if (eventSlot) {
                this.eventSlots.push(eventSlot);
            }
        });
        this.eventTitleText.text = DataManager.GetInstance().GetCurrentLanguageData("event_title");
        this.eventDescriptionText.text = DataManager.GetInstance().GetCurrentLanguageData("event_description");
        this.StartTimer();
        this.eventSlots[0].SetSlot(5,true,"WAKKINGA");
        this.eventSlots[1].SetSlot(15,false,"3");
        this.eventSlots[2].SetSlot(30,true,"WAKBURGERHAT");
        this.eventSlots[3].SetSlot(45,false,"5");
        this.eventSlots[4].SetSlot(60,true,"WAKOVERALL");

        const redeemed = PlayerPrefs.GetString("redeemedIndex");
        const values = redeemed.split('_');
        this.eventSlots[0].SetSlotStatus(+values[0]);
        this.eventSlots[1].SetSlotStatus(+values[1]);
        this.eventSlots[2].SetSlotStatus(+values[2]);
        this.eventSlots[3].SetSlotStatus(+values[3]);
        this.eventSlots[4].SetSlotStatus(+values[4]);
    }

    private StartTimer(): void {
        const intervalId = setInterval(() => {
            if (this.IsDateWithinRange()) {
                this.elapsedTime++;

                // 시간 경과가 모든 이벤트 시간 조건을 충족시켰다면, 더이상 하지 않는다.
                if (this.elapsedTime <= this.totalEventTime) {
                    // 이벤트 진행도 업데이트
                    this.UpdateEventProgress();

                    // 남은 시간 업데이트
                    this.UpdateRemainingTime();
                }
                else {
                    this.eventProgressSlider.value = 1;
                    this.remainingTimeText.text = DataManager.GetInstance().GetCurrentLanguageData("event_clear");
                }

                // 보상 획득 가능 여부 업데이트
                this.UpdateNewReward();
            }
            else {
                // 이벤트 종료
                this.remainingTimeText.text = DataManager.GetInstance().GetCurrentLanguageData("event_time_end");
                this.UpdateNewReward();
                clearInterval(intervalId);
            }
        }, this.interval * 1000);
    }
    private UpdateEventProgress(): void {
        const progressRatio: number = this.elapsedTime / this.totalEventTime;
        this.eventProgressSlider.value = progressRatio;
    }

    private UpdateRemainingTime(): void {
        let remainingTime: number;
    
        // 첫 5분
        if (this.elapsedTime <= this.firstRewardDelay) {
            remainingTime = this.firstRewardDelay - this.elapsedTime;
        } 
        // 15분
        else {
            const timeSinceLastReward: number = this.elapsedTime % this.rewardInterval;
            remainingTime = this.rewardInterval - timeSinceLastReward;
        }
    
        this.remainingTimeText.text = this.FormatTime(remainingTime);
    }

    private UpdateNewReward(): void {
        let isNew = false;
        this.eventSlots.forEach((slot) => {
            if (slot.CheckUnlock(this.elapsedTime)) {
                isNew = true;
            }
        });
        this.newObj.SetActive(isNew);
    }

    private FormatTime(time: number): string {
        const next: string = DataManager.GetInstance().GetCurrentLanguageData("event_time_next");
        const minutes: number = Math.floor(time / 60);
        const seconds: number = time % 60;
        return `${next}: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    public IsDateWithinRange(): boolean {
        const currentDate: Date = new Date();
        const maxDate: Date = new Date('2023-07-15');

        // 클라이언트에 저장된 날짜가 2023년 7월 10일까지인지 확인
        if (currentDate <= maxDate) {
            return true;
        } else {
            return false;
        }
    }
}