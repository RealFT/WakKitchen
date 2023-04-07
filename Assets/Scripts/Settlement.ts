import { Color, Mathf, Time, WaitForSeconds } from 'UnityEngine';
import { Text, Button } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from './GameManager';
import UIManager from './UIManager';
import BalanceManager, { Currency } from './Shop/BalanceManager';

// Settlement UI class that displays information about daily profits and costs.
export default class Settlement extends ZepetoScriptBehaviour {

    @SerializeField() private dateText: Text;
    @SerializeField() private totalSaleText: Text;
    @SerializeField() private employeeText: Text;
    @SerializeField() private IngredientsText: Text;
    @SerializeField() private netIncomeText: Text;
    @SerializeField() private doubleIncomeButton: Button;
    @SerializeField() private toShopButton: Button;
    @SerializeField() private animationDuration: number;
    private animationInProgress: boolean = false;

    // Array of Generator functions that will be stored in the animations array.
    // Each function animates a single UI element with a corresponding value.
    private animations: (() => Generator)[] = [
        () => this.NumberAnimation(this.totalSaleText, this.totalSale, this.animationDuration),
        () => this.NumberAnimation(this.employeeText, -this.employeeCost, this.animationDuration),
        () => this.NumberAnimation(this.IngredientsText, -this.ingredientsCost, this.animationDuration),
        () => this.NumberAnimation(this.netIncomeText, this.netIncome, this.animationDuration)
    ];

    private totalSale: number;
    private ingredientsCost: number;
    private employeeCost: number;
    private netIncome: number;

    Start() {
        this.doubleIncomeButton.onClick.AddListener(() => {
            this.OnDoubleIncome();
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
    private *NumberAnimation(targetText: Text, endNumber: number, duration: number) {
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
    }

    // Called when the Settlement UI is enabled.
    // Resets all Text UI elements to empty strings and starts the AnimationSequence coroutine.
    private OnEnable() {
        this.doubleIncomeButton.gameObject.SetActive(true);
        this.ResetPriceTexts();
        this.GetPriceInformation();
        this.StartCoroutine(this.AnimationSequence());
    }

    // Resets all Text UI elements to empty strings.
    private ResetPriceTexts() {
        this.dateText.text = `Day ${GameManager.GetInstance().GetCurrentStage()}`;
        this.totalSaleText.text = "";
        this.employeeText.text = "";
        this.IngredientsText.text = "";
        this.netIncomeText.text = "";
    }

    // Gets daily profit and cost information from the BalanceManager class and calculates net income.
    private GetPriceInformation() {
        this.totalSale = BalanceManager.GetInstance().GetTotalGainBalanceHistory();
        this.ingredientsCost = BalanceManager.GetInstance().GetTotalUseBalanceHistory();
        this.employeeCost = 300;
        this.netIncome = this.totalSale - this.ingredientsCost - this.employeeCost;
        this.netIncomeText.color = this.netIncome >= 0 ? this.totalSaleText.color : this.IngredientsText.color;
    }

    // Doubles the current net income and displays the result using animation.
    private OnDoubleIncome(): void {
        if (this.animationInProgress) {
            return; // Ignore the click event if the animation is in progress.
        }
        this.doubleIncomeButton.gameObject.SetActive(false);
        
        // Double the current net income and add the previous net income as profit.
        BalanceManager.GetInstance().GainBalance(Currency.wak, this.netIncome);
        this.netIncome *= 2;

        // Run the ScoreAnimation coroutine.
        this.animationInProgress = true;
        this.StartCoroutine(this.NumberAnimation(this.netIncomeText, this.netIncome, this.animationDuration));
    }

}