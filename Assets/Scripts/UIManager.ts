import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, InputField, Slider, Text } from "UnityEngine.UI";
import { GameObject, WaitForSeconds } from 'UnityEngine';
import SceneLoadManager, { SceneName } from './SceneLoadManager';
import Mediator, { EventNames, IListener } from './Notification/Mediator';
import Shop from './Shop/Shop';

export default class UIManager extends ZepetoScriptBehaviour implements IListener {
    // singleton
    private static Instance: UIManager;
    public static GetInstance(): UIManager {

        if (!UIManager.Instance) {
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
    @SerializeField() private shopUI: GameObject;
    @SerializeField() private mainUI: GameObject[];
    @SerializeField() private gameUI: GameObject[];
    @SerializeField() private timeText: Text;
    @SerializeField() private possessionMoneyTxt: Text;
    @SerializeField() private informationObj: GameObject;
    @SerializeField() private displayDelay: number = 0.7;

     Awake() {
        // If the current object is not the instance of UIManager, destroy it.
        if (this != UIManager.GetInstance()) GameObject.Destroy(this.gameObject);
    }

    Start() {
        // Register UIManager as a listener for events
        Mediator.GetInstance().RegisterListener(this);
        // Initialize the UI
        this.Init();
        // Set the game UI to be disabled and the main UI to be enabled
        this.SetGameUI(false);
        this.SetMainUI(true);
    }

    public Init() {
        // Initialize the UI elements
        this.SetSceneUI();
        this.SetShopUI(false);
        this.SetSettlementUI(false);
        this.informationObj.SetActive(false);
    }

    public InitStageUI(){
        // Disable the main UI and enable the game UI
        this.SetMainUI(false);
        this.SetGameUI(true);
    }
    
    public DisableStageUI(){
        // Disable the settlement UI
        this.SetSettlementUI(false);
    }

    public ToShop(){
        // Enable the shop UI and disable the settlement UI
        console.log("ToShop");
        this.SetSettlementUI(false);
        this.SetShopUI(true);
    }

    public InitShopUI(){
        // Initialize the shop UI
        this.shopUI.GetComponent<Shop>().InitShop();
    }
    
    public SetShopUI(value: boolean) {
        // Set the shop UI to be enabled or disabled
        this.shopUI.SetActive(value);
    }

    public SetSettlementUI(value: boolean) {
        // Set the settlement UI to be enabled or disabled
        this.settlementUI.SetActive(value);
    }

    private SetMainUI(value:boolean){
        // Set the main UI to be enabled or disabled
        for(let i=0;i<this.mainUI.length;i++){
            this.mainUI[i].SetActive(value);
        }
    }
    
    private SetGameUI(value:boolean){
        // Set the game UI to be enabled or disabled
        for(let i=0;i<this.gameUI.length;i++){
            this.gameUI[i].SetActive(value);
        }
    }

    public SetSceneUI(){
        // Set the UI depending on the current scene
        if (SceneLoadManager.GetInstance().getCurrentScene() == SceneName.Main) {
            this.SetGameUI(false);
            this.SetMainUI(true);
        }
        else {
            this.SetMainUI(false);
            this.SetGameUI(true);
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

        // Set the text of the time element to the formatted time
        this.timeText.text = time;
    }

    public OpenInformation(message: string) {
        // Set the text of the information element to the given message
        this.informationObj.GetComponentInChildren<Text>().text = message;
        // Start a coroutine to display the information element for a set amount of time
        this.StartCoroutine(this.DisaplayInformation());
    }
    
    private * DisaplayInformation(){
        // Set the information element to be active
        this.informationObj.SetActive(true);
        // Wait for the set amount of time
        yield new WaitForSeconds(this.displayDelay);
        // Set the information element to be inactive
        this.informationObj.SetActive(false);
    }
    
    private SetPossessionMoneyText(money: string) {
        // Set the text of the possession money element to the given money value
        this.possessionMoneyTxt.text = money;
    }
    
    public OnNotify(sender: any, eventName: string, eventData: any): void {
        // If the event is PossessionMoneyUpdated, set the possession money text to the eventData value
        if (eventName == EventNames.PossessionMoneyUpdated) {
            this.SetPossessionMoneyText(eventData);
        }
    }
    
    private OnDestroy() {
        // Unregister UIManager as a listener for events
        Mediator.GetInstance().UnregisterListener(this);
    }
}