import { GameObject, Random, RectTransform, Sprite, Time, Transform, Vector2, Vector3, WaitForSeconds } from 'UnityEngine';
import { Button, Image } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import Cup, { CupState } from './Cup';
import OrderManager from './OrderManager';
import { Drink } from './DataManager';
import ItemManager from './ItemManager';
import Mediator, { EventNames, IListener }  from './Notification/Mediator';
import SoundManager from './SoundManager';
import DataManager, { Section } from './DataManager';
import HelpManager from './Help/HelpManager';
export default class Dispenser extends ZepetoScriptBehaviour implements IListener  {

    @SerializeField() private helpButton: Button; // Button to help
    @SerializeField() private leftMax: RectTransform; // Max value that can be moved to the left
    @SerializeField() private rightMax: RectTransform; // Max value that can be moved to the right
    @SerializeField() private cupTransform: RectTransform; // Cup's Transform
    @SerializeField() private speed: number; //이동속도+방향
    @SerializeField() private speedRange: number = 0.1; //이동속도 오차
    @SerializeField() private direction: number; //이동속도+방향
    @SerializeField() private stopBtn: Button;
    @SerializeField() private cupBtn: Button;
    @SerializeField() private cup: Cup;
    @SerializeField() private defaultCupSprite: Sprite;
    @SerializeField() private cupSprites: Sprite[];
    private curDrink: number;
    private quantity: number = 1;
    private isCatch: boolean;

    Start() {
        this.cup = this.cupBtn.gameObject.GetComponent<Cup>();
        this.stopBtn.onClick.AddListener(() => {
            this.isCatch = (this.isCatch) ? false : true;
            if (!this.isCatch) {
                if (this.cup.GetState() != CupState.DEFAULT){
                    OrderManager.GetInstance().AddItemToInventory(this.curDrink, this.quantity);
                    SoundManager.GetInstance().OnPlaySFX("Dispenser_liquid");
                    this.cupBtn.gameObject.SetActive(false);
                    this.isCatch = true;
                }
                else
                    this.StartMoving();
            }
            else this.CheckDrink();
        });
        this.cupBtn.onClick.AddListener(() => {
            OrderManager.GetInstance().AddItemToInventory(this.curDrink, this.quantity);
            SoundManager.GetInstance().OnPlaySFX("Dispenser_liquid");
            this.cupBtn.gameObject.SetActive(false);
        });
        this.helpButton.onClick.AddListener(() => {
            HelpManager.GetInstance().OpenHelpSection(Section.Dispenser);
        });

        const upgradedlevel = ItemManager.GetInstance().GetUpgradedLevel("dispenser");
        this.DispenserUnlock(upgradedlevel);
        Mediator.GetInstance().RegisterListener(this);
    }

    private OnDestroy() {
        Mediator.GetInstance().UnregisterListener(this);
    }

    public OnNotify(sender: any, eventName: string, eventData: any): void {
        if(eventName === EventNames.UpgradeUpdated){
            const upgradedlevel = ItemManager.GetInstance().GetUpgradedLevel("dispenser");
            this.DispenserUnlock(upgradedlevel);
        }
    }

    private OnEnable(){
        this.StartMoving();
    }

    StartMoving() {
        this.StopAllCoroutines();
        this.isCatch = false;
        // const startPos = new Vector2(Random.Range(this.leftMax.anchoredPosition.x, this.rightMax.anchoredPosition.x), this.cupTransform.anchoredPosition.y);
        // this.cupTransform.anchoredPosition = startPos;
        const isLeft = Random.value < 0.5; // 랜덤으로 leftMax 혹은 rightMax를 선택합니다.
        const startPosX = isLeft ? this.leftMax.anchoredPosition.x : this.rightMax.anchoredPosition.x;
        const startPos = new Vector2(startPosX, this.cupTransform.anchoredPosition.y);
        this.cupTransform.anchoredPosition = startPos;
        this.StartCoroutine(this.DoMoving());
        this.InitCupImage();
        this.cupBtn.interactable = false;
        this.cupBtn.gameObject.SetActive(true);
    }

    // Dispenser Coroutine
    *DoMoving() {
        const randomSpeed =  this.speed * Random.Range(1 - this.speedRange, 1 + this.speedRange);
        while (!this.isCatch) {
            const move = new Vector2(Time.deltaTime * randomSpeed * this.direction, 0);
            this.cupTransform.anchoredPosition = this.cupTransform.anchoredPosition + move;
            //If the current anchoredPosition (x) is greater than or equal to the maximum value that can be moved rightward
            // Invert the movement speed + direction by multiplying it by -1 and setting the current anchoredPosition to the maximum value that can be moved to the right.
            if (this.cupTransform.anchoredPosition.x >= this.rightMax.anchoredPosition.x) {
                this.direction *= -1;
                this.cupTransform.anchoredPosition = this.rightMax.anchoredPosition;
            }
            //If the current anchoredPosition (x) is greater than or equal to the maximum left-leasable (x),
            // Invert movement speed + direction by multiplying -1 and setting the current anchoredPosition to the maximum value that can be moved to the left
            else if (this.cupTransform.anchoredPosition.x <= this.leftMax.anchoredPosition.x) {
                this.direction *= -1;
                this.cupTransform.anchoredPosition = this.leftMax.anchoredPosition;
            }
            yield;
        }
    }

    private CheckDrink() {
        if (this.cup) {
            const state = this.cup.GetState();
            if (state != CupState.DEFAULT) {
                this.curDrink = this.GetDrinkByState(state);
                this.SetCupImage(this.curDrink);
                this.cupBtn.interactable = true;
                SoundManager.GetInstance().OnPlaySFX("Dispenser_liquid");
            }
            else this.InitCupImage();
        }
    }

    private GetDrinkByState(state: CupState): Drink {
        switch (state) {
            case CupState.PAENCHI:
                return Drink.PAENCHI;
            case CupState.NECKSRITE:
                return Drink.NECKSRITE;
            case CupState.HOTCHS:
                return Drink.HOTCHS;
            case CupState.ORANGE:
                return Drink.ORANGE;
            case CupState.PINEAPPLE:
                return Drink.PINEAPPLE;
        }
    }

    private InitCupImage() {
        this.cupBtn.image.sprite = this.defaultCupSprite;
    }

    private SetCupImage(drink: Drink) {
        this.cupBtn.image.sprite = this.cupSprites[drink - Drink.START];
    }

    public DispenserUnlock(level:number){
        if(level >= 1){
            this.speed *=1.3;
        }
        if(level >= 2){
            this.speed *=1.3;
            this.speedRange *=0.5;
        }
        if(level >= 3){
            this.quantity = 2;
        }
    }
}