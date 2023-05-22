import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Sprite } from 'UnityEngine';
import { Toggle } from 'UnityEngine.UI';
import EquipSlot from './EquipSlot';
import CardData from './CardData';
import ItemManager from '../ItemManager';
import UIManager from '../UIManager';
import SoundManager from '../SoundManager';
import Mediator, { EventNames, IListener } from '../Notification/Mediator';
import DataManager from '../DataManager';

export default class EquipSlotController extends ZepetoScriptBehaviour implements IListener {
    
    @SerializeField() private equipSlotParent: GameObject;
    private equipSlots: EquipSlot[] = [];
    private selectedToggle: Toggle; // Variable to store the selected toggle

    Start() {    
        this.equipSlots = this.equipSlotParent.GetComponentsInChildren<EquipSlot>();
        for (let i = 0; i < this.equipSlots.length; i++) {
            let toggle = this.equipSlots[i].GetSelectSectionOpenToggle();
            toggle.onValueChanged.AddListener((isOn) => {
                if (isOn) {
                    this.OnToggleValueChanged(toggle);
                }
            });
        }

        const upgradedlevel = ItemManager.GetInstance().GetUpgradedLevel("employee");
        this.EquipUnlock(upgradedlevel);
        Mediator.GetInstance().RegisterListener(this);
    }

    private OnDestroy() {
        Mediator.GetInstance().UnregisterListener(this);
    }
    public OnNotify(sender: any, eventName: string, eventData: any): void {
        switch(eventName){
            case EventNames.UpgradeUpdated:
                const upgradedLevel = ItemManager.GetInstance().GetUpgradedLevel("employee");
                this.EquipUnlock(upgradedLevel);
                break;
            case EventNames.StageEnded:
                this.ClearSlots();
                break;
            default:
                // In case an unhandled event occurs
                break;
        }
    }
    
    // 다른 장착 캐릭터의 섹션 선택 시 다른 섹션은 비활성화되는 기능
    private OnToggleValueChanged(toggle: Toggle) {
        if (toggle != this.selectedToggle) {
            // If a different toggle is selected
            if (this.selectedToggle) {
                this.selectedToggle.isOn = false; // Deselect the previously selected toggle
            }
            this.selectedToggle = toggle; // Save the new selected toggle
        } else {
            // If the same toggle is selected again
            this.selectedToggle = null; // Deselect the current toggle
        }
    }

    public EquipCharacter(cardData: CardData) {
        // Find an empty card equip slot
        let emptyIndex = -1;
        for (let i = 0; i < this.equipSlots.length; i++) {
            if (!this.equipSlots[i].IsEquip()) {
                emptyIndex = i;
                break;
            }
        }

        if (emptyIndex != -1) {
            // Equip the character to the first empty card equip slot
            this.equipSlots[emptyIndex].EquipCard(cardData, emptyIndex);
            SoundManager.GetInstance().OnPlaySFX(SoundManager.GetInstance().keyBtnEquip);
        }
        else{
            UIManager.GetInstance().OpenInformation("No slots available.");
            SoundManager.GetInstance().OnPlaySFX("Tresh");
        }
    }

    public EquipUnlock(level:number){
        for (let i = 0; i < level; i++) {
            this.equipSlots[i].Unlock();
        }
    }

    // Checks if all equipment slots are selected.
    public CheckSlots(): boolean {
        for (let i = 0; i < this.equipSlots.Length; i++) {
            // Check only unlocked slots,
            // If any equipped slot is not selected, return false.
            if (!this.equipSlots[i].IsLocked() &&
                this.equipSlots[i].IsEquip() &&
                !this.equipSlots[i].IsSelected()) {
                return false;
            }
        }
        // If all unlocked slots are selected, return true.
        return true;
    }

    public IsEmpty(): boolean {
        for (let i = 0; i < this.equipSlots.Length; i++) {
            if (!this.equipSlots[i].IsLocked() &&
                !this.equipSlots[i].IsEquip() &&
                !this.equipSlots[i].IsSelected()) {
                return true;
            }
        }
        return false;
    }

    public ClearSlots(){
        for (let i = 0; i < this.equipSlots.Length; i++) {
            this.equipSlots[i].InitSlot();
        }
    }
}