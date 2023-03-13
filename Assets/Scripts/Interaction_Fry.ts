import { GameObject } from 'UnityEngine';
import { Button, Image } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
// import custom script from path
import GameManager from './GameManager';
import FrySlot from './FrySlot';

export default class Interaction_Fry extends ZepetoScriptBehaviour {
    @SerializeField() private openButton: Button;
    @SerializeField() private escapeButton: Button;
    @SerializeField() private frySlotObjects: GameObject[];
    @SerializeField() private images: Image[];
    @SerializeField() private fryPanel: GameObject;
    @SerializeField() private kitchen: GameObject;

    Start() {
        //Button Hide
        this.fryPanel.SetActive(true);
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
            this.SetKitchenVisibility(false);
            GameManager.GetInstance().SetPlayerMovement(true);
            this.openButton.gameObject.SetActive(true);
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
        for (let i = 0; i < this.frySlotObjects.length; i++) {
            this.frySlotObjects[i].GetComponent<FrySlot>().SetFryVisibility(value);
        }
    }
}