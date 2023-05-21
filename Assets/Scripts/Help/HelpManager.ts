import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, Image, Slider } from "UnityEngine.UI";
import { GameObject, Random, WaitForSeconds, Debug, Time } from 'UnityEngine';
import UIManager from '../UIManager';
import SoundManager from '../SoundManager';
import HelpWindow from './HelpWindow';
import DataManager, { Section } from '../DataManager';
import GameManager from '../GameManager';
import InteractionBase from '../InteractionBase';
import Interaction from '../Interaction';
import Interaction_Grill from '../Interaction_Grill';
import Interaction_Fry from '../Interaction_Fry';
import HelpContents from './HelpContents';
import OrderManager from '../OrderManager';
import OrderReceipt from '../OrderReceipt';
import { TextMeshProUGUI } from 'TMPro';
import BalanceManager, { Currency } from '../Shop/BalanceManager';
import CardInventory from '../Employee/CardInventory';
import Shop_Upgrade from '../Shop/Shop_Upgrade';

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

    @SerializeField() private background: Image;    // 도움말 background 이미지
    @SerializeField() private nextBtn: Button;  // 도움말 넘기기 버튼
    @SerializeField() private receiptCloseBtn: Button;  //  확장 레시피 닫는 버튼(background)
    @SerializeField() private helpUI: GameObject;   //  UI_Help
    @SerializeField() private helpWindow_full: GameObject;  // 캐릭터가 다 나오는 도움말
    @SerializeField() private helpWindow_upper: GameObject; // 위쪽 공간 설명용 도움말
    @SerializeField() private helpWindow_lower: GameObject; // 아래쪽 공간 설명용 도움말
    @SerializeField() private guideObjects: GameObject[];   // 가이드 시 필요한 오브젝트들
    private gameObjectMap = new Map<string, GameObject>();  // 게임오브젝트 검색을 편하게 하기 위하
    private window_full: HelpWindow;
    private window_upper: HelpWindow;
    private window_lower: HelpWindow;

    @SerializeField() private helpContents_Dispenser: GameObject;   // 디스펜서 도움말 창
    @SerializeField() private helpContents_Grill: GameObject;       // 그릴 도움말 창
    @SerializeField() private helpContents_Employee: GameObject;    // 고용 도움말 창
    @SerializeField() private helpContents_Prep: GameObject;        // 프랩 도움말 창
    @SerializeField() private helpContents_Fryer: GameObject;       // 튀김기 도움말 창
    @SerializeField() private helpContents_Plating: GameObject;     // 플레이팅 도움말 창
    @SerializeField() private helpContents_Double: Button;          // 두 배 버튼
    @SerializeField() private helpContents_DoubleConfirm: Button;   // 두 배 확인 버튼
    @SerializeField() private helpContents_Next: Button;            // Next(ToShop)버튼
    @SerializeField() private helpContents_GetCard: Button;         // GetCard버튼

    Start(){
        for (const gameObject of this.guideObjects) {
            const name = gameObject.name; // Get the name of the current GameObject.
            let group = this.gameObjectMap.get(name); // Get the array of GameObjects with the same first word.
            this.gameObjectMap.set(name, gameObject);
        }
        this.helpUI.SetActive(false);
        this.ClearHelpWindow();
        this.background.gameObject.SetActive(true);
    }

    public setBackgroundVisibility(visible: boolean) {
        this.background.enabled = visible;
    }

    private ClearHelpWindow(){
        this.helpWindow_full.SetActive(false);
        this.helpWindow_upper.SetActive(false);
        this.helpWindow_lower.SetActive(false);
    }

    private DisplayTextWithId(helpWindowObj: GameObject, displayText: TextMeshProUGUI, contentsId: string) {
        this.ClearHelpWindow();
        helpWindowObj.SetActive(true);
        this.nextBtn.gameObject.SetActive(true);
        UIManager.GetInstance().PlayText(displayText, DataManager.GetInstance().GetCurrentLanguageData(contentsId));
    }

    public GuideStartGame(){
        this.helpUI.SetActive(true);
        GameManager.GetInstance().SetTutorialTimeScale();
        this.StartCoroutine(this.GuideStartRoutine());
    }

    *GuideStartRoutine(){
        let curPage = 0;

        // page 1
        this.setBackgroundVisibility(true);
        this.DisplayTextWithId(this.helpWindow_full, this.window_full.GetHelpText(), "tutorial_start_ment1");
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
        this.DisplayTextWithId(this.helpWindow_lower, this.window_lower.GetHelpText(), "tutorial_start_ment2");
        this.nextBtn.onClick.RemoveAllListeners();
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
        const focus_plating = this.gameObjectMap.get("Focus_Section_Plating");
        focus_plating.SetActive(true);
        this.setBackgroundVisibility(false);
        this.DisplayTextWithId(this.helpWindow_full, this.window_full.GetHelpText(), "tutorial_start_ment3");
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                curPage = 3;
            }
        });
        while (curPage < 3) yield null;
        const open_plating = GameObject.FindGameObjectWithTag("PlatingOpen")?.GetComponent<Interaction>()?.GetOpenButton();
        const guide_plating = this.gameObjectMap.get("Guide_Section_Plating");
        this.DisplayTextWithId(this.helpWindow_full, this.window_full.GetHelpText(), "tutorial_start_ment4");
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                this.helpWindow_full.SetActive(false);
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

        // page 5
        const help_openBtn = this.gameObjectMap.get("Help_OpenHelpBtn");
        help_openBtn.SetActive(true);
        const help_closeBtn = this.gameObjectMap.get("Help_CloseHelpBtn");
        help_closeBtn.SetActive(false);
        this.setBackgroundVisibility(true);
        this.DisplayTextWithId(this.helpWindow_upper, this.window_upper.GetHelpText(), "tutorial_start_ment5");
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(() => {
            if(UIManager.GetInstance().nextText()){
                this.helpWindow_upper.SetActive(false);
            }
        });
        help_openBtn.GetComponent<Button>().onClick.AddListener(()=>{
            this.OpenHelpSection(Section.Plating);
            help_closeBtn.SetActive(true);
            this.setBackgroundVisibility(false);
            this.helpWindow_upper.SetActive(false);
            help_openBtn.SetActive(false);
            this.nextBtn.gameObject.SetActive(false);
        });
        help_closeBtn.GetComponent<Button>().onClick.AddListener(()=>{
            curPage = 5;
            help_closeBtn.SetActive(false);
        });
        while (curPage < 5) yield null;

        // page 6, 7
        const focus_receipt = this.gameObjectMap.get("Focus_Receipt");
        focus_receipt.SetActive(true);
        this.setBackgroundVisibility(false);
        this.DisplayTextWithId(this.helpWindow_full, this.window_full.GetHelpText(), "tutorial_start_ment6");
        this.nextBtn.onClick.RemoveAllListeners();
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
        this.DisplayTextWithId(this.helpWindow_full, this.window_full.GetHelpText(), "tutorial_start_ment7");
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                this.nextBtn.gameObject.SetActive(false);
                this.helpWindow_full.SetActive(false);
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

        // page 8
        this.DisplayTextWithId(this.helpWindow_full, this.window_full.GetHelpText(), "tutorial_start_ment8");
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                curPage = 8;
            }
        });
        while (curPage < 8) yield null;

        this.ClearHelpWindow();
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
        this.helpContents_Next.enabled = false;
        this.helpContents_Double.enabled = false;

        // page 1
        this.setBackgroundVisibility(false);
        this.DisplayTextWithId(this.helpWindow_full, this.window_full.GetHelpText(), "tutorial_settlement_ment1");
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                curPage = 1;
            }
        });
        while (curPage < 1) yield null;

        // page 2
        const focus_double = this.gameObjectMap.get("Focus_Double");
        focus_double.SetActive(true);
        this.DisplayTextWithId(this.helpWindow_lower, this.window_lower.GetHelpText(), "tutorial_settlement_ment2");
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                curPage = 2;
            }
        });
        while (curPage < 2) yield null;

        // page 3
        this.DisplayTextWithId(this.helpWindow_lower, this.window_lower.GetHelpText(), "tutorial_settlement_ment3");
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                this.nextBtn.gameObject.SetActive(false);
                this.helpWindow_lower.SetActive(false);
                this.helpContents_Double.enabled = true;
            }
        });
        this.helpContents_Double.onClick.AddListener(() => {
            if(focus_double) focus_double.SetActive(false);
        });
        this.helpContents_DoubleConfirm.onClick.AddListener(() => {
            if(curPage = 2) curPage = 3;
        });
        while (curPage < 3) yield null;
        yield new WaitForSeconds(1.5);

        // page 4
        const focus_next = this.gameObjectMap.get("Focus_Next");
        focus_next.SetActive(true);
        this.DisplayTextWithId(this.helpWindow_lower, this.window_lower.GetHelpText(), "tutorial_settlement_ment4");
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(() => {
            if (UIManager.GetInstance().nextText()) {
                this.helpWindow_lower.SetActive(false);
                this.nextBtn.gameObject.SetActive(false);
                this.helpContents_Next.enabled = true;
            }
        });
        this.helpContents_Next.onClick.AddListener(() => {
            if(focus_next) focus_next.SetActive(false);
        });
    }

    public GuideSection(section: string){
        GameManager.GetInstance().SetTutorialTimeScale();
        this.helpUI.SetActive(true);
        if(section == "employee"){
            this.StartCoroutine(this.GuideEmployeeRoutine());
        }
        else{
            this.StartCoroutine(this.GuideUnlockSectionRoutine(section));
        }
    }

    *GuideUnlockSectionRoutine(section: string){
        // 첫 글자를 대문자로 변경
        const capitalizedSection = section.charAt(0).toUpperCase() + section.slice(1).toLowerCase();
        let curPage = 0;

        // page 1
        this.setBackgroundVisibility(false);
        this.DisplayTextWithId(this.helpWindow_lower, this.window_lower.GetHelpText(), `tutorial_${section.toLowerCase()}_ment1`);
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                curPage = 1;
            }
        });
        while (curPage < 1) yield null;

        // page 2
        const playButton = this.gameObjectMap.get("Help_ToStageBtn");
        playButton.SetActive(true);
        this.DisplayTextWithId(this.helpWindow_lower, this.window_lower.GetHelpText(), `tutorial_${section.toLowerCase()}_ment2`);
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                this.helpWindow_lower.SetActive(false);
                this.nextBtn.gameObject.SetActive(false);
            }
        });
        playButton.GetComponent<Button>().onClick.AddListener(()=>{
            GameManager.GetInstance().NextStage();
            curPage = 2;
            playButton.SetActive(false);
        });
        while (curPage < 2) yield null;
        
        // page 3
        const focus = this.gameObjectMap.get(`Focus_Section_${capitalizedSection}`);
        focus.SetActive(true);
        this.DisplayTextWithId(this.helpWindow_full, this.window_full.GetHelpText(), `tutorial_${section.toLowerCase()}_ment3`);
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                curPage = 3;
            }
        });
        while (curPage < 3) yield null;

        // page 4
        let open: Button;
        if(section == "grill"){
            open = GameObject.FindGameObjectWithTag(`${capitalizedSection}Open`)?.GetComponent<Interaction_Grill>()?.GetOpenButton();
        }
        else if(section == "fryer"){
            open = GameObject.FindGameObjectWithTag(`${capitalizedSection}Open`)?.GetComponent<Interaction_Fry>()?.GetOpenButton();
        }
        else {
            open = GameObject.FindGameObjectWithTag(`${capitalizedSection}Open`)?.GetComponent<Interaction>()?.GetOpenButton();
        }
        const guide = this.gameObjectMap.get(`Guide_Section_${capitalizedSection}`);
        this.nextBtn.onClick.RemoveAllListeners();
        this.DisplayTextWithId(this.helpWindow_full, this.window_full.GetHelpText(), `tutorial_${section.toLowerCase()}_ment4`);
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                this.helpWindow_full.SetActive(false);
                focus.SetActive(false);
                this.nextBtn.gameObject.SetActive(false);
                guide.SetActive(true);
            }
        });
        open.onClick.AddListener(() => {
            if(curPage == 3) curPage = 4;
        });
        while (curPage < 4) yield null;
        guide.SetActive(false);

        switch(section.toLowerCase()){
            case "dispenser":
                this.OpenHelpSection(Section.Dispenser);
                break;
            case "grill":
                this.OpenHelpSection(Section.Grill);
                break;
            case "slice":
                this.OpenHelpSection(Section.Prep);
                break;
            case "frier":
                this.OpenHelpSection(Section.Fryer);
                break;
        }

        this.ClearHelpWindow();
        this.helpUI.SetActive(false);
        GameManager.GetInstance().SetTutorialPlayTime(14);
    }

    *GuideEmployeeRoutine(){
        let curPage = 0;
        const playMask = this.gameObjectMap.get("Help_PlayMask");
        playMask.SetActive(true);

        // page 1
        this.setBackgroundVisibility(false);
        this.DisplayTextWithId(this.helpWindow_lower, this.window_lower.GetHelpText(), "tutorial_employee_ment1");
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                curPage = 1;
            }
        });
        while (curPage < 1) yield null;

        // page 2
        const focus_Employee = this.gameObjectMap.get("Focus_Employee");
        focus_Employee.SetActive(true);
        this.DisplayTextWithId(this.helpWindow_full, this.window_full.GetHelpText(), "tutorial_employee_ment2");
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                this.helpWindow_full.SetActive(false);
                this.nextBtn.gameObject.SetActive(false);
            }
        });
        const category_employee = GameObject.FindGameObjectWithTag("CategoryEmployee")?.GetComponent<Button>();
        category_employee.onClick.AddListener(()=>{
            focus_Employee.SetActive(false);
            curPage = 2;
        });
        while (curPage < 2) yield null;

        // page 3
        const categoryMask = this.gameObjectMap.get("Help_CategoryMask");
        categoryMask.SetActive(true);
        const buyCardBtn = GameObject.FindGameObjectWithTag("BuyCard")?.GetComponent<Button>();
        const helpBuyBtn = this.gameObjectMap.get("Help_BuyCardBtn");
        this.DisplayTextWithId(this.helpWindow_lower, this.window_lower.GetHelpText(), "tutorial_employee_ment3");
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                BalanceManager.GetInstance().GainBalance(Currency.wak, 500);
                helpBuyBtn.SetActive(true);
                this.setBackgroundVisibility(true);
                this.helpWindow_lower.SetActive(false);
                this.nextBtn.gameObject.SetActive(false);
            }
        });
        helpBuyBtn.GetComponent<Button>().onClick.AddListener(()=>{
            buyCardBtn.onClick.Invoke();
            helpBuyBtn.SetActive(false);
            this.setBackgroundVisibility(false);
        });
        this.helpContents_GetCard.onClick.AddListener(()=>{
            if(curPage == 2) curPage = 3;
        });
        while (curPage < 3) yield null;

        // page 4
        const openMyCardBtn = GameObject.FindGameObjectWithTag("OpenMyCard")?.GetComponent<Button>();
        const focus_MyCard = this.gameObjectMap.get("Focus_MyCard");
        this.DisplayTextWithId(this.helpWindow_lower, this.window_lower.GetHelpText(), "tutorial_employee_ment4");
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(() => {
            if (UIManager.GetInstance().nextText()) {
                this.helpWindow_lower.SetActive(false);
                focus_MyCard.SetActive(true);
                this.nextBtn.gameObject.SetActive(false);
            }
        });
        openMyCardBtn.onClick.AddListener(() => {
            if (curPage == 3) curPage = 4;
            focus_MyCard.SetActive(false);
            categoryMask.SetActive(false);
        });
        while (curPage < 4) yield null;

        // page 5
        this.DisplayTextWithId(this.helpWindow_upper, this.window_upper.GetHelpText(), "tutorial_employee_ment5");
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                curPage = 5;
            }
        });
        while (curPage < 5) yield null;

        // page 6
        const closeMyCardBtn = GameObject.FindGameObjectWithTag("CloseMyCard")?.GetComponent<Button>();
        const categoryUpgradeBtn = GameObject.FindGameObjectWithTag("CategoryUpgrade")?.GetComponent<Button>();
        const focus_CloseInventory = this.gameObjectMap.get("Focus_CloseInventory");
        const focus_Upgrade = this.gameObjectMap.get("Focus_Upgrade");
        this.DisplayTextWithId(this.helpWindow_upper, this.window_upper.GetHelpText(), "tutorial_employee_ment6");
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(() => {
            if (UIManager.GetInstance().nextText()) {
                this.helpWindow_upper.SetActive(false);
                focus_CloseInventory.SetActive(true);
                playMask.SetActive(false);
                this.nextBtn.gameObject.SetActive(false);
            }
        });
        const closeBtn = playMask.GetComponent<Button>();
        closeBtn.onClick.AddListener(() => {
            closeMyCardBtn.onClick.Invoke();
            focus_CloseInventory.SetActive(false);
            focus_Upgrade.SetActive(true);
            closeBtn.onClick.RemoveAllListeners();
        });
        categoryUpgradeBtn.onClick.AddListener(() => {
            if (curPage == 5) curPage = 6;
            focus_Upgrade.SetActive(false);
            categoryMask.SetActive(true);
        });
        while (curPage < 6) yield null;

        // page 7
        const ShopUpgrade = GameObject.FindGameObjectWithTag("ShopUpgrade")?.GetComponent<Shop_Upgrade>();
        const upgradeBtn = ShopUpgrade.FindUpgradeSlotWithId("upgrade_employee_1")?.GetBuyBtn();
        this.DisplayTextWithId(this.helpWindow_upper, this.window_upper.GetHelpText(), "tutorial_employee_ment7");
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(() => {
            if (UIManager.GetInstance().nextText()) {
                this.helpWindow_upper.SetActive(false);
                this.nextBtn.gameObject.SetActive(false);
            }
        });
        if(upgradeBtn) upgradeBtn.onClick.AddListener(() => {
            if(curPage == 6) curPage = 7;
        });
        else{
            this.nextBtn.onClick.AddListener(() => {
                curPage = 7;
            });
        }
        while (curPage < 7) yield null;

        // page 8
        this.DisplayTextWithId(this.helpWindow_lower, this.window_lower.GetHelpText(), "tutorial_employee_ment8");
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(() => {
            if (UIManager.GetInstance().nextText()) {
                this.helpWindow_upper.SetActive(false);
                focus_MyCard.SetActive(true);
                this.nextBtn.gameObject.SetActive(false);
            }
        });
        openMyCardBtn.onClick.AddListener(() => {
            if (curPage == 7) curPage = 8;
        });
        while (curPage < 8) yield null;
        categoryMask.SetActive(false);

        // page 9
        const focus_Equip = this.gameObjectMap.get("Focus_Equip");
        focus_Equip.SetActive(true);
        this.DisplayTextWithId(this.helpWindow_lower, this.window_lower.GetHelpText(), "tutorial_employee_ment9");
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(() => {
            if (UIManager.GetInstance().nextText()) {
                curPage = 9;
                focus_Equip.SetActive(false);
            }
        });
        while (curPage < 9) yield null;

        // page 10
        const focus_SelectSection = this.gameObjectMap.get("Focus_SelectSection");
        focus_SelectSection.SetActive(true);
        this.DisplayTextWithId(this.helpWindow_upper, this.window_upper.GetHelpText(), "tutorial_employee_ment10");
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(() => {
            if (UIManager.GetInstance().nextText()) {
                curPage = 10;
                focus_SelectSection.SetActive(false);
            }
        });
        while (curPage < 10) yield null;

        // page 11
        playMask.SetActive(false);
        const playButton = this.gameObjectMap.get("Help_ToStageBtn");
        playButton.SetActive(false);
        this.DisplayTextWithId(this.helpWindow_lower, this.window_lower.GetHelpText(), "tutorial_employee_ment11");
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                this.helpWindow_lower.SetActive(false);
                this.nextBtn.gameObject.SetActive(false);
                closeMyCardBtn.gameObject.SetActive(true);
            }
        });
        closeBtn.onClick.AddListener(() => {
            closeMyCardBtn.onClick.Invoke();
            this.nextBtn.onClick.RemoveAllListeners();
            this.setBackgroundVisibility(true);
            this.nextBtn.gameObject.SetActive(true);
            playButton.SetActive(true);
            closeBtn.onClick.RemoveAllListeners();
        });
        playButton.GetComponent<Button>().onClick.AddListener(()=>{
            GameManager.GetInstance().NextStage();
            curPage = 11;
        });
        while (curPage < 11) yield null;
        playButton.SetActive(false);
        this.setBackgroundVisibility(false);

        // page 12
        const focus = this.gameObjectMap.get("Focus_EmployeeSlot");
        focus.SetActive(true);
        this.DisplayTextWithId(this.helpWindow_upper, this.window_upper.GetHelpText(), "tutorial_employee_ment12");
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                curPage = 12;
            }
        });
        while (curPage < 12) yield null;

        // page 13
        this.DisplayTextWithId(this.helpWindow_upper, this.window_upper.GetHelpText(), "tutorial_employee_ment13");
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(() => {
            if (UIManager.GetInstance().nextText()) {
                curPage = 13;
            }
        });
        while (curPage < 13) yield null;

        // page 14
        this.DisplayTextWithId(this.helpWindow_upper, this.window_upper.GetHelpText(), "tutorial_employee_ment14");
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(() => {
            if (UIManager.GetInstance().nextText()) {
                curPage = 14;
            }
        });
        while (curPage < 14) yield null;

        // page 15
        this.DisplayTextWithId(this.helpWindow_upper, this.window_upper.GetHelpText(), "tutorial_employee_ment15");
        this.nextBtn.onClick.RemoveAllListeners();
        this.nextBtn.onClick.AddListener(() => {
            if (UIManager.GetInstance().nextText()) {
                curPage = 15;
            }
        });
        while (curPage < 15) yield null;

        this.ClearHelpWindow();
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

    public OpenHelpSection(section: Section) {
        UIManager.GetInstance().OpenHelpPanel();
        this.ClearHelpContents();
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