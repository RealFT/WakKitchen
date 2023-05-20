import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, Image, Slider } from "UnityEngine.UI";
import { GameObject, Random, WaitForSeconds, Debug, Time } from 'UnityEngine';
import UIManager from '../UIManager';
import SoundManager from '../SoundManager';
import HelpWindow from './HelpWindow';
import DataManager, { Section } from '../DataManager';
import GameManager from '../GameManager';
import Interaction from '../Interaction';
import HelpContents from './HelpContents';
import OrderManager from '../OrderManager';
import OrderReceipt from '../OrderReceipt';

export default class HelpManager extends ZepetoScriptBehaviour {
    // 싱글톤 패턴
    private static Instance: HelpManager;
    public static GetInstance(): HelpManager {

        if (!HelpManager.Instance) {
            //Debug.LogError("GameManager");

            var _obj = GameObject.Find("HelpManager");
            if (!_obj) {
                _obj = new GameObject("HelpManager");
                _obj.AddComponent<HelpManager>();
            }
            HelpManager.Instance = _obj.GetComponent<HelpManager>();
            GameObject.DontDestroyOnLoad(_obj);
        }
        return HelpManager.Instance;
    }
    Awake() {
        if (this != HelpManager.GetInstance()) GameObject.Destroy(this.gameObject);
        this.window_full = this.helpWindow_full.GetComponent<HelpWindow>();
        this.window_upper = this.helpWindow_upper.GetComponent<HelpWindow>();
        this.window_lower = this.helpWindow_lower.GetComponent<HelpWindow>();
    }

    @SerializeField() private background: Image;
    @SerializeField() private nextBtn: Button;
    @SerializeField() private receiptCloseBtn: Button;
    @SerializeField() private helpUI: GameObject;
    @SerializeField() private helpWindow_full: GameObject;
    @SerializeField() private helpWindow_upper: GameObject;
    @SerializeField() private helpWindow_lower: GameObject;
    @SerializeField() private guideObjects: GameObject[];
    private gameObjectMap = new Map<string, GameObject>();
    private window_full: HelpWindow;
    private window_upper: HelpWindow;
    private window_lower: HelpWindow;
    private enableBackground: number = 0.625;
    private disableBackground: number = 0;

    @SerializeField() private helpContents_Dispenser: GameObject;
    @SerializeField() private helpContents_Grill: GameObject;
    @SerializeField() private helpContents_Employee: GameObject;
    @SerializeField() private helpContents_Prep: GameObject;
    @SerializeField() private helpContents_Fryer: GameObject;
    @SerializeField() private helpContents_Plating: GameObject;
    @SerializeField() private helpContents_Double: Button;
    @SerializeField() private helpContents_DoubleConfirm: Button;
    @SerializeField() private helpContents_Next: Button;

    Start(){
        for (const gameObject of this.guideObjects) {
            const name = gameObject.name; // Get the name of the current GameObject.
            let group = this.gameObjectMap.get(name); // Get the array of GameObjects with the same first word.
            this.gameObjectMap.set(name, gameObject);
        }
        this.helpUI.SetActive(false);
        this.helpWindow_full.SetActive(false);
        this.helpWindow_upper.SetActive(false);
        this.helpWindow_lower.SetActive(false);
        this.background.gameObject.SetActive(true);
    }

    public setBackgroundVisibility(visible: boolean) {
        this.background.enabled = visible;
    }

    public GuideStartGame(){
        this.helpUI.SetActive(true);
        this.StartCoroutine(this.GuideStartRoutine());
    }

