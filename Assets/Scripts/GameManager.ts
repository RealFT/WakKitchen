import { SceneManager } from 'UnityEngine.SceneManagement';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, InputField, Slider } from "UnityEngine.UI";
import { GameObject, Random, WaitForSeconds, Debug } from 'UnityEngine';
import { COOK_PRIORITY } from './Ingredient';
import Timer from './Timer';
import UIManager from './UIManager';
import CharacterController from './CharacterController';
import QuarterViewController from './QuarterViewController';

export default class GameManager extends ZepetoScriptBehaviour {
    // 싱글톤 패턴
    private static Instance: GameManager;
    public static GetInstance(): GameManager {

        if (!GameManager.Instance) {
            var _obj = new GameObject("GameManager");
            GameObject.DontDestroyOnLoad(_obj);
            GameManager.Instance = _obj.AddComponent<GameManager>();
        }
        return GameManager.Instance;
    }

    private lastSavedHour: int;
    public timer: Timer;
    public characterControllerObj: GameObject;
    public quarterViewControllerObj: GameObject;
    public characterController: CharacterController;
    public quarterViewController: QuarterViewController;
    Awake() {

    }

    Start() {
        this.timer = new Timer();
        this.characterControllerObj = GameObject.FindGameObjectWithTag("Character");
        this.quarterViewControllerObj = GameObject.FindGameObjectWithTag("Quarter");
        if (this.characterControllerObj) this.characterController = this.characterControllerObj.GetComponent<CharacterController>();
        if (this.quarterViewControllerObj) this.quarterViewController = this.quarterViewControllerObj.GetComponent<QuarterViewController>();
    }

    SetPlayerMovement(value: bool) {
        if (this.characterController && this.quarterViewController) {
            (value) ? this.characterController.EnableMoveControl() : this.characterController.DisableMoveControl();
            this.quarterViewController.SetMove(value);
        }
    }
}