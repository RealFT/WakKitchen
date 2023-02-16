import { SceneManager } from 'UnityEngine.SceneManagement';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Debug } from "UnityEngine";
import { Mathf, Time } from "UnityEngine";
import { Button, Image, Slider } from "UnityEngine.UI";

export default class Timer extends ZepetoScriptBehaviour {
    private timeScale: number;    // 시간 배속

    public Day: number;
    public Hour: number;
    public Minute: number;
    public Second: number;

    private secondsPerMinute: number = 60;
    private secondsPerHour: number = 60 * this.secondsPerMinute;
    private secondsPerDay: number = 24 * this.secondsPerHour;

    private elapsedTime: number = 0;

    constructor() {
        super();
        this.InitTime();
    }

    // 시간 갱신
    UpdateTime() {
        this.elapsedTime += Time.deltaTime * this.timeScale;
        let seconds = Math.floor(this.elapsedTime);

        this.Day = Math.floor(seconds / this.secondsPerDay);
        seconds -= this.Day * this.secondsPerDay;

        this.Hour = Math.floor(seconds / this.secondsPerHour);
        seconds -= this.Hour * this.secondsPerHour;

        this.Minute = Math.floor(seconds / this.secondsPerMinute);
        seconds -= this.Minute * this.secondsPerMinute;

        this.Second = seconds;
    }

    // 게임 배속 설정
    SetTimeScale(minutesPerDay: number) {
        this.timeScale = 24 * 60 / minutesPerDay; // 24 * 60(하루 1분) / n. 하루 n분
        Debug.Log(this.timeScale);
        Debug.Log(this.Hour + ":" + this.Minute);
    }

    SetTime(hour: number, minute: number) {
        this.elapsedTime = hour * this.secondsPerHour + minute * this.secondsPerMinute;
    }

    // 시간 정보 초기화.
    InitTime() {
        this.elapsedTime = 0;
    }

    GetHour(): number {
        return this.Hour;
    }

    GetMinute(): number {
        return this.Minute;
    }
}