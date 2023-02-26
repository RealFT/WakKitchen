import { Vector3, Input, Camera } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class MouseChaser extends ZepetoScriptBehaviour {

    // 카메라로부터의 거리
    @SerializeField() private distanceFromCamera: float = 5;
    @SerializeField() private ChasingSpeed: float = 0.1;

    private mousePos: Vector3;
    private nextPos: Vector3;

    private OnValidate() {
        if (this.distanceFromCamera < 0)
            this.distanceFromCamera = 0;
    }

    Update() {
        this.mousePos = Input.mousePosition;
        this.mousePos.z = this.distanceFromCamera;

        this.nextPos = Camera.main.ScreenToWorldPoint(this.mousePos);
        this.transform.position = Vector3.Lerp(this.transform.position, this.nextPos, this.ChasingSpeed);
    }

}