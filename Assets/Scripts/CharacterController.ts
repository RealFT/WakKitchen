import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { SpawnInfo, ZepetoPlayers, LocalPlayer, ZepetoCharacter, UIZepetoPlayerControl, ZepetoScreenTouchpad } from 'ZEPETO.Character.Controller';
import { WorldService } from 'ZEPETO.World';
import { GameObject, Vector3 } from 'UnityEngine';

export default class CharacterController extends ZepetoScriptBehaviour {
    @SerializeField() private playerObject: GameObject;
    @SerializeField() private moveControlUI: GameObject;
    @SerializeField() private safeArea: GameObject;
    @SerializeField() private jumpButton: GameObject;
    @SerializeField() private touchPad: ZepetoScreenTouchpad;
    @SerializeField() private handlePos: Vector3;
    @SerializeField() private handleOriginPos: Vector3;
    
    Awake() {
        // Grab the user id specified from logging into zepeto through the editor. 
        ZepetoPlayers.instance.CreatePlayerWithUserId(WorldService.userId, new SpawnInfo(), true);
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            //let _player: LocalPlayer = ZepetoPlayers.instance.LocalPlayer;
            let _player = ZepetoPlayers.instance.LocalPlayer;
            this.TryGetMoveControl();
        });
    }

    TryGetMoveControl() {
        this.moveControlUI = this.playerObject.transform.Find("UIZepetoPlayerControl").gameObject;
        this.safeArea = this.moveControlUI.transform.Find("SafeArea").gameObject;
        this.jumpButton = this.safeArea.transform.Find("Jump").gameObject;
        this.touchPad = this.moveControlUI.GetComponentInChildren<ZepetoScreenTouchpad>();
        this.handlePos = this.touchPad.touchHandle.position;
        this.handleOriginPos = this.touchPad.touchHandleOrigin.position;
    }

    DisableMoveControl() {
        if (this.moveControlUI) {
            this.touchPad.OnPointerUpEvent.Invoke();// = value;
            this.touchPad.touchHandle.position = this.handlePos;
            this.touchPad.touchHandleOrigin.position = this.handleOriginPos;
            this.touchPad.canvasGroupTouchPadBackground.alpha = 0;
            this.moveControlUI.SetActive(false);
        }
    }

    SetJump(value: boolean) {
        if (this.jumpButton) {
            this.jumpButton.SetActive(value);
        }
    }

    EnableMoveControl() {
        if (this.moveControlUI) {
            this.moveControlUI.SetActive(true);
        }
    }
}