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
    @SerializeField() private minutesPerDay: number;    // n minutes pass in one day.
    @SerializeField() private startHour: number;    // Stage Start Hour
    @SerializeField() private endHour: number;    // Stage End Hour
    private timer: Timer;
    private lastSavedDay: number;      // last saved Day(Stage).
    private currTime: [number, number]; // current time
    private curStage: number;
    public _isInGame: boolean;
    public get isInGame(): boolean {
        return this._isInGame;
    }
    Awake() {
        if (this != GameManager.GetInstance()) GameObject.Destroy(this.gameObject);
    }

    Start() {
        this.Init();
    }

    Init() {
        /* need load */
        //this.lastSavedDay = 0;
        this.curStage = DataManager.GetInstance().GetLastSavedStage();
    }
    
    // Initializes the stage
    InitStage() {
        Debug.Log("InitStage");
        this.characterController = GameObject.FindGameObjectWithTag("Character").GetComponent<CharacterController>();
        this.quarterViewController = GameObject.FindGameObjectWithTag("Quarter").GetComponent<QuarterViewController>();
        
        this.timer = new Timer();
        this.timer.SetTimeScale(this.minutesPerDay);

        Mediator.GetInstance().Notify(this, EventNames.CurrencyUpdatedEvent, null);
        
        UIManager.GetInstance().InitStageUI();
        UIManager.GetInstance().InitShopUI();
        //this.SetPlayerJump(false);
    }

    public StartStage(){
        // reset all variables to their Initial values
        this.timer.SetTime(this.startHour, 0);
        this.currTime = [this.timer.GetHour(), this.timer.GetMinute()];

        DataManager.GetInstance().SetStageReceipts(this.curStage);

        OrderManager.GetInstance().Init();
        OrderManager.GetInstance().StartOrder();

        BalanceManager.GetInstance().ClearAllBalanceHistory();

        // reset UI
        UIManager.GetInstance().SetSettlementUI(false);
        UIManager.GetInstance().SetShopUI(false);
        UIManager.GetInstance().SetTimeUI(this.currTime[0], this.currTime[1]);

        if(this.characterController) this.characterController.InitPlayer();
        this.SetPlayerMovement(true);

        this._isInGame = true;

        Mediator.GetInstance().Notify(this, EventNames.StageStarted, null);
    }

    public EndStage(){
        UIManager.GetInstance().SetSettlementUI(true);
        OrderManager.GetInstance().DisableOrder();

        this.SetPlayerMovement(false);
        this._isInGame = false;
        
        Mediator.GetInstance().Notify(this, EventNames.StageEnded, null);
        
        this.curStage++;
        DataManager.GetInstance().SetStage(this.curStage);
    }

    Update() {
        if (this._isInGame) {
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
            this.EndStage();
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

    public NextStage(): void {

        this.StartStage();
        console.log(this.curStage);
    }

    public GetCurrentStage(): number {
        return this.curStage;
    }

    public RestartGame() {
        // reset all variables to their Initial values
        this.timer.SetTime(this.startHour, 0);
        this.currTime = [this.timer.GetHour(), this.timer.GetMinute()];

        DataManager.GetInstance().SetStageReceipts(this.curStage);
        OrderManager.GetInstance().Init();
        OrderManager.GetInstance().StartOrder();

        // reset UI
        UIManager.GetInstance().SetSettlementUI(false);
        UIManager.GetInstance().SetShopUI(false);
        UIManager.GetInstance().SetTimeUI(this.currTime[0], this.currTime[1]);
    
        // reset managers
        //OrderManager.GetInstance().Reset();
        //DataManager.GetInstance().Reset();
        this._isInGame = true;
    }
}