    *GuideStartRoutine(){
        let curPage = 0;
        GameManager.GetInstance().SetTutorialTimeScale();
        this.nextBtn.gameObject.SetActive(true);

        // page 1
        this.helpWindow_full.gameObject.SetActive(true);
        this.setBackgroundVisibility(true);
        UIManager.GetInstance().PlayText(this.window_full.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_start_ment1"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                curPage = 1;
            }
        });
        while (curPage < 1) yield null;

        // page 2
        this.helpWindow_full.gameObject.SetActive(false);
        this.helpWindow_lower.gameObject.SetActive(true);
        const playButton = this.gameObjectMap.get("Help_ToStageBtn");
        playButton.SetActive(true);
        this.setBackgroundVisibility(true);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_lower.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_start_ment2"));
        this.nextBtn.onClick.AddListener(()=>{
            UIManager.GetInstance().nextText()
        });
        playButton.GetComponent<Button>().onClick.AddListener(()=>{
            GameManager.GetInstance().NextStage();
            curPage = 2;
            playButton.SetActive(false);
        });
        while (curPage < 2) yield null;

        // page 3, 4
        this.helpWindow_lower.gameObject.SetActive(false);
        this.helpWindow_full.gameObject.SetActive(true);
        const focus_plating = this.gameObjectMap.get("Focus_Section_Plating");
        focus_plating.SetActive(true);
        this.setBackgroundVisibility(false);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_full.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_start_ment3"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                curPage = 3;
            }
        });
        while (curPage < 3) yield null;
        const open_plating = GameObject.FindGameObjectWithTag("PlatingOpen")?.GetComponent<Interaction>()?.GetOpenButton();
        const guide_plating = this.gameObjectMap.get("Guide_Section_Plating");
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_full.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_start_ment4"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                this.helpWindow_full.gameObject.SetActive(false);
                focus_plating.SetActive(false);
                this.nextBtn.gameObject.SetActive(false);
                guide_plating.SetActive(true);
            }
        });
        open_plating.onClick.AddListener(() => {
            if(curPage == 3) curPage = 4;
        });
        while (curPage < 4) yield null;
        guide_plating.SetActive(false);
        this.nextBtn.gameObject.SetActive(true);

        // page 5
        this.helpWindow_full.gameObject.SetActive(false);
        this.helpWindow_upper.gameObject.SetActive(true);
        const help_openBtn = this.gameObjectMap.get("Help_OpenHelpBtn");
        help_openBtn.SetActive(true);
        const help_closeBtn = this.gameObjectMap.get("Help_CloseHelpBtn");
        help_closeBtn.SetActive(false);
        this.setBackgroundVisibility(true);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_upper.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_start_ment5"));
        this.nextBtn.onClick.AddListener(() => {
            if(UIManager.GetInstance().nextText()){
                this.helpWindow_upper.gameObject.SetActive(false);
            }
        });
        help_openBtn.GetComponent<Button>().onClick.AddListener(()=>{
            this.OpenHelpWindow(Section.Plating);
            help_closeBtn.SetActive(true);
            this.setBackgroundVisibility(false);
            this.helpWindow_upper.gameObject.SetActive(false);
            help_openBtn.SetActive(false);
            this.nextBtn.gameObject.SetActive(false);
        });
        help_closeBtn.GetComponent<Button>().onClick.AddListener(()=>{
            curPage = 5;
            help_closeBtn.SetActive(false);
        });
        while (curPage < 5) yield null;
        this.nextBtn.gameObject.SetActive(true);

        // page 6, 7
        this.helpWindow_upper.gameObject.SetActive(false);
        this.helpWindow_full.gameObject.SetActive(true);
        const focus_receipt = this.gameObjectMap.get("Focus_Receipt");
        focus_receipt.SetActive(true);
        this.setBackgroundVisibility(false);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_full.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_start_ment6"));
        this.nextBtn.onClick.AddListener(() => {
            if (UIManager.GetInstance().nextText()) {
                curPage = 6;
            }
        });
        while (curPage < 6) yield null;
        const open_receipt = GameObject.FindGameObjectWithTag("ReceiptOpen").GetComponent<OrderReceipt>().GetReceiptButton();
        const help_openReceiptBtn = this.gameObjectMap.get("Help_OpenReceiptBtn");
        const help_closeReceiptBtn = this.gameObjectMap.get("Help_CloseReceiptBtn");
        help_openReceiptBtn.SetActive(false);
        help_closeReceiptBtn.SetActive(false);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_full.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_start_ment7"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                this.nextBtn.gameObject.SetActive(false);
                this.helpWindow_full.gameObject.SetActive(false);
                help_openReceiptBtn.SetActive(true);
            }
        });
        curPage = 5;
        help_openReceiptBtn.GetComponent<Button>().onClick.AddListener(()=>{
            open_receipt.onClick.Invoke();
            curPage = 6;
            help_openReceiptBtn.SetActive(false);
            focus_receipt.SetActive(false);
            help_closeReceiptBtn.SetActive(true);
        });
        while (curPage < 6) yield null;
        help_closeReceiptBtn.GetComponent<Button>().onClick.AddListener(()=>{
            curPage = 7;
            this.receiptCloseBtn.onClick.Invoke();
            help_closeReceiptBtn.SetActive(false);
        });
        while (curPage < 7) yield null;
        help_openReceiptBtn.SetActive(false);
        this.nextBtn.gameObject.SetActive(true);

        // page 8
        this.helpWindow_full.gameObject.SetActive(true);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_full.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_start_ment8"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                curPage = 8;
            }
        });
        while (curPage < 8) yield null;

        this.helpWindow_full.gameObject.SetActive(false);
        this.helpWindow_lower.gameObject.SetActive(false);
        this.helpWindow_upper.gameObject.SetActive(false);
        this.helpUI.SetActive(false);
        GameManager.GetInstance().SetTutorialPlayTime(18);
        OrderManager.GetInstance().SetOrderSize(3);
    }

    public GuideSettlement(){
        this.helpUI.SetActive(true);
        this.StartCoroutine(this.GuideSettlementRoutine());
    }

    *GuideSettlementRoutine(){
        let curPage = 0;
        this.nextBtn.gameObject.SetActive(true);
        this.helpContents_Next.enabled = false;
        this.helpContents_Double.enabled = false;

        // page 1
        this.helpWindow_full.gameObject.SetActive(true);
        this.setBackgroundVisibility(false);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_full.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_settlement_ment1"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                curPage = 1;
            }
        });
        while (curPage < 1) yield null;

        // page 2
        this.helpWindow_full.gameObject.SetActive(false);
        this.helpWindow_lower.gameObject.SetActive(true);
        const focus_double = this.gameObjectMap.get("Focus_Double");
        focus_double.SetActive(true);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_lower.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_settlement_ment2"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                curPage = 2;
            }

        });
        while (curPage < 2) yield null;

        // page 3
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_lower.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_settlement_ment3"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                this.nextBtn.gameObject.SetActive(false);
                this.helpWindow_lower.gameObject.SetActive(false);
                this.helpContents_Double.enabled = true;
            }
        });
        this.helpContents_Double.onClick.AddListener(() => {
            focus_double.SetActive(false);
        });
        this.helpContents_DoubleConfirm.onClick.AddListener(() => {
            curPage = 3;
        });
        while (curPage < 3) yield null;
        yield new WaitForSeconds(1.5);
        this.nextBtn.gameObject.SetActive(true);

        // page 4
        this.helpWindow_lower.gameObject.SetActive(true);
        const focus_next = this.gameObjectMap.get("Focus_Next");
        focus_next.SetActive(true);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_lower.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_settlement_ment4"));
        this.nextBtn.onClick.AddListener(() => {
            if (UIManager.GetInstance().nextText()) {
                this.helpWindow_lower.gameObject.SetActive(false);
                this.nextBtn.gameObject.SetActive(false);
                this.helpContents_Next.enabled = true;
            }
        });
        this.helpContents_Next.onClick.AddListener(() => {
            focus_next.SetActive(false);
            // this.helpWindow_full.gameObject.SetActive(false);
            // this.helpWindow_upper.gameObject.SetActive(false);
            // this.helpWindow_lower.gameObject.SetActive(false);
            // this.helpUI.SetActive(false);
            curPage = 4;
        });
        // while (curPage < 4) yield null;
    }

    public GuideSection(section: string){

        this.helpUI.SetActive(true);
        switch(section){
            case "dispenser":
                this.StartCoroutine(this.GuideDispenserRoutine());
                break;
            case "grill":
                break;
            case "employee":
                break;
            case "slice":
                break;
            case "frier":
                break;
        }
    }

    *GuideDispenserRoutine(){
        let curPage = 0;
        this.nextBtn.gameObject.SetActive(true);
        this.helpContents_Next.enabled = false;
        this.helpContents_Double.enabled = false;
        GameManager.GetInstance().SetTutorialTimeScale();

        // page 1
        this.helpWindow_lower.gameObject.SetActive(true);
        this.setBackgroundVisibility(false);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_lower.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_dispenser_ment1"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                curPage = 1;
            }
        });
        while (curPage < 1) yield null;

        // page 2
        const playButton = this.gameObjectMap.get("Help_ToStageBtn");
        playButton.SetActive(true);
        this.setBackgroundVisibility(true);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_lower.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_dispenser_ment2"));
        this.nextBtn.onClick.AddListener(()=>{
            UIManager.GetInstance().nextText();
        });
        playButton.GetComponent<Button>().onClick.AddListener(()=>{
            GameManager.GetInstance().NextStage();
            curPage = 2;
            playButton.SetActive(false);
        });
        while (curPage < 2) yield null;
        
        // page 3, 4
        this.helpWindow_lower.gameObject.SetActive(false);
        this.helpWindow_full.gameObject.SetActive(true);
        const focus_dispenser = this.gameObjectMap.get("Focus_Section_Dispenser");
        focus_dispenser.SetActive(true);
        this.setBackgroundVisibility(false);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_full.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_dispenser_ment3"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                curPage = 3;
            }
        });
        while (curPage < 3) yield null;
        const open_dispenser = GameObject.FindGameObjectWithTag("DispenserOpen")?.GetComponent<Interaction>()?.GetOpenButton();
        const guide_dispenser = this.gameObjectMap.get("Guide_Section_Dispenser");
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_full.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_dispenser_ment4"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                this.helpWindow_full.gameObject.SetActive(false);
                focus_dispenser.SetActive(false);
                this.nextBtn.gameObject.SetActive(false);
                guide_dispenser.SetActive(true);
            }
        });
        open_dispenser.onClick.AddListener(() => {
            if(curPage == 3) curPage = 4;
        });
        while (curPage < 4) yield null;
        guide_dispenser.SetActive(false);

        this.OpenHelpWindow(Section.Dispenser);

        this.helpWindow_full.gameObject.SetActive(false);
        this.helpWindow_lower.gameObject.SetActive(false);
        this.helpWindow_upper.gameObject.SetActive(false);
        this.helpUI.SetActive(false);
        GameManager.GetInstance().SetTutorialPlayTime(14);
    }

    *GuideGrillRoutine(){
        let curPage = 0;
        this.nextBtn.gameObject.SetActive(true);
        this.helpContents_Next.enabled = false;
        this.helpContents_Double.enabled = false;
        GameManager.GetInstance().SetTutorialTimeScale();

        // page 1
        this.helpWindow_lower.gameObject.SetActive(true);
        this.setBackgroundVisibility(false);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_lower.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_grill_ment1"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                curPage = 1;
            }
        });
        while (curPage < 1) yield null;

        // page 2
        const playButton = this.gameObjectMap.get("Help_ToStageBtn");
        playButton.SetActive(true);
        this.setBackgroundVisibility(true);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_lower.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_grill_ment2"));
        this.nextBtn.onClick.AddListener(()=>{
            UIManager.GetInstance().nextText();
        });
        playButton.GetComponent<Button>().onClick.AddListener(()=>{
            GameManager.GetInstance().NextStage();
            curPage = 2;
            playButton.SetActive(false);
        });
        while (curPage < 2) yield null;
        
        // page 3, 4
        this.helpWindow_lower.gameObject.SetActive(false);
        this.helpWindow_full.gameObject.SetActive(true);
        const focus_dispenser = this.gameObjectMap.get("Focus_Section_Grill");
        focus_dispenser.SetActive(true);
        this.setBackgroundVisibility(false);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_full.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_dispenser_ment3"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                curPage = 3;
            }
        });
        while (curPage < 3) yield null;
        const open_dispenser = GameObject.FindGameObjectWithTag("GrillOpen")?.GetComponent<Interaction>()?.GetOpenButton();
        const guide_dispenser = this.gameObjectMap.get("Guide_Section_Grill");
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_full.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_dispenser_ment4"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                this.helpWindow_full.gameObject.SetActive(false);
                focus_dispenser.SetActive(false);
                this.nextBtn.gameObject.SetActive(false);
                guide_dispenser.SetActive(true);
            }
        });
        open_dispenser.onClick.AddListener(() => {
            if(curPage == 3) curPage = 4;
        });
        while (curPage < 4) yield null;
        guide_dispenser.SetActive(false);

        this.OpenHelpWindow(Section.Dispenser);

        this.helpWindow_full.gameObject.SetActive(false);
        this.helpWindow_lower.gameObject.SetActive(false);
        this.helpWindow_upper.gameObject.SetActive(false);
        this.helpUI.SetActive(false);
        GameManager.GetInstance().SetTutorialPlayTime(14);
    }

    *GuideEmployeeRoutine(){
        let curPage = 0;
        this.nextBtn.gameObject.SetActive(true);
        this.helpContents_Next.enabled = false;
        this.helpContents_Double.enabled = false;
        GameManager.GetInstance().SetTutorialTimeScale();

        // page 1
        this.helpWindow_lower.gameObject.SetActive(true);
        this.setBackgroundVisibility(false);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_lower.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_employee_ment1"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                curPage = 1;
            }
        });
        while (curPage < 1) yield null;

        // page 2
        const playButton = this.gameObjectMap.get("Help_ToStageBtn");
        playButton.SetActive(true);
        this.setBackgroundVisibility(true);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_lower.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_employee_ment2"));
        this.nextBtn.onClick.AddListener(()=>{
            UIManager.GetInstance().nextText();
        });
        playButton.GetComponent<Button>().onClick.AddListener(()=>{
            GameManager.GetInstance().NextStage();
            curPage = 2;
            playButton.SetActive(false);
        });
        while (curPage < 2) yield null;
        
        // page 3, 4
        this.helpWindow_lower.gameObject.SetActive(false);
        this.helpWindow_full.gameObject.SetActive(true);
        const focus_Employee = this.gameObjectMap.get("Focus_Section_Employee");
        focus_Employee.SetActive(true);
        this.setBackgroundVisibility(false);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_full.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_employee_ment3"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                curPage = 3;
            }
        });
        while (curPage < 3) yield null;

        this.helpWindow_full.gameObject.SetActive(false);
        this.helpWindow_lower.gameObject.SetActive(false);
        this.helpWindow_upper.gameObject.SetActive(false);
        this.helpUI.SetActive(false);
        GameManager.GetInstance().SetTutorialPlayTime(14);
    }

    *GuideSliceRoutine(){
        let curPage = 0;
        this.nextBtn.gameObject.SetActive(true);
        this.helpContents_Next.enabled = false;
        this.helpContents_Double.enabled = false;
        GameManager.GetInstance().SetTutorialTimeScale();

        // page 1
        this.helpWindow_lower.gameObject.SetActive(true);
        this.setBackgroundVisibility(false);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_lower.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_prep_ment1"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                curPage = 1;
            }
        });
        while (curPage < 1) yield null;

        // page 2
        const playButton = this.gameObjectMap.get("Help_ToStageBtn");
        playButton.SetActive(true);
        this.setBackgroundVisibility(true);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_lower.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_prep_ment2"));
        this.nextBtn.onClick.AddListener(()=>{
            UIManager.GetInstance().nextText();
        });
        playButton.GetComponent<Button>().onClick.AddListener(()=>{
            GameManager.GetInstance().NextStage();
            curPage = 2;
            playButton.SetActive(false);
        });
        while (curPage < 2) yield null;
        
        // page 3, 4
        this.helpWindow_lower.gameObject.SetActive(false);
        this.helpWindow_full.gameObject.SetActive(true);
        const focus_prep = this.gameObjectMap.get("Focus_Section_Prep");
        focus_prep.SetActive(true);
        this.setBackgroundVisibility(false);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_full.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_prep_ment3"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                curPage = 3;
            }
        });
        while (curPage < 3) yield null;
        const open_prep = GameObject.FindGameObjectWithTag("PrepOpen")?.GetComponent<Interaction>()?.GetOpenButton();
        const guide_prep = this.gameObjectMap.get("Guide_Section_Prep");
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_full.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_prep_ment4"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                this.helpWindow_full.gameObject.SetActive(false);
                focus_prep.SetActive(false);
                this.nextBtn.gameObject.SetActive(false);
                guide_prep.SetActive(true);
            }
        });
        open_prep.onClick.AddListener(() => {
            if(curPage == 3) curPage = 4;
        });
        while (curPage < 4) yield null;
        guide_prep.SetActive(false);

        this.OpenHelpWindow(Section.Prep);

        this.helpWindow_full.gameObject.SetActive(false);
        this.helpWindow_lower.gameObject.SetActive(false);
        this.helpWindow_upper.gameObject.SetActive(false);
        this.helpUI.SetActive(false);
        GameManager.GetInstance().SetTutorialPlayTime(14);
    }

    *GuideFryerRoutine(){
        let curPage = 0;
        this.nextBtn.gameObject.SetActive(true);

        this.helpContents_Next.enabled = false;
        this.helpContents_Double.enabled = false;
        GameManager.GetInstance().SetTutorialTimeScale();

        // page 1
        this.helpWindow_lower.gameObject.SetActive(true);
        this.setBackgroundVisibility(false);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_lower.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_fryer_ment1"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                curPage = 1;
            }
        });
        while (curPage < 1) yield null;

        // page 2
        const playButton = this.gameObjectMap.get("Help_ToStageBtn");
        playButton.SetActive(true);
        this.setBackgroundVisibility(true);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_lower.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_fryer_ment2"));
        this.nextBtn.onClick.AddListener(()=>{
            UIManager.GetInstance().nextText();
        });
        playButton.GetComponent<Button>().onClick.AddListener(()=>{
            GameManager.GetInstance().NextStage();
            curPage = 2;
            playButton.SetActive(false);
        });
        while (curPage < 2) yield null;
        
        // page 3, 4
        this.helpWindow_lower.gameObject.SetActive(false);
        this.helpWindow_full.gameObject.SetActive(true);
        const focus_fryer = this.gameObjectMap.get("Focus_Section_Fryer");
        focus_fryer.SetActive(true);
        this.setBackgroundVisibility(false);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_full.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_fryer_ment3"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                curPage = 3;
            }
        });
        while (curPage < 3) yield null;
        const open_fryer = GameObject.FindGameObjectWithTag("FryerOpen")?.GetComponent<Interaction>()?.GetOpenButton();
        const guide_fryer = this.gameObjectMap.get("Guide_Section_Fryer");
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_full.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_fryer_ment4"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                this.helpWindow_full.gameObject.SetActive(false);
                focus_fryer.SetActive(false);
                this.nextBtn.gameObject.SetActive(false);
                guide_fryer.SetActive(true);
            }
        });
        open_fryer.onClick.AddListener(() => {
            if(curPage == 3) curPage = 4;
        });
        while (curPage < 4) yield null;
        guide_fryer.SetActive(false);

        this.OpenHelpWindow(Section.Fryer);

        this.helpWindow_full.gameObject.SetActive(false);
        this.helpWindow_lower.gameObject.SetActive(false);
        this.helpWindow_upper.gameObject.SetActive(false);
        this.helpUI.SetActive(false);
        GameManager.GetInstance().SetTutorialPlayTime(14);
    }

    public ClearHelpContents(){
        this.helpContents_Dispenser.SetActive(false);
        this.helpContents_Fryer.SetActive(false);
        this.helpContents_Grill.SetActive(false);
        this.helpContents_Prep.SetActive(false);
        this.helpContents_Plating.SetActive(false);
        this.helpContents_Employee.SetActive(false);
    }

    public OpenHelpWindow(section: Section) {
        UIManager.GetInstance().OpenHelpPanel();
        //GameManager.GetInstance().PauseStage();
        switch(section){
            case Section.Dispenser:
                this.helpContents_Dispenser.SetActive(true);
                const contents_Dispenser = this.helpContents_Dispenser.GetComponent<HelpContents>();
                const pages_Dispenser = contents_Dispenser.GetPages();
                contents_Dispenser.SetCloseBtnVisivility(false);
                pages_Dispenser[0].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment1"));
                pages_Dispenser[1].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment2"));
                pages_Dispenser[2].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment3"));
                pages_Dispenser[3].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment4"));
                pages_Dispenser[0].gameObject.SetActive(true);
                pages_Dispenser[1].gameObject.SetActive(false);
                pages_Dispenser[2].gameObject.SetActive(false);
                pages_Dispenser[2].GetNextBtn().onClick.AddListener(()=>{
                    contents_Dispenser.SetCloseBtnVisivility(true);
                });
                pages_Dispenser[3].gameObject.SetActive(false);
                break;
            case Section.Fryer:
                this.helpContents_Fryer.SetActive(true);
                const contents_Fryer = this.helpContents_Fryer.GetComponent<HelpContents>();
                const pages_Fryer = contents_Fryer.GetPages();
                contents_Fryer.SetCloseBtnVisivility(false);
                pages_Fryer[0].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment1"));
                pages_Fryer[1].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment2"));
                pages_Fryer[2].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment3"));
                pages_Fryer[3].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment4"));
                pages_Fryer[0].gameObject.SetActive(true);
                pages_Fryer[1].gameObject.SetActive(false);
                pages_Fryer[2].gameObject.SetActive(false);
                pages_Fryer[2].GetNextBtn().onClick.AddListener(()=>{
                    contents_Fryer.SetCloseBtnVisivility(true);
                });
                pages_Fryer[3].gameObject.SetActive(false);
                break;
            case Section.Grill:
                this.helpContents_Grill.SetActive(true);
                const contents_Grill = this.helpContents_Grill.GetComponent<HelpContents>();
                const pages_Grill = contents_Grill.GetPages();
                contents_Grill.SetCloseBtnVisivility(false);
                pages_Grill[0].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment1"));
                pages_Grill[1].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment2"));
                pages_Grill[2].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment3"));
                pages_Grill[3].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment4"));
                pages_Grill[0].gameObject.SetActive(true);
                pages_Grill[1].gameObject.SetActive(false);
                pages_Grill[2].gameObject.SetActive(false);
                pages_Grill[2].GetNextBtn().onClick.AddListener(()=>{
                    contents_Grill.SetCloseBtnVisivility(true);
                });
                pages_Grill[3].gameObject.SetActive(false);
                break;
            case Section.Prep:
                this.helpContents_Prep.SetActive(true);
                const contents_Prep = this.helpContents_Prep.GetComponent<HelpContents>();
                const pages_Prep = contents_Prep.GetPages();
                contents_Prep.SetCloseBtnVisivility(false);
                pages_Prep[0].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment1"));
                pages_Prep[1].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment2"));
                pages_Prep[2].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment3"));
                pages_Prep[3].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment4"));
                pages_Prep[0].gameObject.SetActive(true);
                pages_Prep[1].gameObject.SetActive(false);
                pages_Prep[2].gameObject.SetActive(false);
                pages_Prep[2].GetNextBtn().onClick.AddListener(()=>{
                    contents_Prep.SetCloseBtnVisivility(true);
                });
                pages_Prep[3].gameObject.SetActive(false);
                break;
            case Section.Plating:
                this.helpContents_Plating.SetActive(true);
                const contents_Plating = this.helpContents_Plating.GetComponent<HelpContents>();
                const pages_Plating = contents_Plating.GetPages();
                contents_Plating.SetCloseBtnVisivility(false);
                pages_Plating[0].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment1"));
                pages_Plating[1].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment2"));
                pages_Plating[2].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment3"));
                pages_Plating[3].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment4"));
                pages_Plating[0].gameObject.SetActive(true);
                pages_Plating[1].gameObject.SetActive(false);
                pages_Plating[2].gameObject.SetActive(false);
                pages_Plating[2].GetNextBtn().onClick.AddListener(()=>{
                    contents_Plating.SetCloseBtnVisivility(true);
                });
                pages_Plating[3].gameObject.SetActive(false);
                break;
            case Section.Employee:
                this.helpContents_Employee.SetActive(true);
                const contents_Employee = this.helpContents_Employee.GetComponent<HelpContents>();
                const pages_Employee = contents_Employee.GetPages();
                contents_Employee.SetCloseBtnVisivility(false);
                pages_Employee[0].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment1"));
                pages_Employee[1].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment2"));
                pages_Employee[2].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment3"));
                pages_Employee[3].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment4"));
                pages_Employee[0].gameObject.SetActive(true);
                pages_Employee[1].gameObject.SetActive(false);
                pages_Employee[2].gameObject.SetActive(false);
                pages_Employee[2].GetNextBtn().onClick.AddListener(()=>{
                    contents_Employee.SetCloseBtnVisivility(true);
                });
                pages_Employee[3].gameObject.SetActive(false);
                break;
        }
    }
}