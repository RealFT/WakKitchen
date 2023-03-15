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
import BalanceManager from './Shop/BalanceManager';
import Mediator, { EventNames } from './Notification/Mediator';

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
    @SerializeField() private minutesPerDay: number;    // n minutes pass in one day.
    @SerializeField() private startHour: number;    // Stage Start Hour
    @SerializeField() private endHour: number;    // Stage End Hour
    private currTime: [number, number]; // current time
    private isInGame: boolean;
    private curStage: number;

    Awake() {
        if (this != GameManager.GetInstance()) GameObject.Destroy(this.gameObject);
    }

    Start() {
        this.init();
    }

    init() {
        /* need load */
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
        Mediator.GetInstance().Notify(this, EventNames.CurrencyUpdatedEvent, null);
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

    public nextStage(): void {
        this.curStage++;
    }

    public getCurrentStage(): number {
        return this.curStage;
    }

    public Reset() {
        // reset all variables to their initial values
        this.timer.SetTime(this.startHour, 0);
        this.currTime = [this.timer.GetHour(), this.timer.GetMinute()];
        this.isInGame = false;
    
        // reset UI
        UIManager.GetInstance().SetSettlementUI(false);
        UIManager.GetInstance().SetTimeUI(this.currTime[0], this.currTime[1]);
        Mediator.GetInstance().Notify(this, EventNames.CurrencyUpdatedEvent, null);
    
        // reset managers
        //OrderManager.GetInstance().Reset();
        //DataManager.GetInstance().Reset();
    
        // initialize the game
        this.init();
    }
}