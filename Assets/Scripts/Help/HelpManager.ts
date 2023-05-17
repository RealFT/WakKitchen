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
    private curPage: number;
    private enableBackground: number = 0.625;
    private disableBackground: number = 0;

    @SerializeField() private helpContents_Plating: GameObject;


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
        this.curPage = 0;
        GameManager.GetInstance().SetTutorialTimeScale();

        // page 1
        this.helpWindow_full.gameObject.SetActive(true);
        this.setBackgroundVisibility(true);
        UIManager.GetInstance().PlayText(this.window_full.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_start_ment1"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                this.curPage = 1;
            }
        })
        while (this.curPage < 1) yield null;

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
            this.curPage = 2;
            playButton.SetActive(false);
        });
        while (this.curPage < 2) yield null;

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
                this.curPage = 3;
            }
        })
        while (this.curPage < 3) yield null;
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
        })
        open_plating.onClick.AddListener(() => {
            if(this.curPage == 3) this.curPage = 4;
        })
        while (this.curPage < 4) yield null;
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
        })
        help_openBtn.GetComponent<Button>().onClick.AddListener(()=>{
            this.OpenHelpWindow(Section.Plating);
            help_closeBtn.SetActive(true);
            this.setBackgroundVisibility(false);
            this.helpWindow_upper.gameObject.SetActive(false);
            help_openBtn.SetActive(false);
            this.nextBtn.gameObject.SetActive(false);
        });
        help_closeBtn.GetComponent<Button>().onClick.AddListener(()=>{
            this.curPage = 5;
            help_closeBtn.SetActive(false);
        });
        while (this.curPage < 5) yield null;
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
                this.curPage = 6;
            }
        })
        while (this.curPage < 6) yield null;
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
        })
        this.curPage = 5;
        help_openReceiptBtn.GetComponent<Button>().onClick.AddListener(()=>{
            open_receipt.onClick.Invoke();
            this.curPage = 6;
            help_openReceiptBtn.SetActive(false);
            focus_receipt.SetActive(false);
            help_closeReceiptBtn.SetActive(true);
        });
        while (this.curPage < 6) yield null;
        yield new WaitForSeconds(1);
        help_closeReceiptBtn.GetComponent<Button>().onClick.AddListener(()=>{
            this.curPage = 7;
            this.receiptCloseBtn.onClick.Invoke();
            help_closeReceiptBtn.SetActive(false);
        });
        while (this.curPage < 7) yield null;
        help_openReceiptBtn.SetActive(false);
        this.nextBtn.gameObject.SetActive(true);

        // page 8
        this.helpWindow_full.gameObject.SetActive(true);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_full.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_start_ment8"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                this.curPage = 8;
            }
        })
        while (this.curPage < 8) yield null;

        this.helpWindow_full.gameObject.SetActive(false);
        this.helpWindow_lower.gameObject.SetActive(false);
        this.helpWindow_upper.gameObject.SetActive(false);
        this.helpUI.SetActive(false);
        GameManager.GetInstance().SetTutorialPlayTime();
        OrderManager.GetInstance().SetOrderSize(3);
    }

    public OpenHelpWindow(section: Section) {
        UIManager.GetInstance().OpenHelpPanel();
        //GameManager.GetInstance().PauseStage();
        switch(section){
            case Section.Dispenser:
                break;
            case Section.Fryer:
                break;
            case Section.Grill:
                break;
            case Section.Prep:
                break;
            case Section.Plating:
                const contents = this.helpContents_Plating.GetComponent<HelpContents>();
                const pages = contents.GetPages();
                pages[0].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment1"));
                pages[1].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment2"));
                pages[2].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment3"));
                pages[3].SetDiscription(DataManager.GetInstance().GetCurrentLanguageData("help_plating_ment4"));
                pages[0].gameObject.SetActive(true);
                pages[1].gameObject.SetActive(false);
                pages[2].gameObject.SetActive(false);
                pages[3].gameObject.SetActive(false);
                break;
        }
    }
}