import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { WaitForSeconds, Time, GameObject, Sprite, Debug, Color } from 'UnityEngine';
import { Image, Button, Slider } from "UnityEngine.UI";

export default class BakeController extends ZepetoScriptBehaviour {
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
    private currentTime: number = 0;
    private isFliped: bool;
    private isBaking: bool;

    Start() {
        Debug.Log(this.bakedButton.image.sprite);
        Debug.Log(this.bakingButton.image.sprite);
        Debug.Log(this.bakedPattySprite);
        Debug.Log(this.burntPattySprite);
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
        this.StartCoroutine(this.DoBaking());
    }

    // Baking Coroutine
    *DoBaking() {
        this.currentTime = 0;
        this.isFliped = false;
        let flipCount = 0;
        this.bakeSliderFill.color = this.defaultColor;
        while (this.isBaking) {
            this.currentTime += Time.deltaTime;
            this.bakeSlider.value = this.currentTime / this.burnTime;

            if (this.currentTime >= this.bakeTime) {
                if (flipCount > 0 && this.isFliped) {
                    // baking done.
                    this.bakedButton.interactable = true;
                    this.bakedButton.onClick.RemoveAllListeners();
                    this.bakedButton.onClick.AddListener(() => { this.ClearGrill(); });
                    this.bakeSliderFill.color = this.bakedColor;
                } 
                else if (flipCount == 0 && !this.isFliped) {
                    this.bakedButton.interactable = true;
                    this.bakedButton.onClick.RemoveAllListeners();
                    this.bakedButton.onClick.AddListener(() => { this.FlipPatty(); });
                    this.bakeSliderFill.color = this.bakedColor;
                    flipCount++;
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
}