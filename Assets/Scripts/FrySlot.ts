import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { WaitForSeconds, Time, GameObject, Sprite, Debug, Color } from 'UnityEngine';
import { Image, Button, Slider, Text } from "UnityEngine.UI";
import OrderManager from './OrderManager';
import { Side } from './DataManager';
import Mediator, { EventNames, IListener } from './Notification/Mediator';
import SoundManager from './SoundManager';

export default class FrySlot extends ZepetoScriptBehaviour implements IListener {
    @SerializeField() private fryButton: Button;    // Putting ingredients in the kitchen
    @SerializeField() private collectButton: Button;
    @SerializeField() private frySlider: Slider;
    @SerializeField() private frySliderFill: Image;
    @SerializeField() private defaultColor: Color;
    @SerializeField() private friedColor: Color;
    @SerializeField() private failedColor: Color;
    @SerializeField() private rawFrySprite: Sprite;
    @SerializeField() private bakedFrySprite: Sprite;
    @SerializeField() private burntFrySprite: Sprite;
    @SerializeField() private fryTime: number;
    @SerializeField() private burnTime: number;
    @SerializeField() private visibleImages: Image[];
    @SerializeField() private lockImage: Image;
    @SerializeField() private clockImage: Image;
    @SerializeField() private burntEffect: GameObject;
    public onWorkStateChanged: (baking: boolean) => void;
    private startTime: number = 0;
    private currentTime: number = 0;
    private isFrying: bool;
    private isFryied: bool;
    private isClock: bool = false;

    Start() {
        this.fryButton.onClick.AddListener(() => { this.StartBaking(); });
        this.onWorkStateChanged = (baking: boolean) => {
            if (baking) {
                // 모든 Slot 객체가 burnt 상태가 아닌 경우
                this.burntEffect.SetActive(false);
            } else {
                // 하나 이상의 Slot 객체가 burnt 상태인 경우
                this.burntEffect.SetActive(true);
            }
        };
        this.Init();
        Mediator.GetInstance().RegisterListener(this);
    }
    private OnDestroy() {
        Mediator.GetInstance().UnregisterListener(this);
    }

    public UnlockSlot(){
        this.lockImage?.gameObject.SetActive(false);
    }

    public UnlockClock(){
        this.clockImage?.gameObject.SetActive(true);
        this.isClock = true;
    }

    private Init(){
        this.StopAllCoroutines();
        this.ClearFry();
    }

    public OnNotify(sender: any, eventName: string, eventData: any): void {
        switch(eventName){
            case EventNames.StageStarted:
            case EventNames.StageEnded:
                this.Init();
                break;
        }
    }

    // Start Baking.
    private StartBaking() {
        // Disable baking Button
        this.fryButton.gameObject.SetActive(false);
        // Change grill button's sprite to raw Patty sprite
        this.collectButton.image.sprite = this.rawFrySprite;
        // Activate grill button
        this.collectButton.gameObject.SetActive(true);
        // Enable timer slider
        this.frySlider.gameObject.SetActive(true);

        this.collectButton.onClick.RemoveAllListeners();
        this.isFrying = true;
        this.isFryied = false;
        this.startTime = Time.time;
        this.frySliderFill.color = this.defaultColor;
        this.StartCoroutine(this.DoBaking());
        SoundManager.GetInstance().OnPlayLoopSFX("Fryer_Frying");
    }

    // Baking Coroutine
    *DoBaking() {
        this.currentTime = Time.time - this.startTime;
        while (this.isFrying) {
            this.currentTime += Time.deltaTime;
            this.frySlider.value = Math.min(1, this.currentTime / this.burnTime);

            if (this.currentTime >= this.fryTime) {
                if (!this.isFryied) {
                    // baking done.
                    this.collectButton.image.sprite = this.bakedFrySprite;
                    this.collectButton.interactable = true;
                    this.collectButton.onClick.RemoveAllListeners();
                    this.collectButton.onClick.AddListener(() => {
                        this.ClearFry();
                        OrderManager.GetInstance().AddItemToInventory(Side.FRY);
                    });
                    this.frySliderFill.color = this.friedColor;
                    this.isFryied = true;
                }
            }
            // if Clock exist, fry doesn't burnt.
            if (this.currentTime >= this.burnTime && !this.isClock) {
                this.collectButton.image.sprite = this.burntFrySprite;
                this.frySliderFill.color = this.failedColor;
                this.StopBaking();
                this.onWorkStateChanged?.(false);
            }
            yield new WaitForSeconds(Time.deltaTime);
        }
    }

    private StopBaking() {
        this.isFrying = false;
        this.collectButton.interactable = true;
        this.collectButton.onClick.RemoveAllListeners();
        this.collectButton.onClick.AddListener(() => { this.ClearFry(); });
    }

    private ClearFry() {
        this.fryButton.gameObject.SetActive(true);
        this.isFrying = false;
        this.isFryied = false;
        this.collectButton.interactable = false;
        this.collectButton.onClick.RemoveAllListeners();
        this.collectButton.gameObject.SetActive(false);
        this.frySlider.gameObject.SetActive(false);
        this.onWorkStateChanged?.(true);
    }

    public IsFrying(): boolean {
        return this.isFrying;
    }

    SetFryVisibility(value: bool) {
        for (let i = 0; i < this.visibleImages.length; i++) {
            this.visibleImages[i].enabled = value;
        }
    }
}