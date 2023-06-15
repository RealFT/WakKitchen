import { GameObject } from 'UnityEngine';
import { Image, Button } from 'UnityEngine.UI';
import GrillSlot from './GrillSlot';
import InteractionBase from './InteractionBase';
import Mediator, { EventNames, IListener } from './Notification/Mediator';
import ItemManager from './ItemManager';
import DataManager, { Section } from './DataManager';
import SoundManager from './SoundManager';
import HelpManager from './Help/HelpManager';
import GameManager from './GameManager';

export default class Interaction_Grill extends InteractionBase implements IListener {
    @SerializeField() private helpButton: Button; // Button to help
    @SerializeField() private grillSlotObjects: GameObject[];
    @SerializeField() private images: Image[];
    @SerializeField() private grillPanel: GameObject;
    @SerializeField() private defaultTable: GameObject;
    @SerializeField() private burntEffect: GameObject;
    @SerializeField() private unlockDouble: GameObject;
    private workingStates: boolean[] = [];
    private isDouble: boolean;

    Start() {
        super.Start();

        this.helpButton.onClick.AddListener(() => {
            HelpManager.GetInstance().OpenHelpSection("grill");
        });

        // Set panels and kitchen active
        this.grillPanel.SetActive(true);
        this.kitchen.SetActive(true);
        this.burntEffect.SetActive(false);
        
        this.unlockDouble.SetActive(false);
        this.isDouble = false;
        // Unlock by Upgraded level
        const upgradedlevel = ItemManager.GetInstance().GetUpgradedLevel("grill");
        this.GrillUnlock(upgradedlevel);

        for (let i = 0; i < this.grillSlotObjects.length; i++) {
            let slot = this.grillSlotObjects[i].GetComponent<GrillSlot>();
            slot.onWorkStateChanged = (working: boolean) => {
                for (let i = 0; i < this.grillSlotObjects.length; i++) {
                    let slot = this.grillSlotObjects[i].GetComponent<GrillSlot>();
                    this.workingStates[i] = slot.IsWorking();
                }
                const allBaking = this.workingStates.every(state => state);
                if (allBaking) {
                    // 모든 Slot 객체가 burnt 상태가 아닌 경우
                    this.burntEffect.SetActive(false);
                } else {
                    // 하나 이상의 Slot 객체가 burnt 상태인 경우
                    this.burntEffect.SetActive(true);
                    SoundManager.GetInstance().OnPlayLoopSFX("Grill_level3");
                }
            };
            slot.onBakeLevelChanged = (level: number) => {
                this.PlayBakeLevelSFX();
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
                this.grillSlotObjects.forEach((slotObj) => {
                    let slot = slotObj.GetComponent<GrillSlot>();
                    slot.Init();
                });
                SoundManager.GetInstance().StopSFX();
                break;
            case EventNames.UpgradeUpdated:
                const upgradedlevel = ItemManager.GetInstance().GetUpgradedLevel("grill");
                this.GrillUnlock(upgradedlevel);
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
        this.grillSlotObjects.forEach((slotObj) => {
            let slot = slotObj.GetComponent<GrillSlot>();
            const bakeLevel = slot.GetBakeLevel();
            maxBakeLevel = (bakeLevel > maxBakeLevel) ? bakeLevel : maxBakeLevel;
        });
        switch(maxBakeLevel){
            case 0: // nothing
                break;
            case 1: // baking
                SoundManager.GetInstance().OnPlayLoopSFX("Grill_level1");
                break;
            case 2: // done
                SoundManager.GetInstance().OnPlayLoopSFX("Grill_level2");
                break;
            case 3: // burnt
                SoundManager.GetInstance().OnPlayLoopSFX("Grill_level3");
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
        for (let i = 0; i < this.grillSlotObjects.length; i++) {
            let slot = this.grillSlotObjects[i].GetComponent<GrillSlot>();
            slot.SetGrillVisibility(value);
        }
        if (this.isDouble) this.unlockDouble.SetActive(value);
    }

    public GrillUnlock(level:number){
        for (let i = 0; i <= level; i++) {
            const slot = this.grillSlotObjects[i].GetComponent<GrillSlot>();
            slot.Unlock();
            if(level === 3) {
                slot.Double();
                //this.unlockDouble.SetActive(true);
                this.isDouble = true;
            }
        }
    }
}