import { GameObject } from 'UnityEngine';
import { Image } from 'UnityEngine.UI';
import FrySlot from './FrySlot';
import InteractionBase from './InteractionBase';
import Mediator, { EventNames, IListener } from './Notification/Mediator';
import ItemManager from './ItemManager';
import DataManager from './DataManager';

export default class Interaction_Fry extends InteractionBase implements IListener {
    @SerializeField() private frySlotObjects: GameObject[];
    @SerializeField() private images: Image[];
    @SerializeField() private fryPanel: GameObject;
    @SerializeField() private defaultTable: GameObject;

    Start() {
        super.Start();
        this.fryPanel.SetActive(true);
        this.kitchen.SetActive(true);

        const upgradedlevel = ItemManager.GetInstance().GetUpgradedLevel("frier");
        this.FryUnlock(upgradedlevel);

        Mediator.GetInstance().RegisterListener(this);
    }
    private OnDestroy() {
        Mediator.GetInstance().UnregisterListener(this);
    }
    private Init(){
        //Button Hide
        this.SetKitchenVisibility(false);
        this.openButton.gameObject.SetActive(false);

        const isUnlock = DataManager.GetInstance().GetIsUnlockByName(this.sectionName);
        // if name is empty, don't use this logic.
        if (this.sectionName != "") {
            this.defaultTable.SetActive(!isUnlock);
            this.sectionObject.SetActive(isUnlock);
            this.sectionCollider.enabled = isUnlock;
        }
    }

    public OnNotify(sender: any, eventName: string, eventData: any): void {
        switch(eventName){
            case EventNames.StageStarted:
            case EventNames.StageEnded:
                this.Init();
                break;
            case EventNames.UpgradeUpdated:
                const upgradedlevel = ItemManager.GetInstance().GetUpgradedLevel("frier");
                this.FryUnlock(upgradedlevel);
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
        for (let i = 0; i < this.frySlotObjects.length; i++) {
            this.frySlotObjects[i].GetComponent<FrySlot>().SetFryVisibility(value);
        }
    }

    public FryUnlock(level:number){
        let slots: FrySlot[] = [];
        for (let i = 0; i < this.frySlotObjects.length; i++) {
            slots.push(this.frySlotObjects[i].GetComponent<FrySlot>());
        }

        if(level >= 0){
            slots[0].UnlockSlot();
        }
        if(level >= 1){
            slots[1].UnlockSlot();
        }
        if(level >= 2){
            slots[0].UnlockClock();
        }
        if(level >= 3){
            slots[1].UnlockClock();
        }
    }
}