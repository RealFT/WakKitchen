import { SceneManager } from 'UnityEngine.SceneManagement';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Debug } from "UnityEngine";
import { Mathf, Time } from "UnityEngine";
import { Button, Image, Slider } from "UnityEngine.UI";

export default class Timer extends ZepetoScriptBehaviour {
    private SecondsPerMinute: int = 60;
    private SecondsPerHour: int = 60 * this.SecondsPerMinute;

    public Hour: int;
    public Minute: int
    public Second: int

    private initTime: float;
    private timeScale: float;    // 시간 배속

    Timer() {
        this.SetTimeScale(360.0);       // 24 * 60(하루 1분) / n. 하루 n분
        this.InitTime();
    }

    // 시간 갱신
    UpdateTime() {
        // 흘러간 시간 * 시간 배속
        var seconds = Mathf.RoundToInt((Time.time - this.initTime) * this.timeScale);

        this.Hour = (seconds / this.SecondsPerHour);
        seconds -= this.Hour * this.SecondsPerHour;

        this.Minute = seconds / this.SecondsPerMinute;
        seconds -= this.Minute * this.SecondsPerMinute;

        this.Second = seconds;
    }

    // 게임 배속 설정
    SetTimeScale(scale: float) {
        this.timeScale = scale;
    }

    // 시간 정보 초기화.
    InitTime() {
        this.initTime = Time.time;
    }

    GetHour(): int {
        return this.Hour;
    }

    GetMinute(): int {
        return this.Minute;
    }
}