import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, InputField, Slider, Text } from "UnityEngine.UI";
import { GameObject, WaitForSeconds } from 'UnityEngine';
import SceneLoadManager, { SceneName } from './SceneLoadManager';
import Mediator, { EventNames } from './Notification/Mediator';

export default class UIManager extends ZepetoScriptBehaviour implements IListener {
    // singleton
    private static Instance: UIManager;
    public static GetInstance(): UIManager {

        if (!UIManager.Instance) {
            //Debug.LogError("GameManager");

            var _obj = GameObject.Find("UIManager");
            if (!_obj) {
                _obj = new GameObject("UIManager");
                _obj.AddComponent<UIManager>();
            }
            UIManager.Instance = _obj.GetComponent<UIManager>();
            GameObject.DontDestroyOnLoad(_obj);
        }
        return UIManager.Instance;
    }

    @SerializeField() private settlementUI: GameObject;
    @SerializeField() private mainUI: GameObject[];
    @SerializeField() private gameUI: GameObject[];
    @SerializeField() private timeText: Text;
    @SerializeField() private possessionMoneyTxt: Text;
    @SerializeField() private informationPref: GameObject;
    @SerializeField() private displayDelay: number = 0.7;

    Awake() {
        if (this != UIManager.GetInstance()) GameObject.Destroy(this.gameObject);

    }

    Start() {
        Mediator.GetInstance().RegisterListener(this);
        this.Init();
        this.setGameUI(false);
        this.setMainUI(true);
        //this.setSceneUI();
    }

    public Init() {
        this.setSceneUI();
        this.SetSettlementUI(false);
        this.informationPref.SetActive(false);
    }

    public initStageUI(){
        this.setMainUI(false);
        this.setGameUI(true);
    }
    
    public disableStageUI(){
        this.SetSettlementUI(false);
    }

    public SetSettlementUI(value: boolean) {
        this.settlementUI.SetActive(value);
    }

    private setMainUI(value:boolean){
        for(let i=0;i<this.mainUI.length;i++){
            this.mainUI[i].SetActive(value);
        }
    }
    
    private setGameUI(value:boolean){
        for(let i=0;i<this.gameUI.length;i++){
            this.gameUI[i].SetActive(value);
        }
    }

    public setSceneUI(){
        if (SceneLoadManager.GetInstance().getCurrentScene() == SceneName.Main) {
            this.setGameUI(false);
            this.setMainUI(true);
        }
        else {
            this.setMainUI(false);
            this.setGameUI(true);
        }
    }

    public SetTimeUI(hour: number, minute: number) {
        // Convert hour to 12-hour format and add AM/PM
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;

        // Add leading zeros to minute and hour if necessary
        const formattedHour = hour < 10 ? `0${hour}` : hour;
        const formattedMinute = minute < 10 ? `0${minute}` : minute;

        // Combine strings to create the desired output
        const time = `${formattedHour}:${formattedMinute} ${ampm}`;

        this.timeText.text = time;
    }

    public OpenInformation(message: string) {
        this.informationPref.GetComponentInChildren<Text>().text = message;
        this.StartCoroutine(this.DisaplayInformation());
    }

    private * DisaplayInformation(){
        this.informationPref.SetActive(true);
        yield new WaitForSeconds(this.displayDelay);
        this.informationPref.SetActive(false);
    }

    private SetPossessionMoneyText(money: string) {
        this.possessionMoneyTxt.text = money;
    }

    public OnNotify(sender: any, eventName: string, eventData: any): void {
        if (eventName == EventNames.PossessionMoneyUpdated) {
            this.SetPossessionMoneyText(eventData);
        }
    }

    private OnDestroy() {
        Mediator.GetInstance().UnregisterListener(this);
    }
}