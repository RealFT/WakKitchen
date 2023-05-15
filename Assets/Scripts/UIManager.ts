import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, InputField, Slider, Text } from "UnityEngine.UI";
import { GameObject, WaitForSeconds } from 'UnityEngine';
import { TextMeshProUGUI } from 'TMPro';
import SceneLoadManager, { SceneName } from './SceneLoadManager';
import Mediator, { EventNames, IListener } from './Notification/Mediator';
import Shop from './Shop/Shop';
import SoundManager from './SoundManager';
import GameManager from './GameManager';

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
    @SerializeField() private startBtn: Button;
    @SerializeField() private timeText: Text;
    @SerializeField() private possessionMoneyTxt: Text;
    @SerializeField() private informationObj: GameObject;
    @SerializeField() private displayDelay: number = 0.7;
    @SerializeField() private writerText: string = "";    // 
    @SerializeField() private lockHireTap: GameObject;
    @SerializeField() private lockMyCard: GameObject;
    private helpTexts: string[] = [];
    private isNextText: boolean;   // 텍스트 출력을 한번에 할지 결정
    private isTextCut: boolean;   // 텍스트 출력을 한번에 할지 결정
    private isTextEnd: boolean;   // 텍스트 출력이 끝났는지 확인
    
    Awake() {
        // If the current object is not the instance of UIManager, destroy it.
        if (this != UIManager.GetInstance()) GameObject.Destroy(this.gameObject);
    }

    Start() {
        this.startBtn.onClick.AddListener(() => {
            GameManager.GetInstance().StartGame();
        });

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

    *PlayHelp(text: TextMeshProUGUI)
    {
        // introBackAnim.Play();
        // while (introBackAnim.isPlaying) yield return null;
        // MoveScene(SCENE.Main, SCENE.CharSelect);
        // introSkipButton.SetActive(true);
        // introNextButton.SetActive(true);
        // introObjectList[introObjCount].SetActive(true);

        // helpTexts는 DataManager에서 가져오기
        for (let i = 0; i < this.helpTexts.length; i++)
        {
            // 한 줄의 타이핑이 완료될 때 까지 대기
            yield this.TypeChat(text, this.helpTexts[i]);
            // 코루틴을 탈출하면 현재 문장 전부 불러옴
            text.text = this.helpTexts[i];

            //yield return new WaitForSeconds(0.2f);

            while (!this.isNextText) yield null;
            this.isNextText = false;
        }
        // 인트로가 끝났을 경우 인트로 비활성화 호출
        // OffIntro();
        this.ResetText(text);
    }

    public nextText(text: TextMeshProUGUI)
    {
        // 텍스트가 끝나지 않았을 경우
        if (!this.isTextEnd)
        {
            // 텍스트 출력을 한번에 하고 리턴.
            this.isTextCut = true;
        }
        // 텍스트 출력이 끝났을 경우
        else
        {
            // 텍스트 초기화
            text.text = "";
            // // 인트로 오브젝트가 남아있는 경우에만 활성화
            // if (introObjCount + 1 < introObjectList.Count)
            // {
            //     introObjectList[introObjCount].SetActive(false);
            //     introObjCount++;
            //     introObjectList[introObjCount].SetActive(true);
            // }
            this.isNextText = true;
        }
    }

    *TypeChat(targetText: TextMeshProUGUI, narration: string)
    {
        this.isTextEnd = false;
        this.writerText = "";
        //텍스트 타이핑 효과
        for (let i = 0; i < narration.length; i++)
        {
            // textCut 호출 시 출력을 한번에 한다.
            if (this.isTextCut) break;

            this.writerText += narration[i];
            targetText.text = this.writerText;
            SoundManager.GetInstance().OnPlaySFX("Button_Select");
            yield new WaitForSeconds(0.07);
        }
        this.isTextEnd = true;
        this.isTextCut = false;
    }

    // Reset Help Text
    private ResetText(text: TextMeshProUGUI)
    {
        // for (let i = 0; i < introObjectList.Count; i++)
        // {
        //     introObjectList[introObjCount].SetActive(false);
        // }
        // introSkipButton.SetActive(false);
        // introNextButton.SetActive(false);
        // intro.SetActive(false);
        // introObjCount = 0;
        //isIntro = false;  // 인트로를 단 한 번만 실행하게 하기
        text.text = "";
        this.isTextCut = false;
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
        SoundManager.GetInstance().OnPlayBGM(SoundManager.GetInstance().keyShop);
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

    // Info Window
    public OpenInformation(message: string) {
        // Set the text of the information element to the given message
        this.informationObj.GetComponentInChildren<TextMeshProUGUI>().text = message;
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
    
    public UnlockShop(){
        this.lockHireTap.SetActive(false);
        this.lockMyCard.SetActive(false);
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