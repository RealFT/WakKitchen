import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { WaitForSeconds, Time, GameObject, Sprite, Debug, Color } from 'UnityEngine';
import { Image, Button, Slider, Text, Toggle } from "UnityEngine.UI";
import OrderManager from './OrderManager';
import { Side } from './OrderManager';
import Mediator, { EventNames, IListener } from './Notification/Mediator';

export default class EmployeeSlot extends ZepetoScriptBehaviour implements IListener {
    @SerializeField() private pauseResumeToggle: Toggle;
    @SerializeField() private employeeImage: Image;    
    @SerializeField() private workSlider: Slider;
    private foodId: number = 8;
    private workTime: number = 10;
    private currentTime: number = 0;
    private isWorking: boolean;

    Start(){
        Mediator.GetInstance().RegisterListener(this);
    }
    private OnDestroy() {
        Mediator.GetInstance().UnregisterListener(this);
    }

    init(){
        this.StopAllCoroutines();
        this.workSlider.value = 0;
        this.currentTime = 0;
        this.isWorking = false;
    }

    public OnNotify(sender: any, eventName: string, eventData: any): void {
        switch(eventName){
            case EventNames.StageStarted:
                console.log("StageStarted: employee");
                this.init();
                this.StartWorking();
                break;
            case EventNames.StageEnded:
                this.init();
                break;
        }
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
}