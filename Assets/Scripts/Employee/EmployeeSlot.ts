import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { WaitForSeconds, Time, GameObject, Sprite, Debug, Color } from 'UnityEngine';
import { Image, Button, Slider, Text, Toggle } from "UnityEngine.UI";
import OrderManager from '../OrderManager';
import DataManager, { Drink, Ingredient, Section, Side, Slice } from '../DataManager';
import CardData from './CardData';
import Mediator, { EventNames } from '../Notification/Mediator';

export default class EmployeeSlot extends ZepetoScriptBehaviour {
    @SerializeField() private pauseResumeToggle: Toggle;
    @SerializeField() private employeeImage: Image;    
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
        let startId = 0;
        let endId = 0;
        let proficiency = 1;
        switch(section){
            case Section.Dispenser:
                startId = Drink.START;
                endId = Drink.END;
                proficiency = employeeData.GetDispenserProficiency();
                break;
            case Section.Frier:
                startId = Side.START;
                endId = Side.END;
                proficiency = employeeData.GetFrierProficiency();
                break;
            case Section.Grill:
                startId = Ingredient.PATTY;
                endId = Ingredient.PATTY;
                proficiency = employeeData.GetGrillProficiency();
                break;
            case Section.Slice:
                startId = Slice.START;
                endId = Slice.END;
                proficiency = employeeData.GetSliceProficiency();
                break;
        }
        for (let id = startId; id <= endId; id++) {
            this.foodIds.push(id);
        }
        if(proficiency <= 0) proficiency = 1;
        this.workTime = 10 / (Math.floor(proficiency * 0.1) + 1);
        this.isRegistered = true;
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
                OrderManager.GetInstance().AddItemToInventory(this.GetRandomFoodId());
                Mediator.GetInstance().Notify(this, EventNames.IngredientCountUpdated, null);
                this.workSlider.value = 0;
                this.currentTime = 0;
            }

            yield new WaitForSeconds(Time.deltaTime);
        }
    }
}