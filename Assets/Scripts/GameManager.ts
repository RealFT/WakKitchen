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
    public playerObject: GameObject;
    public moveControlUI: GameObject;
    Awake() {

    }

    Start() {
        this.timer = new Timer();
        this.moveControlUI = this.playerObject.transform.Find("UIZepetoPlayerControl").gameObject;
        this.moveControlUI.SetActive(false);
    }

}