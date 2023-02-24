import { SceneManager } from 'UnityEngine.SceneManagement';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Vector3, GameObject, Input, Camera, TouchPhase, Debug, SerializeField } from 'UnityEngine';
import { Vector2, LineRenderer, RectTransform, Bounds, Rect } from 'UnityEngine';
import { Image, Slider } from "UnityEngine.UI";
import OrderManager, { Ingredient } from './OrderManager';
import Slicable from './Slicable';

export default class CutBehavior extends ZepetoScriptBehaviour {
    public startPos: RectTransform;
    public endPos: RectTransform;
    public foodImages: Image[];
    public slicabes: Slicable[];
    
    private isCutting = false;

    private direction: Vector2;
    private bounds: Bounds; 

    Update() {
        if (Input.GetMouseButtonDown(0)) {
            Debug.Log("GetMouseButtonDown");
            this.startPos.position = Input.mousePosition;
            this.isCutting = true;
        } else if (Input.GetMouseButtonUp(0) && this.isCutting) {
            Debug.Log("GetMouseButtonUp");
            this.endPos.position = Input.mousePosition;
            this.isCutting = false;
            this.CutObjects();
            this.DrawLine();
        }
    }

    private CutObjects() {
        //Debug.Log("cut");
  
        for (let i = 0; i < this.foodImages.length; i++) {
            let food = this.foodImages[i];
            let screenPos = food.transform.position;
            let size = food.GetComponent<RectTransform>().sizeDelta;
            // The target image's position and dimensions
            Debug.Log("size.x: " + size.x + ", size.y: " + size.y);
            Debug.Log("screenPos.x: " + screenPos.x + ", screenPos.y: " + screenPos.y);
            //let imageRect: Rect = new Rect(screenPos.x - (size.x / 2), screenPos.y - (size.y / 2), screenPos.x + (size.x / 2), screenPos.y + (size.y / 2));
            let imageRect: Rect = new Rect(screenPos.x, screenPos.y, size.x, size.y);
            if (this.IsWithinCuttingBounds(imageRect)) {
                Debug.Log("posx: " + screenPos.x + ", posy: " + screenPos.y);
                Debug.Log("sx: " + this.startPos.position.x + ", sy: " + this.startPos.position.y);
                Debug.Log("ex: " + this.endPos.position.x + ", ey: " + this.endPos.position.y);
                Debug.Log("cut");
                //this.foodImages.push(food);
                //OrderManager.GetInstance().addProduct();
            }
        }

        for (let i = 0; i < this.foodImages.length; i++) {
            //Debug.Log("cut");
            // Implement the logic to cut the objects here
        }
    }

    // 이미지 Rect가 커팅 범위 내에 있는지 확인
    private IsWithinCuttingBounds(r: Rect): boolean {
        let minX = Math.min(this.startPos.position.x, this.endPos.position.x);
        let maxX = Math.max(this.startPos.position.x, this.endPos.position.x);
        let minY = Math.min(this.startPos.position.y, this.endPos.position.y);
        let maxY = Math.max(this.startPos.position.y, this.endPos.position.y);
        Debug.Log("xMin: " + r.xMin + ", xMax: " + r.xMax);
        Debug.Log("yMin: " + r.xMax + ", yMax: " + r.yMax);
        return (
            r.xMin <= maxX &&
            r.xMax >= minX &&
            r.yMin <= maxY &&
            r.yMax >= minY
        );
    }

    private DrawLine() {

    }
}