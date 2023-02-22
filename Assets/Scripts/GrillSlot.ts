import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { WaitForSeconds, Time, GameObject, Sprite, Debug, Color } from 'UnityEngine';
import { Image, Button, Slider, Text } from "UnityEngine.UI";
import OrderManager from './OrderManager';
import { Ingredient } from './OrderManager';

export default class GrillSlot extends ZepetoScriptBehaviour {
    public grillButton: Button;    // Putting ingredients in the kitchen
    public bakingButton: Button;
    public bakeSlider: Slider;
    public bakeSliderFill: Image;
    public defaultColor: Color;
    public bakedColor: Color;
    public failedColor: Color;
    public rawPattySprite: Sprite;
    public bakedPattySprite: Sprite;
    public burntPattySprite: Sprite;
    public bakeTime: number;
    public burnTime: number;
    private startTime: number = 0;
    private currentTime: number = 0;
    private flipCount: number = 0;
    private isFliped: bool;
    private isBaking: bool;
    public visibleImages: Image[];

    Start() {
        this.init();
    }

    init(){
        this.StopAllCoroutines();
        this.bakingButton.interactable = false;
        this.bakingButton.gameObject.SetActive(false);
        this.bakeSlider.gameObject.SetActive(false);
        this.grillButton.onClick.AddListener(() => { this.StartBaking(); });
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
        this.StartCoroutine(this.DoBaking());
    }

    // Baking Coroutine
    *DoBaking() {
        this.currentTime = Time.time - this.startTime;
        while (this.isBaking) {
            this.currentTime += Time.deltaTime;
            this.bakeSlider.value = this.currentTime / this.burnTime;

            if (this.currentTime >= this.bakeTime) {
                if (this.flipCount > 0 && this.isFliped) {
                    // baking done.
                    this.bakingButton.interactable = true;
                    this.bakingButton.onClick.RemoveAllListeners();
                    this.bakingButton.onClick.AddListener(() => {
                        this.ClearGrill();
                        OrderManager.GetInstance().addProduct(Ingredient.PATTY);
                    });
                    this.bakeSliderFill.color = this.bakedColor;
                    this.isFliped = false;
                }
                else if (this.flipCount == 0 && !this.isFliped) {
                    this.bakingButton.interactable = true;
                    this.bakingButton.onClick.RemoveAllListeners();
                    this.bakingButton.onClick.AddListener(() => { this.FlipPatty(); });
                    this.bakeSliderFill.color = this.bakedColor;
                    this.flipCount++;
                }
            }
            if (this.currentTime >= this.burnTime) {
                this.bakingButton.image.sprite = this.burntPattySprite;
                this.bakeSliderFill.color = this.failedColor;
                this.StopBaking();
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
    }

    private StopBaking() {
        this.isBaking = false;
        this.bakingButton.interactable = true;
        this.bakingButton.onClick.AddListener(() => { this.ClearGrill(); });
    }

    private ClearGrill() {
        this.grillButton.gameObject.SetActive(true);
        this.isBaking = false;
        this.isFliped = false;
        this.bakingButton.interactable = false;
        this.bakingButton.onClick.RemoveAllListeners();
        this.bakingButton.gameObject.SetActive(false);
        this.bakeSlider.gameObject.SetActive(false);
    }

    SetGrillVisibility(value: bool) {
        for (let i = 0; i < this.visibleImages.length; i++) {
            this.visibleImages[i].enabled = value;
        }
    }
}