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
    private timeScale: float;    // �ð� ���

    Timer() {
        this.SetTimeScale(360.0);       // 24 * 60(�Ϸ� 1��) / n. �Ϸ� n��
        this.InitTime();
    }

    // �ð� ����
    UpdateTime() {
        // �귯�� �ð� * �ð� ���
        var seconds = Mathf.RoundToInt((Time.time - this.initTime) * this.timeScale);

        this.Hour = (seconds / this.SecondsPerHour);
        seconds -= this.Hour * this.SecondsPerHour;

        this.Minute = seconds / this.SecondsPerMinute;
        seconds -= this.Minute * this.SecondsPerMinute;

        this.Second = seconds;
    }

    // ���� ��� ����
    SetTimeScale(scale: float) {
        this.timeScale = scale;
    }

    // �ð� ���� �ʱ�ȭ.
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