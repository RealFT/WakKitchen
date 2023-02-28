import { SceneManager } from 'UnityEngine.SceneManagement';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, InputField, Slider } from "UnityEngine.UI";
import { GameObject, Random, WaitForSeconds, Debug } from 'UnityEngine';
import Timer from './Timer';
import CharacterController from './CharacterController';
import QuarterViewController from './QuarterViewController';
import DataManager from './DataManager';
import OrderManager from './OrderManager';
import UIManager from './UIManager';
import Cook from './Cook';

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
    @SerializeField() private characterController: CharacterController;
    @SerializeField() private quarterViewController: QuarterViewController;
    //@SerializeField() private cookObj: GameObject;
    //private cook: Cook;
    private timer: Timer;

    private lastSavedDay: number;      // last saved Day(Stage).
    public minutesPerDay: number;    // n minutes pass in one day.
    public startHour: number;    // Stage Start Hour
    public endHour: number;    // Stage End Hour
    private currTime: [number, number]; // current time
    private isInGame: boolean;
    private gameMoney: number;
    private curStage: number;

    Awake() {
        if (this != GameManager.GetInstance()) GameObject.Destroy(this.gameObject);
    }

    Start() {
        this.init();
    }

    init() {
        /* need load */
        this.gameMoney = 1000;
        this.lastSavedDay = 0;
        this.curStage = this.lastSavedDay;
    }

    InitStage() {
        Debug.Log("InitStage");
        this.timer = new Timer();
        this.timer.SetTimeScale(this.minutesPerDay);
        this.timer.SetTime(this.startHour, 0);
        DataManager.GetInstance().setStageReceipts(this.curStage);

        //this.stageUIController = GameObject.FindGameObjectWithTag("UIController").GetComponent<StageUIController>();
        this.characterController = GameObject.FindGameObjectWithTag("Character").GetComponent<CharacterController>();
        this.quarterViewController = GameObject.FindGameObjectWithTag("Quarter").GetComponent<QuarterViewController>();
        //this.cook = this.cookObj.GetComponent<Cook>();

        this.isInGame = true;
        OrderManager.GetInstance().init();
        OrderManager.GetInstance().StartOrder();
        //this.cook.init();
        UIManager.GetInstance().initStageUI();
        UIManager.GetInstance().setGameMoneyText(this.gameMoney);
        this.SetPlayerJump(false);
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
            UIManager.GetInstance().SetSettlementUI(true);
            this.isInGame = false;
        }
        // update UI
        UIManager.GetInstance().SetTimeUI(this.currTime[0], this.currTime[1]);
    }

    SetPlayerMovement(value: boolean) {
        if (this.characterController && this.quarterViewController) {
            (value) ? this.characterController.EnableMoveControl() : this.characterController.DisableMoveControl();
            this.quarterViewController.SetMove(value);
        }
    }

    SetPlayerJump(value: boolean) {
        if (this.characterController && this.quarterViewController) {
            this.characterController.SetJump(value);
        }
    }

    public changeMoney(value: number) {
        this.gameMoney = Math.max(0, this.gameMoney + value);
        UIManager.GetInstance().setGameMoneyText(this.gameMoney);
    }

    public getCurrentMoney(){
        return this.gameMoney;
    }

    public nextStage(): void {
        this.curStage++;
    }

    public getCurrentStage(): number {
        return this.curStage;
    }
}