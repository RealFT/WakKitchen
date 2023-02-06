import { SceneManager } from 'UnityEngine.SceneManagement';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, InputField, Slider } from "UnityEngine.UI";
import { GameObject, Random, WaitForSeconds, Debug } from 'UnityEngine';
import { COOK_PRIORITY } from './Ingredient';
import Timer from './Timer';
import UIManager from './UIManager';

export default class GameManager extends ZepetoScriptBehaviour {
    // 싱글톤 패턴
    private static instance: GameManager

    private constructor() {
        super();
    }

    public static Instance() {
        return this.instance || (this.instance = new this())
    }

    private lastSavedHour: int;
    public timer: Timer;

    Awake() {
        //this.InvokeRepeating("DelayedUpdate", 1.0, 1.0);
    }

    Start() {
        this.timer = new Timer();
    }

/*    Update() {

    }*/


    DelayedUpdate() {
        this.timer.UpdateTime();
        //if (UIManager.Instance) UIManager.Instance.call("DisplayTime", this.timer.GetHour, this.timer.GetMinute);
        Debug.Log(this.timer.Hour);

        /* 
         * 시간의 변화에 따라 밝기 변화
        */

        // 시간이 변했을 경우에만 동작한다.
        if (this.lastSavedHour != this.timer.Hour) {

        }
        // 마지막 시간 저장
        this.lastSavedHour = this.timer.Hour;
    }
}