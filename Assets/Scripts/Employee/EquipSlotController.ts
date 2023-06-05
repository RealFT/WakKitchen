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
import EmployeeManager from './EmployeeManager';

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

        this.ClearSlots();

        // 기록된 데이터 불러오기
        // 기본값이 0 이므로 인덱스가 0일 경우를 대비해 +1 로 저장.
        // 값을 가져올 때 -1 연산 필요
        const sprites = DataManager.GetInstance().GetSectionSprites();
        for (let index = 0; index < this.equipSlots.length; index++) {
            const cardId = DataManager.GetInstance().GetStrValue(`EquipSlot_${index}`);
            if (cardId == "") continue;
            else {
                const cardData = DataManager.GetInstance().GetCardData(cardId);
                this.equipSlots[index].EquipCard(cardData, index);
                const sectionIndex = DataManager.GetInstance().GetValue(`EquipSlot_Section_${index}`);
                if(sectionIndex != 0){
                    this.equipSlots[index].SelectSection(sprites[sectionIndex - 1], sectionIndex - 1);
                }
            }
        }
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
                for (let i = 0; i < this.equipSlots.length; i++) {
                    if(this.equipSlots[i].IsEquip() == false) continue;
                    else if(DataManager.GetInstance().UseCard(this.equipSlots[i].getEquippedCardData().GetCardId(), 1) == false){
                        EmployeeManager.GetInstance().UnregisterCard(i);
                        this.equipSlots[i].InitSlot();
                    }
                }
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
            if (!this.equipSlots[i].IsEquip() &&
                !this.equipSlots[i].IsLocked()) {
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
        for (let i = 0; i < this.equipSlots.length; i++) {
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
        for (let i = 0; i < this.equipSlots.length; i++) {
            if (!this.equipSlots[i].IsLocked() &&
                !this.equipSlots[i].IsEquip() &&
                !this.equipSlots[i].IsSelected()) {
                return true;
            }
        }
        return false;
    }

    public ClearSlots(){
        for (let i = 0; i < this.equipSlots.length; i++) {
            let slot = this.equipSlots[i];
            slot.InitSlot();
        }
    }
}