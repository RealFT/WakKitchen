import { Camera, WaitForSeconds, GameObject } from 'UnityEngine';
import { Button, Image } from 'UnityEngine.UI';
import { ZepetoPlayers, ZepetoCharacter } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';

// import custom script from path
import CharacterController from './CharacterController';
import GameManager from './GameManager';
import GrillSlot from './GrillSlot';

export default class GrillInteraction extends ZepetoScriptBehaviour {
    public escapeButton: Button;
    public grillSlotObjects: GameObject[];
    public images: Image[];
    //private grillSlots: GrillSlot[];
    public grillCanvas: GameObject;
    public kitchen: GameObject;
    //private gameMgr: GameManager;

    Start() {
        // Script import
        //this.gameMgr = GameManager.GetInstance();
/*         for (let i = 0; i < this.grillSlotObjects.length; i++) {
            this.grillSlots[i] = this.grillSlotObjects[i].GetComponent<GrillSlot>();
        } */

        //Button Hide
        this.grillCanvas.SetActive(true);
        this.kitchen.SetActive(true);
        this.SetKitchenVisibility(false);

        //When Button Click
        this.escapeButton.onClick.AddListener(() => {
            GameManager.GetInstance().SetPlayerMovement(true);
            this.SetKitchenVisibility(false);
        });
    }

    OnTriggerEnter(collider) {
        this.SetKitchenVisibility(true);
        GameManager.GetInstance().SetPlayerMovement(false);
    }

    OnTriggerExit(collider) {
        this.SetKitchenVisibility(false);
        GameManager.GetInstance().SetPlayerMovement(true);
    }

    SetKitchenVisibility(value: bool) {
        this.escapeButton.gameObject.SetActive(value);
        for (let i = 0; i < this.images.length; i++) {
            this.images[i].enabled = value;
        }
        for (let i = 0; i < this.grillSlotObjects.length; i++) {
            this.grillSlotObjects[i].GetComponent<GrillSlot>().SetGrillVisibility(value);
        }
    }
}