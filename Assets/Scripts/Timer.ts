import { SceneManager } from 'UnityEngine.SceneManagement';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Debug } from "UnityEngine";
import { Mathf, Time } from "UnityEngine";
import { Button, Image, Slider } from "UnityEngine.UI";

export default class Timer extends ZepetoScriptBehaviour {
    private timeScale: number;    // The time scale for the game

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

    // Update the time based on the elapsed time
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

    // Set the time scale based on the number of minutes per day
    SetTimeScale(minutesPerDay: number) {
        this.timeScale = 24 * 60 / minutesPerDay; // 24 * 60 (1 minute per day) / n minutes per day
    }

    // Set the time to the specified hour and minute
    SetTime(hour: number, minute: number) {
        this.elapsedTime = hour * this.secondsPerHour + minute * this.secondsPerMinute;
    }

    // Initialize the time information
    InitTime() {
        this.elapsedTime = 0;
    }

    // Get the current hour
    GetHour(): number {
        return this.Hour;
    }
    
    // Get the current minute
    GetMinute(): number {
        return this.Minute;
    }
}