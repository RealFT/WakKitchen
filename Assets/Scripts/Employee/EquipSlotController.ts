import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Sprite } from 'UnityEngine';
import { Toggle } from 'UnityEngine.UI';
import EquipSlot from './EquipSlot';
export default class EquipSlotController extends ZepetoScriptBehaviour {
    
    @SerializeField() private equipSlotObjects: GameObject[];
    private equipSlots: EquipSlot[] = [];
    private selectedToggle: Toggle; // Variable to store the selected toggle

    Start() {    
        for (let i = 0; i < this.equipSlotObjects.length; i++) {
            this.equipSlots[i] = this.equipSlotObjects[i].GetComponent<EquipSlot>();
            let toggle = this.equipSlots[i].GetSelectSectionOpenToggle();
            toggle.onValueChanged.AddListener((isOn) => {
                if (isOn) {
                    this.OnToggleValueChanged(toggle);
                }
            });
        }
    }

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

    public EquipCharacter(characterSprite: Sprite) {
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
            this.equipSlots[emptyIndex].EquipCard(characterSprite);
        }
    }
}