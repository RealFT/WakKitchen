import { GameObject } from 'UnityEngine';
import { Button, Image } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
// import custom script from path
import GameManager from './GameManager';
import FrySlot from './FrySlot';

export default class Interaction_Fry extends ZepetoScriptBehaviour {
    public escapeButton: Button;
    public frySlotObjects: GameObject[];
    public images: Image[];
    public fryCanvas: GameObject;
    public kitchen: GameObject;

    Start() {
        //Button Hide
        this.fryCanvas.SetActive(true);
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

    SetKitchenVisibility(value: boolean) {
        this.escapeButton.gameObject.SetActive(value);
        for (let i = 0; i < this.images.length; i++) {
            this.images[i].enabled = value;
        }
        for (let i = 0; i < this.frySlotObjects.length; i++) {
            this.frySlotObjects[i].GetComponent<FrySlot>().SetFryVisibility(value);
        }
    }
}