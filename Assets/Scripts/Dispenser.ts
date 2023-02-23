import { GameObject, Random, RectTransform, Sprite, Time, Transform, Vector2, Vector3, WaitForSeconds } from 'UnityEngine';
import { Button, Image } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import Cup, { CupState } from './Cup';
import OrderManager, { Drink } from './OrderManager';

export default class Dispenser extends ZepetoScriptBehaviour {

    public leftMax: RectTransform; // Max value that can be moved to the left
    public rightMax: RectTransform; // Max value that can be moved to the right
    public cupTransform: RectTransform; // Cup's Transform
    public speed: number; //이동속도+방향
    public direction: number; //이동속도+방향
    private isCatch: boolean;
    public stopBtn: Button;
    public cupBtn: Button;
    public cup: Cup;
    private curDrink: number;
    public defaultCupSprite: Sprite;
    public cupSprites: Sprite[];

    Start() {
        this.cup = this.cupBtn.gameObject.GetComponent<Cup>();
        this.init();
        this.stopBtn.onClick.AddListener(() => {
            this.isCatch = (this.isCatch) ? false : true;
            if (!this.isCatch) this.init();
            else this.CheckDrink();
        });
        this.cupBtn.onClick.AddListener(() => {
            OrderManager.GetInstance().AddItemToInventory(this.curDrink);
        });
    }

    init() {
        this.StopAllCoroutines();
        this.isCatch = false;
        const startPos = new Vector2(Random.Range(this.leftMax.anchoredPosition.x, this.rightMax.anchoredPosition.x), this.cupTransform.anchoredPosition.y);
        this.cupTransform.anchoredPosition = startPos;
        this.StartCoroutine(this.DoMoving());
        this.InitCupImage();
        this.cupBtn.interactable = false;
    }

    // Dispenser Coroutine
    *DoMoving() {
        while (!this.isCatch) {
            const move = new Vector2(Time.deltaTime * this.speed * this.direction, 0);
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
            }
            else this.InitCupImage();
        }
    }

    private GetDrinkByState(state: CupState): Drink {
        switch (state) {
            case CupState.COKE:
                return Drink.COKE;
            case CupState.SPRITE:
                return Drink.SPRITE;
            case CupState.ZERO:
                return Drink.ZERO_COKE;
            case CupState.FANTA:
                return Drink.FANTA;
            case CupState.WATER:
                return Drink.WATER;
        }
    }

    private InitCupImage() {
        this.cupBtn.image.sprite = this.defaultCupSprite;
    }

    private SetCupImage(drink: Drink) {
        this.cupBtn.image.sprite = this.cupSprites[drink - Drink.START];
    }
}