import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { WaitForSeconds, Time, GameObject, Sprite, Debug, Color } from 'UnityEngine';
import { Image, Button, Slider, Text, Toggle } from "UnityEngine.UI";
import OrderManager from './OrderManager';
import { Side } from './OrderManager';
import Mediator, { EventNames } from './Notification/Mediator';

export default class EmployeeSlot extends ZepetoScriptBehaviour {
    @SerializeField() private pauseResumeToggle: Toggle;
    @SerializeField() private employeeImage: Image;    
    @SerializeField() private workSlider: Slider;
    private foodId: number = 8;
    private workTime: number = 10;
    private currentTime: number = 0;
    private isWorking: boolean;

    Start() {
        this.init();
        this.StartWorking();
    }

    init(){
        this.StopAllCoroutines();
        this.workSlider.value = 0;
        this.currentTime = 0;
        this.isWorking = false;
    }

    // Start Baking.
    private StartWorking() {
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
                OrderManager.GetInstance().AddItemToInventory(this.foodId);
                Mediator.GetInstance().Notify(this, EventNames.IngredientCountUpdated, null);
                this.workSlider.value = 0;
                this.currentTime = 0;
            }

            yield new WaitForSeconds(Time.deltaTime);
        }
    }

    private ToggleWorking() {
        this.isWorking = !this.isWorking;
    }
}