import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, InputField, Slider, Text } from "UnityEngine.UI";
import { GameObject } from 'UnityEngine';
import SceneLoadManager, { SceneName } from './SceneLoadManager';
export default class UIManager extends ZepetoScriptBehaviour {
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

    public settlementUI: GameObject;
    public mainUI: GameObject[];
    public gameUI: GameObject[];
    public gameMoneyText: Text;
    public timeText: Text;

    Awake() {
        if (this != UIManager.GetInstance()) GameObject.Destroy(this.gameObject);
    }

    Start() {
        this.Init();
        this.setGameUI(false);
        this.setMainUI(true);
        //this.setSceneUI();
    }

    public Init() {
        this.setSceneUI();
        this.SetSettlementUI(false);
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

    public setGameMoney(value: number) {
        this.gameMoneyText.text = value.toString();
    }
}