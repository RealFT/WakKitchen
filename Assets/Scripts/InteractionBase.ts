import { GameObject } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
// import custom script from path
import GameManager from './GameManager';

export default class InteractionBase extends ZepetoScriptBehaviour {
    @SerializeField() protected openButton: Button;
    @SerializeField() protected escapeButton: Button;
    @SerializeField() protected kitchen: GameObject;

    protected Start() {
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

    protected OnTriggerEnter(collider) {
        GameManager.GetInstance().SetPlayerJump(false);
        this.openButton.gameObject.SetActive(true);
    }

    protected OnTriggerExit(collider) {
        this.SetKitchenVisibility(false);
        GameManager.GetInstance().SetPlayerJump(true);
        this.openButton.gameObject.SetActive(false);
    }

    protected SetKitchenVisibility(value: boolean) {
        this.escapeButton.gameObject.SetActive(value);
    }
}