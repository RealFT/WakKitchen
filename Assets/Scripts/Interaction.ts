import { Canvas, WaitForSeconds, GameObject, Object } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';

// import custom script from path
import CharacterController from './CharacterController';
import GameManager from './GameManager';

export default class Interaction extends ZepetoScriptBehaviour {
    public escapeButton: Button;
    public kitchen: GameObject;

    Start() {
        // Script import

        //Button Hide
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
        this.kitchen.gameObject.SetActive(value);
    }

}