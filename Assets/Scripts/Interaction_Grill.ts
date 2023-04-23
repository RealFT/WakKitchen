import { GameObject } from 'UnityEngine';
import { Image } from 'UnityEngine.UI';
import GrillSlot from './GrillSlot';
import InteractionBase from './InteractionBase';
import Mediator, { EventNames, IListener } from './Notification/Mediator';
import ItemManager from './ItemManager';

export default class Interaction_Grill extends InteractionBase implements IListener {
    @SerializeField() private grillSlotObjects: GameObject[];
    @SerializeField() private images: Image[];
    @SerializeField() private grillPanel: GameObject;

    Start() {
        super.Start();

        // Set panels and kitchen active
        this.grillPanel.SetActive(true);
        this.kitchen.SetActive(true);

        // Unlock by Upgraded level
        const upgradedlevel = ItemManager.GetInstance().GetUpgradedLevel("grill");
        this.GrillUnlock(upgradedlevel);

        Mediator.GetInstance().RegisterListener(this);
    }
    private OnDestroy() {
        Mediator.GetInstance().UnregisterListener(this);
    }

    private Init(){
        //Button Hide
        this.SetKitchenVisibility(false);
        this.openButton.gameObject.SetActive(false);
    }

    public OnNotify(sender: any, eventName: string, eventData: any): void {
        switch(eventName){
            case EventNames.StageStarted:
            case EventNames.StageEnded:
                this.Init();
                break;
            case EventNames.UpgradeUpdated:
                const upgradedlevel = ItemManager.GetInstance().GetUpgradedLevel("grill");
                this.GrillUnlock(upgradedlevel);
                break;
        }
    }

    OnTriggerEnter(collider) {
        super.OnTriggerEnter(collider);
    }

    OnTriggerExit(collider) {
        super.OnTriggerExit(collider);
    }

    SetKitchenVisibility(value: boolean) {
        super.SetKitchenVisibility(value);
        for (let i = 0; i < this.images.length; i++) {
            this.images[i].enabled = value;
        }
        for (let i = 0; i < this.grillSlotObjects.length; i++) {
            this.grillSlotObjects[i].GetComponent<GrillSlot>()?.SetGrillVisibility(value);
        }
    }

    public GrillUnlock(level:number){
        for (let i = 0; i <= level; i++) {
            console.log("grill unlock");
            this.grillSlotObjects[i].GetComponent<GrillSlot>()?.Unlock();
        }
        if(level === 3){
            // clock 기능 추가
        }
    }
}