import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { WaitForSeconds, Time, GameObject, Sprite, Color, AudioSource } from 'UnityEngine';
import { Image, Button, Slider, Text } from "UnityEngine.UI";
import OrderManager from './OrderManager';
import { Ingredient } from './DataManager';
import Mediator, { EventNames, IListener } from './Notification/Mediator';
import SoundManager from './SoundManager';

export default class GrillSlot extends ZepetoScriptBehaviour implements IListener {
    @SerializeField() private grillButton: Button;    // Putting ingredients in the kitchen
    @SerializeField() private bakingButton: Button;
    @SerializeField() private bakeSlider: Slider;
    @SerializeField() private bakeSliderFill: Image;
    @SerializeField() private defaultColor: Color;
    @SerializeField() private bakedColor: Color;
    @SerializeField() private failedColor: Color;
    @SerializeField() private rawPattySprite: Sprite;
    @SerializeField() private bakedPattySprite: Sprite;
    @SerializeField() private burntPattySprite: Sprite;
    @SerializeField() private bakeTime: number;
    @SerializeField() private burnTime: number;
    @SerializeField() private visibleImages: Image[];
    @SerializeField() private lockImage: Image;
    @SerializeField() private bakeTimerSFX: AudioSource;
    public onWorkStateChanged: (working: boolean) => void;
    public onBakeLevelChanged: (level: number) => void;
    private startTime: number = 0;
    private currentTime: number = 0;
    private flipCount: number = 0;
    private bakeLevel: number = 0;
    private amount: number = 1;
    private isFliped: bool;
    private isBaking: bool;
    private isWorking: bool;

    Start() {

        this.isWorking = true;
        this.bakingButton.interactable = false;
        this.grillButton.onClick.AddListener(() => { this.StartBaking(); });
        Mediator.GetInstance().RegisterListener(this);
    }
    private OnDestroy() {
        Mediator.GetInstance().UnregisterListener(this);
    }
 
    public Unlock(){
        this.lockImage.gameObject.SetActive(false);
    }
    public Double(){
        this.amount = 2;
    }
    public Init(){
        this.StopAllCoroutines();
        this.ClearGrill();
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
        this.grillButton.gameObject.SetActive(false);
        // Change grill button's sprite to raw Patty sprite
        this.bakingButton.image.sprite = this.rawPattySprite;
        // Activate grill button
        this.bakingButton.gameObject.SetActive(true);
        // Enable timer slider
        this.bakeSlider.gameObject.SetActive(true);

        this.bakingButton.onClick.RemoveAllListeners();
        this.isBaking = true;
        this.isFliped = false;
        this.flipCount = 0;
        this.startTime = Time.time;
        this.bakeSliderFill.color = this.defaultColor;
        this.bakeLevel = 1;
        this.onBakeLevelChanged?.(this.bakeLevel);
        this.StartCoroutine(this.DoBaking());
    }

    // Baking Coroutine
    *DoBaking() {
        this.currentTime = Time.time - this.startTime;
        while (this.isBaking) {
            this.currentTime += Time.deltaTime;
            this.bakeSlider.value = Math.min(1, this.currentTime / this.burnTime);

            if (this.currentTime >= this.bakeTime) {
                if (this.flipCount > 0 && this.isFliped) {
                    // baking done.
                    this.bakeLevel = 2;
                    this.onBakeLevelChanged?.(this.bakeLevel);
                    this.bakingButton.interactable = true;
                    this.bakingButton.onClick.RemoveAllListeners();
                    this.bakingButton.onClick.AddListener(() => {
                        this.ClearGrill();
                        OrderManager.GetInstance().AddItemToInventory(Ingredient.PATTY,this.amount);
                        SoundManager.GetInstance().OnPlayButtonSFX(SoundManager.GetInstance().keyBtnSelect);
                    });
                    this.bakeSliderFill.color = this.bakedColor;
                    this.isFliped = false;
                    this.OnPlayBakeTimerSFX();
                }
                else if (this.flipCount == 0 && !this.isFliped) {
                    this.bakingButton.interactable = true;
                    this.bakingButton.onClick.RemoveAllListeners();
                    this.bakingButton.onClick.AddListener(() => { this.FlipPatty(); });
                    this.bakeSliderFill.color = this.bakedColor;
                    this.flipCount++;
                    this.OnPlayBakeTimerSFX();
                }
            }
            if (this.currentTime >= this.burnTime) {
                this.bakeLevel = 3;
                this.onBakeLevelChanged?.(this.bakeLevel);
                this.bakingButton.image.sprite = this.burntPattySprite;
                this.bakeSliderFill.color = this.failedColor;
                this.StopBaking();
                this.isWorking = false;
                this.onWorkStateChanged?.(false);
            }
            yield new WaitForSeconds(Time.deltaTime);
        }
    }

    private FlipPatty() {
        this.isFliped = true;
        this.bakeSliderFill.color = this.defaultColor;
        this.currentTime = 0;
        this.bakingButton.interactable = false;
        this.bakingButton.image.sprite = this.bakedPattySprite;
        this.StopBakeTimerSFX();
    }

    private StopBaking() {
        this.isBaking = false;
        this.bakingButton.interactable = true;
        this.bakingButton.onClick.RemoveAllListeners();
        this.bakingButton.onClick.AddListener(() => { this.ClearGrill(); });
        this.StopBakeTimerSFX();
    }

    private ClearGrill() {
        this.grillButton.gameObject.SetActive(true);
        this.isBaking = false;
        this.isFliped = false;
        this.bakingButton.interactable = false;
        this.bakingButton.onClick.RemoveAllListeners();
        this.bakingButton.gameObject.SetActive(false);
        this.bakeSlider.gameObject.SetActive(false);
        this.isWorking = true;
        this.bakeLevel = 0;
        this.onBakeLevelChanged?.(this.bakeLevel);
        this.onWorkStateChanged?.(true);
        this.StopBakeTimerSFX();
    }

    public GetBakeLevel(): number {
        return this.bakeLevel;
    }

    public IsBaking(): boolean {
        return this.isBaking;
    }

    public IsWorking(): boolean {
        return this.isWorking;
    }

    SetGrillVisibility(value: bool) {
        for (let i = 0; i < this.visibleImages.length; i++) {
            this.visibleImages[i].enabled = value;
        }
    }
    
    private OnPlayBakeTimerSFX(){
        this.bakeTimerSFX.volume = SoundManager.GetInstance().SFXSoundVolume;
        this.bakeTimerSFX.mute = SoundManager.GetInstance().SFXSoundMute;
        this.bakeTimerSFX.Play();
    }

    private StopBakeTimerSFX(){
        this.bakeTimerSFX.Stop();
    }
}