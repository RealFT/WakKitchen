import InteractionBase from './InteractionBase';

export default class Interaction extends InteractionBase {
    Start() {
        super.Start();
    }

    OnTriggerEnter(collider) {
        super.OnTriggerEnter(collider);
    }

    OnTriggerExit(collider) {
        super.OnTriggerExit(collider);
    }

    SetKitchenVisibility(value: boolean) {
        super.SetKitchenVisibility(value);
        this.kitchen.gameObject.SetActive(value);
    }
}