import { Camera, WaitForSeconds, GameObject } from 'UnityEngine';
import { Button, Image } from 'UnityEngine.UI';
import { ZepetoPlayers, ZepetoCharacter } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';

// import custom script from path
import CharacterController from './CharacterController';
import GameManager from './GameManager';
import GrillSlot from './GrillSlot';

export default class Interaction_Grill extends ZepetoScriptBehaviour {
    @SerializeField() private openButton: Button;
    @SerializeField() private escapeButton: Button;
    @SerializeField() private grillSlotObjects: GameObject[];
    @SerializeField() private images: Image[];
    @SerializeField() private grillPanel: GameObject;
    @SerializeField() private kitchen: GameObject;

    Start() {
        // Script import
        //this.gameMgr = GameManager.GetInstance();
/*         for (let i = 0; i < this.grillSlotObjects.length; i++) {
            this.grillSlots[i] = this.grillSlotObjects[i].GetComponent<GrillSlot>();
        } */

        //Button Hide
        this.grillPanel.SetActive(true);
        this.kitchen.SetActive(true);
        this.SetKitchenVisibility(false);
        this.openButton.gameObject.SetActive(false);

        //When Button Click
        this.openButton.onClick.AddListener(() => {
            this.SetKitchenVisibility(true);
            GameManager.GetInstance().SetPlayerMovement(false);
            this.openButton.gameObject.SetActive(false);
        });
        
        //When Button Click
        this.escapeButton.onClick.AddListener(() => {
            GameManager.GetInstance().SetPlayerMovement(true);
            this.SetKitchenVisibility(false);
        });
    }

    OnTriggerEnter(collider) {
        // this.SetKitchenVisibility(true);
        GameManager.GetInstance().SetPlayerJump(false);
        this.openButton.gameObject.SetActive(true);
    }
    OnTriggerExit(collider) {
        this.SetKitchenVisibility(false);
        this.openButton.gameObject.SetActive(false);
        GameManager.GetInstance().SetPlayerJump(true);
        //GameManager.GetInstance().SetPlayerMovement(true);
    }

    SetKitchenVisibility(value: boolean) {
        this.escapeButton.gameObject.SetActive(value);
        for (let i = 0; i < this.images.length; i++) {
            this.images[i].enabled = value;
        }
        for (let i = 0; i < this.grillSlotObjects.length; i++) {
            this.grillSlotObjects[i].GetComponent<GrillSlot>().SetGrillVisibility(value);
        }
    }
}