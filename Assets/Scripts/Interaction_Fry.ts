import { GameObject } from 'UnityEngine';
import { Image, Button } from 'UnityEngine.UI';
import FrySlot from './FrySlot';
import InteractionBase from './InteractionBase';
import Mediator, { EventNames, IListener } from './Notification/Mediator';
import ItemManager from './ItemManager';
import DataManager, { Section } from './DataManager';
import SoundManager from './SoundManager';
import HelpManager from './Help/HelpManager';
import GameManager from './GameManager';

export default class Interaction_Fry extends InteractionBase implements IListener {
    @SerializeField() private helpButton: Button; // Button to help
    @SerializeField() private frySlotObjects: GameObject[];
    @SerializeField() private images: Image[];
    @SerializeField() private fryPanel: GameObject;
    @SerializeField() private defaultTable: GameObject;
    @SerializeField() private unlockDouble: GameObject;
    private isDouble: boolean;

    Start() {
        super.Start();

        this.helpButton.onClick.AddListener(() => {
            HelpManager.GetInstance().OpenHelpSection("fryer");
        });

        this.fryPanel.SetActive(true);
        this.kitchen.SetActive(true);
        this.isDouble = false;
        this.unlockDouble.SetActive(false);
        const upgradedlevel = ItemManager.GetInstance().GetUpgradedLevel("fryer");
        this.FryUnlock(upgradedlevel);

        for (let i = 0; i < this.frySlotObjects.length; i++) {
            let slot = this.frySlotObjects[i].GetComponent<FrySlot>();
            slot.onBakeLevelChanged = (level: number) => {
                this.PlayBakeLevelSFX();
                if (level == 3)
                    SoundManager.GetInstance().OnPlayLoopSFX("Fryer_level3");
            }
        }

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
                this.frySlotObjects.forEach((slotObj) => {
                    let slot = slotObj.GetComponent<FrySlot>();
                    slot.Init();
                });
                SoundManager.GetInstance().StopSFX();
                break;
            case EventNames.UpgradeUpdated:
                const upgradedlevel = ItemManager.GetInstance().GetUpgradedLevel("fryer");
                this.FryUnlock(upgradedlevel);
                break;
        }
    }

    OnTriggerEnter(collider) {
        super.OnTriggerEnter(collider);
        this.PlayBakeLevelSFX();
    }

    private PlayBakeLevelSFX(){
        if(!GameManager.GetInstance().isInGame) return;
        let maxBakeLevel = 0;
        this.frySlotObjects.forEach((slotObj) => {
            let slot = slotObj.GetComponent<FrySlot>();
            const bakeLevel = slot.GetBakeLevel();
            maxBakeLevel = (bakeLevel > maxBakeLevel) ? bakeLevel : maxBakeLevel;
        });
        switch(maxBakeLevel){
            case 0: // nothing
                break;
            case 1: // baking
                SoundManager.GetInstance().OnPlayLoopSFX("Fryer_level1");
                break;
            case 2: // done
                SoundManager.GetInstance().OnPlayLoopSFX("Fryer_level2");
                break;
            case 3: // burnt
                SoundManager.GetInstance().OnPlayLoopSFX("Fryer_level3");
                break;
        }
    }

    OnTriggerExit(collider) {
        super.OnTriggerExit(collider);
        SoundManager.GetInstance().StopSFX();
    }

    SetKitchenVisibility(value: boolean) {
        super.SetKitchenVisibility(value);
        let sfx = false;
        for (let i = 0; i < this.images.length; i++) {
            this.images[i].enabled = value;
        }
        for (let i = 0; i < this.frySlotObjects.length; i++) {
            let slot = this.frySlotObjects[i].GetComponent<FrySlot>();
            slot.SetFryVisibility(value);
        }
        if (this.isDouble) this.unlockDouble.SetActive(value);
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
            slots[1].UnlockClock();
        }
        if(level >= 3){
            slots[0].Double();
            slots[1].Double();
            //this.unlockDouble.SetActive(true);
            this.isDouble = true;
        }
    }
}