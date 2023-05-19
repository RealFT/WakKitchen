import { Color, Mathf, Time, WaitForSeconds } from 'UnityEngine';
import { Text, Button } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from './GameManager';
import UIManager from './UIManager';
import BalanceManager, { Currency } from './Shop/BalanceManager';
import DataManager from './DataManager';
import EmployeeManager from './Employee/EmployeeManager';
import SoundManager from './SoundManager';
import HelpManager from './Help/HelpManager';
import { TextMeshProUGUI } from 'TMPro';

// Settlement UI class that displays information about daily profits and costs.
export default class Settlement extends ZepetoScriptBehaviour {

    @SerializeField() private dateText: TextMeshProUGUI;
    @SerializeField() private totalSaleText: TextMeshProUGUI;
    @SerializeField() private totalSaleMoneyText: TextMeshProUGUI;
    @SerializeField() private employeeText: TextMeshProUGUI;
    @SerializeField() private employeeMoneyText: TextMeshProUGUI;
    // @SerializeField() private IngredientsText: TextMeshProUGUI;
    // @SerializeField() private IngredientsMoneyText: TextMeshProUGUI;
    @SerializeField() private netIncomeText: TextMeshProUGUI;
    @SerializeField() private netIncomeMoneyText: TextMeshProUGUI;

    @SerializeField() private doubleIncomeButton: Button;
    @SerializeField() private toShopButton: Button;
    @SerializeField() private animationDuration: number;
    private animationInProgress: boolean = false;

    // Array of Generator functions that will be stored in the animations array.
    // Each function animates a single UI element with a corresponding value.
    private animations: (() => Generator)[] = [
        () => this.NumberAnimation(this.totalSaleMoneyText, this.totalSale, this.animationDuration),
        () => this.NumberAnimation(this.employeeMoneyText, -this.employeeCost, this.animationDuration),
        // () => this.NumberAnimation(this.IngredientsMoneyText, -this.ingredientsCost, this.animationDuration),
        () => this.NumberAnimation(this.netIncomeMoneyText, this.netIncome, this.animationDuration)
    ];

    private totalSale: number;
    private ingredientsCost: number;
    private employeeCost: number;
    private netIncome: number;

    // Called when the Settlement UI is enabled.
    // Resets all Text UI elements to empty strings and starts the AnimationSequence coroutine.
    OnEnable(){
        this.totalSaleText.text = DataManager.GetInstance().GetCurrentLanguageData("settlement_total");
        this.employeeText.text = DataManager.GetInstance().GetCurrentLanguageData("settlement_employee");
        // this.IngredientsText.text = DataManager.GetInstance().GetCurrentLanguageData("settlement_ingredient");
        this.netIncomeText.text = DataManager.GetInstance().GetCurrentLanguageData("settlement_netIncome");

        this.doubleIncomeButton.gameObject.SetActive(true);
        this.ResetPriceTexts();
        this.GetPriceInformation();
        this.StartCoroutine(this.AnimationSequence());
        SoundManager.GetInstance().OnPlayOnceBGM(SoundManager.GetInstance().keySettlement);
    }

    Start() {
        this.doubleIncomeButton.onClick.AddListener(() => {
            this.OnDoubleIncome();
            SoundManager.GetInstance().OnPlayButtonSFX("Purchase");
        });
        this.toShopButton.onClick.AddListener(() => {
            UIManager.GetInstance().ToShop();
        });
    }

    /**
     * Coroutine function that animates a number on a Text UI element from 0 to the specified endNumber.
     * @param targetText Text UI element that will display the animated number.
     * @param endNumber The number that the animation will end on.
     * @param duration The duration of the animation in seconds.
     */
    private *NumberAnimation(targetText: TextMeshProUGUI, endNumber: number, duration: number) {
        let timer: number = 0;

        while (timer < duration) {
            const progress: number = timer / duration;
            const currentNumber: number = Math.floor(Mathf.Lerp(0, endNumber, progress));
            targetText.text = currentNumber.toLocaleString();

            yield new WaitForSeconds(Time.deltaTime);
            timer += Time.deltaTime;
        }
        targetText.text = `${endNumber}`;
    }

    //  Coroutine function that plays a sequence of animations stored in the animations array.
    private *AnimationSequence() {
        for (const animation of this.animations) {
            this.animationInProgress = true;
            yield* animation();
            this.animationInProgress = false;
        }
        if(GameManager.GetInstance().GetCurrentStage() == 2){
            HelpManager.GetInstance().GuideSettlement();
        }
    }

    // Resets all Text UI elements to empty strings.
    private ResetPriceTexts() {
        this.dateText.text = `Day ${GameManager.GetInstance().GetCurrentStage()}`;
        this.totalSaleMoneyText.text = "";
        this.employeeMoneyText.text = "";
        // this.IngredientsMoneyText.text = "";
        this.netIncomeMoneyText.text = "";
    }

    // Gets daily profit and cost information from the BalanceManager class and calculates net income.
    private GetPriceInformation() {
        this.totalSale = BalanceManager.GetInstance().GetTotalGainBalanceHistory();
        this.ingredientsCost = BalanceManager.GetInstance().GetTotalUseBalanceHistory();
        this.employeeCost = EmployeeManager.GetInstance().GetTotalEmployeePay();
        if(this.employeeCost > 0) BalanceManager.GetInstance().UseAvailableBalance(Currency.wak, this.employeeCost);
        this.netIncome = this.totalSale - this.ingredientsCost - this.employeeCost;
        this.netIncomeMoneyText.color = this.netIncome >= 0 ? this.totalSaleMoneyText.color : this.employeeMoneyText.color;
    }

    // Doubles the current net income and displays the result using animation.
    private OnDoubleIncome(): void {
        if (this.animationInProgress) {
            return; // Ignore the click event if the animation is in progress.
        }
        // Initailize wakdu stamp
        let currentWakdu: number = DataManager.GetInstance().GetValue("wakdu");
        // if current stage is tutorial stage,
        if (GameManager.GetInstance().GetCurrentStage() == 2) {
            currentWakdu++;
        }
        if(currentWakdu > 0){
            // If wakdu stamps left, reduce one from the current count.            
            DataManager.GetInstance().SetValue("wakdu", currentWakdu - 1);

            this.doubleIncomeButton.gameObject.SetActive(false);
            
            // Double the current net income and add the previous net income as profit.
            BalanceManager.GetInstance().GainBalance(Currency.wak, this.netIncome);
            this.netIncome *= 2;
    
            // Run the ScoreAnimation coroutine.
            this.animationInProgress = true;
            this.StartCoroutine(this.NumberAnimation(this.netIncomeMoneyText, this.netIncome, this.animationDuration));
        }
        // If there are no more Wakdu stamps left, inform the user with an information popup.
        else{
            UIManager.GetInstance().OpenInformation(DataManager.GetInstance().GetCurrentLanguageData("info_nostamp"));
            return;
        }
    }

}