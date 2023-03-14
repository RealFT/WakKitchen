import { GameObject } from 'UnityEngine';
import { Image } from 'UnityEngine.UI';
import FrySlot from './FrySlot';
import InteractionBase from './InteractionBase';

export default class Interaction_Fry extends InteractionBase {
    @SerializeField() private frySlotObjects: GameObject[];
    @SerializeField() private images: Image[];
    @SerializeField() private fryPanel: GameObject;

    Start() {
        super.Start();
        //Button Hide
        this.fryPanel.SetActive(true);
        this.kitchen.SetActive(true);
        this.SetKitchenVisibility(false);
        this.openButton.gameObject.SetActive(false);
    }

    OnTriggerEnter(collider) {
        super.OnTriggerEnter(collider);
    }

    OnTriggerExit(collider) {
        super.OnTriggerExit(collider);
    }

    SetKitchenVisibility(value: boolean) {
        super.SetKitchenVisibility(value);
        for (let i = 0; i < this.images.length; i++) {
            this.images[i].enabled = value;
        }
        for (let i = 0; i < this.frySlotObjects.length; i++) {
            this.frySlotObjects[i].GetComponent<FrySlot>().SetFryVisibility(value);
        }
    }
}