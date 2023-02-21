import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { WaitForSeconds, Time, GameObject, Sprite, Debug, Color } from 'UnityEngine';
import { Image, Button, Slider, Text } from "UnityEngine.UI";
import OrderManager from './OrderManager';
import { Ingredient } from './OrderManager';

export default class GrillSlot extends ZepetoScriptBehaviour {
    public bakingButton: Button;    // Putting ingredients in the kitchen
    public bakedButton: Button;
    public bakeSlider: Slider;
    public bakeSliderFill: Image;
    public defaultColor: Color;
    public bakedColor: Color;
    public failedColor: Color;
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
        this.bakedButton.interactable = false;
        this.bakedButton.gameObject.SetActive(false);
        this.bakeSlider.gameObject.SetActive(false);
        this.bakingButton.onClick.AddListener(() => {this.StartBaking();});
    }

    // Start Baking.
    private StartBaking() {
        // Disable baking Button
        this.bakingButton.gameObject.SetActive(false);
        // Change grill button's sprite to baking button's sprite
        this.bakedButton.image.sprite = this.bakingButton.image.sprite;
        // Activate grill button
        this.bakedButton.gameObject.SetActive(true);
        // Enable timer slider
        this.bakeSlider.gameObject.SetActive(true);
    
        this.bakedButton.onClick.RemoveAllListeners();
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
                    this.bakedButton.interactable = true;
                    this.bakedButton.onClick.RemoveAllListeners();
                    this.bakedButton.onClick.AddListener(() => { this.ClearGrill(); });
                    this.bakeSliderFill.color = this.bakedColor;
                    this.isFliped = false;
                } 
                else if (this.flipCount == 0 && !this.isFliped) {
                    this.bakedButton.interactable = true;
                    this.bakedButton.onClick.RemoveAllListeners();
                    this.bakedButton.onClick.AddListener(() => { 
                        this.FlipPatty(); 
                        OrderManager.GetInstance().addProduct(Ingredient.PATTY);
                    });
                    this.bakeSliderFill.color = this.bakedColor;
                    this.flipCount++;
                }
            }
            if (this.currentTime >= this.burnTime) {
                this.bakedButton.image.sprite = this.burntPattySprite;
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
        this.bakedButton.interactable = false;
        this.bakedButton.image.sprite = this.bakedPattySprite;
    }

    private StopBaking() {
        this.isBaking = false;
        this.bakedButton.interactable = true;
        this.bakedButton.onClick.AddListener(() => { this.ClearGrill(); });
    }

    private ClearGrill() {
        this.bakingButton.gameObject.SetActive(true);
        this.isBaking = false;
        this.isFliped = false;
        this.bakedButton.interactable = false;
        this.bakedButton.onClick.RemoveAllListeners();
        this.bakedButton.gameObject.SetActive(false);
        this.bakeSlider.gameObject.SetActive(false);
    }

    SetGrillVisibility(value: bool) {
        for (let i = 0; i < this.visibleImages.length; i++) {
            this.visibleImages[i].enabled = value;
        }
    }
}