import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { WaitForSeconds, Time, GameObject, Sprite, Debug, Color, Animation } from 'UnityEngine';
import { Image, Button, Slider, Text, Toggle } from "UnityEngine.UI";
import OrderManager from '../OrderManager';
import DataManager, { Drink, Ingredient, Section, Side } from '../DataManager';
import CardData from './CardData';
import Mediator, { EventNames } from '../Notification/Mediator';
import SoundManager from '../SoundManager';

export default class EmployeeSlot extends ZepetoScriptBehaviour {
    @SerializeField() private pauseResumeToggle: Toggle;
    @SerializeField() private employeeImage: Image;    
    @SerializeField() private foodImage: Image;    
    @SerializeField() private foodAnim: Animation;    
    @SerializeField() private workSlider: Slider;
    private foodIds: number[] = [];
    private workTime: number = 10;
    private currentTime: number = 0;
    private isWorking: boolean;
    private isRegistered: boolean;

    Init(){
        this.StopAllCoroutines();
        this.workSlider.value = 0;
        this.currentTime = 0;
        this.isWorking = false;
        this.isRegistered = false;
        let proficiency = 1;
        let time = 10;
    }

    private GetRandomFoodId(): number{
        const randomIndex = Math.floor(Math.random() * this.foodIds.length);
        return this.foodIds[randomIndex];
    }
    public IsRegistered():boolean{
        return this.isRegistered;
    }
    public SetEmployee(employeeData: CardData, section: number){
        this.employeeImage.sprite = DataManager.GetInstance().GetCharacterIcon(employeeData.GetCharacterIndex());
        this.foodIds = [];
        let proficiency = 1;
        let time = 8;
        switch(section){
            case Section.Dispenser:
                let startId = Drink.START;
                let endId = Drink.END;
                for (let id = startId; id <= endId; id++) {
                    this.foodIds.push(id);
                }
                proficiency = employeeData.GetDispenserProficiency();
                time = 6;
                break;
            case Section.Fryer:
                this.foodIds.push(Side.FRY);
                proficiency = employeeData.GetFrierProficiency();
                time = 8;
                break;
            case Section.Grill:
                this.foodIds.push(Ingredient.PATTY);
                proficiency = employeeData.GetGrillProficiency();
                time = 12;
                break;
            case Section.Prep:
                this.foodIds.push(Ingredient.CABBAGE);
                this.foodIds.push(Ingredient.TOMATO);
                this.foodIds.push(Ingredient.ONION);
                proficiency = employeeData.GetSliceProficiency();
                time = 4;
                break;
        }

        if(proficiency <= 0) proficiency = 1;
        this.workTime = this.calculate(time, proficiency);
        this.isRegistered = true;
    }

    private calculate(time: number, x: number): number {
        const result = (time * 1.8) / (1 + 0.6 * Math.exp(0.032 * x));
        return result;
      }
    // Start Baking.
    public StartWorking() {
        this.isWorking = true;
        this.StartCoroutine(this.DoWorking());
    }

    // Working Coroutine
    *DoWorking() {
        while (this.isWorking) {
            if (this.pauseResumeToggle.isOn) {
                // Pause the work
                yield new WaitForSeconds(Time.deltaTime);
                continue;
            }

            this.currentTime += Time.deltaTime;
            this.workSlider.value = this.currentTime / this.workTime;

            if (this.currentTime >= this.workTime) {
                // Work done.
                const foodId = this.GetRandomFoodId();
                OrderManager.GetInstance().AddItemToInventory(foodId);
                SoundManager.GetInstance().OnPlayButtonSFX(SoundManager.GetInstance().keyBtnSelect);
                this.foodImage.gameObject.SetActive(true);
                this.foodImage.sprite = DataManager.GetInstance().getProductSprite(foodId);
                this.foodAnim.Play();
                Mediator.GetInstance().Notify(this, EventNames.IngredientCountUpdated, null);
                this.workSlider.value = 0;
                this.currentTime = 0;
            }

            yield new WaitForSeconds(Time.deltaTime);
        }
    }
}