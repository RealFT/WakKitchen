import { Camera, Canvas, AnimationClip, WaitForSeconds, GameObject, Object, Random } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import { ZepetoPlayers, ZepetoCharacter } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';

// import custom script from path
import UIController from './UIController';
import CharacterController from './CharacterController';

export default class Interaction extends ZepetoScriptBehaviour {
    public openUIGesture: Button;
    public kitchen: GameObject;
    public animationClip: AnimationClip;
    public uiControllerObject: GameObject;
    public controllerObject: GameObject;
    public controller: CharacterController;

    private uiController: UIController;
    private zepetoCharacter: ZepetoCharacter;


    Start() {
        // Set character
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this.zepetoCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        });
        // Script import
        this.uiController = this.uiControllerObject.GetComponent<UIController>();
        this.controller = this.controllerObject.GetComponent<CharacterController>();

        //Button Hide
        this.openUIGesture.gameObject.SetActive(false);
        this.kitchen.gameObject.SetActive(false);

        //When Button Click
        this.openUIGesture.onClick.AddListener(() => {
            //this.zepetoCharacter.SetGesture(this.animationClip);
            this.controller.enableMoveControl();
        });
    }

    OnTriggerEnter(collider) {
        this.openUIGesture.gameObject.SetActive(true);
        this.kitchen.gameObject.SetActive(true);
        this.uiController.Loading();
        this.controller.DisableMoveControl();
    }
    OnTriggerExit(collider) {
        this.openUIGesture.gameObject.SetActive(false);
        this.kitchen.gameObject.SetActive(false);
        this.uiController.Init();
        this.controller.enableMoveControl();
    }
}