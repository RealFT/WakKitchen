import { GameObject } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';

// import custom script from path
import GameManager from './GameManager';

export default class InteractionBase extends ZepetoScriptBehaviour {
    @SerializeField() private openButton: Button;
    @SerializeField() private escapeButton: Button;
    @SerializeField() private kitchen: GameObject;

    Start() {
        // Script import

        //Button Hide
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
        GameManager.GetInstance().SetPlayerJump(false);
        this.openButton.gameObject.SetActive(true);
    }
    OnTriggerExit(collider) {
        this.SetKitchenVisibility(false);
        this.openButton.gameObject.SetActive(false);
        GameManager.GetInstance().SetPlayerJump(true);
    }

    SetKitchenVisibility(value: boolean) {
        this.escapeButton.gameObject.SetActive(value);
        this.kitchen.gameObject.SetActive(value);
    }

}