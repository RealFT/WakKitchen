import { Time, Transform, Vector3 } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class Dispenser extends ZepetoScriptBehaviour {

    public leftMax: Transform; // Max value that can be moved to the left
    public rightMax: Transform; // Max value that can be moved to the right
    public cupTransform: Transform; // Cup's Transform
    public direction: number; //이동속도+방향
    private isCatch: boolean;
    Start() {
        this.init();
    }

    init() {
        this.StopAllCoroutines();
        this.isCatch = false;
        this.cupTransform.position = this.leftMax.position;
        this.StartCoroutine(this.DoMoving());
    }

    // Dispenser Coroutine
    *DoMoving() {
        while (!this.isCatch) {
            this.cupTransform.position.x += Time.deltaTime * this.direction;
            //If the current position (x) is greater than or equal to the maximum value that can be moved rightward
            // Invert the movement speed + direction by multiplying it by -1 and setting the current position to the maximum value that can be moved to the right.
            if (this.cupTransform.position.x >= this.rightMax.position.x) {
                this.direction *= -1;
                this.cupTransform.position.x = this.rightMax.position.x;
            }
            //If the current position (x) is greater than or equal to the maximum left-leasable (x),
            // Invert movement speed + direction by multiplying -1 and setting the current position to the maximum value that can be moved to the left
            else if (this.cupTransform.position.x <= this.leftMax.position.x) {
                this.direction *= -1;
                this.cupTransform.position.x = this.leftMax.position.x;
            }
        }
    }
}