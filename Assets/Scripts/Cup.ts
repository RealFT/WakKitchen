import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export enum CupState {
    COKE = "Coke",
    SPRITE = "Sprite",
    ZERO = "Zero",
    FANTA = "Fanta",
    WATER = "Water",
    DEFAULT = "Default"
}

export default class Cup extends ZepetoScriptBehaviour {


    private cupState: CupState;

    Start(){
        this.cupState = CupState.DEFAULT;
    }

    public GetState(): CupState {
        return this.cupState;
    }

    OnTriggerEnter2D(collider2D) {
        this.cupState = collider2D.gameObject.tag;
        // switch (collider.gameObject.tag) {
        //     case CupState.COKE:
        //         break;
        //     case CupState.SPRITE:
        //         break;
        //     case CupState.ZERO_COKE:
        //         break;
        //     case CupState.FANTA:
        //         break;
        //     case CupState.WATER:
        //         break;
        // }
    }

    OnTriggerExit2D(collider2D) {
        this.cupState = CupState.DEFAULT;
    }

}