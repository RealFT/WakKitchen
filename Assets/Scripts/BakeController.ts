import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { WaitForSeconds, Time, GameObject, Sprite, Debug } from 'UnityEngine';
import { Image, Button, Slider } from "UnityEngine.UI";

export default class BakeController extends ZepetoScriptBehaviour {
    public prepping: Button;    // Putting ingredients in the kitchen
    public bakeSlider: Slider;
    //public pattyImage: Image;
    public bakedButton: Button;
    public bakedPattySprite: Sprite;
    public burntPattySprite: Sprite;
    public bakeTime: number;
    public burnTime: number; 
    //private currentTime: number = 0;
    private isBaked: bool;
    private isFliped: bool;

    Start() {
        Debug.Log(this.bakedButton.image.sprite);
        Debug.Log(this.prepping.image.sprite);
        Debug.Log(this.bakedPattySprite);
        Debug.Log(this.burntPattySprite);
        this.bakedButton.interactable = false;
        this.bakedButton.gameObject.SetActive(false);
        this.bakeSlider.gameObject.SetActive(false);
        this.prepping.onClick.AddListener(this.StartBaking);
    }

    // 조리 시작
    private StartBaking() {
        // 불판 위에 위치한 버튼 이미지를 해당 음식 이미지로 변경
        this.bakedButton.image.sprite = this.prepping.image.sprite;
        // 불판 위 버튼 활성화
        this.bakedButton.gameObject.SetActive(true);
        // 불판 위 타이머 슬라이더 활성화
        this.bakeSlider.gameObject.SetActive(true);
    
        this.bakedButton.onClick.RemoveAllListeners();
        //this.bakedButton.onClick.AddListener(this.FlipPatty);
        this.isBaked = false;
        this.isFliped = false;
        this.StartCoroutine(this.DoBaking());
    }

    // 베이킹 코루틴
    *DoBaking() {
        let currentTime = 0;
        while (!this.isFliped && !this.isBaked) {
            currentTime += Time.deltaTime;
            this.bakeSlider.value = currentTime / this.bakeTime;

            if (currentTime >= this.bakeTime && !this.isBaked) {
                this.bakedButton.image.sprite = this.bakedPattySprite;
                this.isBaked = true;
                this.bakedButton.interactable = true;
                this.bakedButton.onClick.AddListener(this.FlipPatty);
            }
            else if (currentTime >= this.burnTime) {
                this.bakedButton.image.sprite = this.burntPattySprite;
                this.StopBaking();
                break;
            }
            yield new WaitForSeconds(Time.deltaTime);
        }
    }

    private FlipPatty() {
        this.isBaked = false;
        this.isFliped = true;
        this.bakedButton.interactable = false;
        this.bakedButton.image.sprite = this.prepping.image.sprite;
    }

    private StopBaking() {
        this.isBaked = false;
        this.bakedButton.interactable = true;
        this.bakedButton.onClick.AddListener(this.RemoveBurnt);
    }

    private RemoveBurnt() {
        this.isBaked = false;
        this.bakedButton.interactable = false;
        this.bakedButton.onClick.RemoveAllListeners();
        this.bakedButton.gameObject.SetActive(false);
        this.bakeSlider.gameObject.SetActive(false);
    }
}