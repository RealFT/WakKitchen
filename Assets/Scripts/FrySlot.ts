import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { WaitForSeconds, Time, GameObject, Sprite, Debug, Color } from 'UnityEngine';
import { Image, Button, Slider, Text } from "UnityEngine.UI";
import OrderManager from './OrderManager';
import { Side } from './OrderManager';

export default class FrySlot extends ZepetoScriptBehaviour {
    public fryButton: Button;    // Putting ingredients in the kitchen
    public collectButton: Button;
    public frySlider: Slider;
    public frySliderFill: Image;
    public defaultColor: Color;
    public friedColor: Color;
    public failedColor: Color;
    public rawFrySprite: Sprite;
    public bakedFrySprite: Sprite;
    public burntFrySprite: Sprite;
    public fryTime: number;
    public burnTime: number;
    private startTime: number = 0;
    private currentTime: number = 0;
    private isFrying: bool;
    private isFryied: bool;
    public visibleImages: Image[];

    Start() {
        this.init();
    }

    init(){
        this.StopAllCoroutines();
        this.collectButton.interactable = false;
        this.collectButton.gameObject.SetActive(false);
        this.frySlider.gameObject.SetActive(false);
        this.fryButton.onClick.AddListener(() => { this.StartBaking(); });
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
    }

    // Baking Coroutine
    *DoBaking() {
        this.currentTime = Time.time - this.startTime;
        while (this.isFrying) {
            this.currentTime += Time.deltaTime;
            this.frySlider.value = this.currentTime / this.burnTime;

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
            if (this.currentTime >= this.burnTime) {
                this.collectButton.image.sprite = this.burntFrySprite;
                this.frySliderFill.color = this.failedColor;
                this.StopBaking();
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
    }

    SetFryVisibility(value: bool) {
        for (let i = 0; i < this.visibleImages.length; i++) {
            this.visibleImages[i].enabled = value;
        }
    }
}