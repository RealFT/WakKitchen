import { GameObject } from 'UnityEngine';
import { Image } from 'UnityEngine.UI';
import GrillSlot from './GrillSlot';
import InteractionBase from './InteractionBase';
import Mediator, { EventNames, IListener } from './Notification/Mediator';
import ItemManager from './ItemManager';
import DataManager from './DataManager';
import SoundManager from './SoundManager';

export default class Interaction_Grill extends InteractionBase implements IListener {
    @SerializeField() private grillSlotObjects: GameObject[];
    @SerializeField() private images: Image[];
    @SerializeField() private grillPanel: GameObject;
    @SerializeField() private defaultTable: GameObject;

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
        let sfx = false;
        for (let i = 0; i < this.images.length; i++) {
            this.images[i].enabled = value;
        }
        for (let i = 0; i < this.grillSlotObjects.length; i++) {
            let slot = this.grillSlotObjects[i].GetComponent<GrillSlot>();
            slot.SetGrillVisibility(value);
            if(slot.IsBaking()) sfx = true;
        }
        // is kitchen visivility is true;
        if (value && sfx) {
            SoundManager.GetInstance().OnPlayLoopSFX("Grill_Sizzling");
        }
        // is kitchen visivility is false;
        else {
            SoundManager.GetInstance().StopSFX();
        }
    }

    public GrillUnlock(level:number){
        for (let i = 0; i <= level; i++) {
            this.grillSlotObjects[i].GetComponent<GrillSlot>()?.Unlock();
        }
        if(level === 3){
            // clock 기능 추가
        }
    }
}