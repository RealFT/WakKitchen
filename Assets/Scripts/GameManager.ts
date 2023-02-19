import { SceneManager } from 'UnityEngine.SceneManagement';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, InputField, Slider } from "UnityEngine.UI";
import { GameObject, Random, WaitForSeconds, Debug } from 'UnityEngine';
import Timer from './Timer';
import StageUIController from './StageUIController';
import CharacterController from './CharacterController';
import QuarterViewController from './QuarterViewController';

export default class GameManager extends ZepetoScriptBehaviour {
    // 싱글톤 패턴
    private static Instance: GameManager;
    public static GetInstance(): GameManager {

        if (!GameManager.Instance) {
            //Debug.LogError("GameManager");

            var _obj = GameObject.Find("GameManager");
            if (!_obj) {
                _obj = new GameObject("GameManager");
                _obj.AddComponent<GameManager>();
            }
            GameManager.Instance = _obj.GetComponent<GameManager>();
            GameObject.DontDestroyOnLoad(_obj);
        }
        return GameManager.Instance;
    }

    // components
    public characterController: CharacterController;
    public quarterViewController: QuarterViewController;
    public stageUIController: StageUIController;
    private timer: Timer;

    private lastSavedDay: number;      // last saved Day(Stage).
    public minutesPerDay: number;    // n minutes pass in one day.
    public startHour: number;    // Stage Start Hour
    public endHour: number;    // Stage End Hour
    private currTime: [number, number]; // current time
    private isInGame: boolean;

    Awake() {
        if (this != GameManager.GetInstance()) GameObject.Destroy(this.gameObject);
    }

    Start() {
        //this.InitStage();
    }

    InitStage() {
        Debug.Log("InitStage");
        this.timer = new Timer();
        this.timer.SetTimeScale(this.minutesPerDay);
        this.timer.SetTime(this.startHour, 0);

        this.stageUIController = GameObject.FindGameObjectWithTag("UIController").GetComponent<StageUIController>();
        this.characterController = GameObject.FindGameObjectWithTag("Character").GetComponent<CharacterController>();
        this.quarterViewController = GameObject.FindGameObjectWithTag("Quarter").GetComponent<QuarterViewController>();
        this.isInGame = true;
    }

    Update() {
        if (this.isInGame) {
            this.StageUpdate();
        }
    }

    StageUpdate() {
        // update timer
        if (this.timer) this.timer.UpdateTime();
        this.currTime = [this.timer.GetHour(), this.timer.GetMinute()];
        // stage end
        if (this.currTime[0] >= this.endHour) {
            this.currTime[1] = 0;
            if (this.stageUIController) this.stageUIController.SetSettlementUI(true);
            this.isInGame = false;
        }
        // update UI
        if (this.stageUIController) this.stageUIController.SetTimeUI(this.currTime[0], this.currTime[1]);
    }

    SetPlayerMovement(value: boolean) {
        if (this.characterController && this.quarterViewController) {
            (value) ? this.characterController.EnableMoveControl() : this.characterController.DisableMoveControl();
            this.quarterViewController.SetMove(value);
        }
    }
}