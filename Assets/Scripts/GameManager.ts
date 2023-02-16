import { SceneManager } from 'UnityEngine.SceneManagement';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, InputField, Slider } from "UnityEngine.UI";
import { GameObject, Random, WaitForSeconds, Debug } from 'UnityEngine';
import { COOK_PRIORITY } from './Ingredient';
import Timer from './Timer';
import StageUIController from './StageUIController';
import CharacterController from './CharacterController';
import QuarterViewController from './QuarterViewController';

export default class GameManager extends ZepetoScriptBehaviour {
    // 싱글톤 패턴
    private static Instance: GameManager;
    public static GetInstance(): GameManager {

        if (!GameManager.Instance) {
            Debug.LogError("GameManager");

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

    Awake() {
        if (this != GameManager.GetInstance()) GameObject.Destroy(this.gameObject);
    }

    Start() {
        this.timer = new Timer();
        this.timer.SetTimeScale(this.minutesPerDay);
        this.timer.SetTime(this.startHour, 0);

        this.stageUIController = GameObject.FindGameObjectWithTag("UIController").GetComponent<StageUIController>();
        this.characterController = GameObject.FindGameObjectWithTag("Character").GetComponent<CharacterController>();
        this.quarterViewController = GameObject.FindGameObjectWithTag("Quarter").GetComponent<QuarterViewController>();
    }

    Update() {
        // update the timer
        if (this.timer) this.timer.UpdateTime();
        if (this.stageUIController) this.stageUIController.SetTimeUI(this.timer.GetHour(), this.timer.GetMinute());
    }

    SetPlayerMovement(value: bool) {
        if (this.characterController && this.quarterViewController) {
            (value) ? this.characterController.EnableMoveControl() : this.characterController.DisableMoveControl();
            this.quarterViewController.SetMove(value);
        }
    }
}