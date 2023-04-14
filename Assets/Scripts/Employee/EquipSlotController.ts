import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Sprite } from 'UnityEngine';
import { Toggle } from 'UnityEngine.UI';
import EquipSlot from './EquipSlot';
import CardData from './CardData';

export default class EquipSlotController extends ZepetoScriptBehaviour {
    
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
        }
    }
}