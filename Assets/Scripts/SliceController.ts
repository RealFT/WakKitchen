import { Canvas, Object, GameObject, Quaternion, Rigidbody2D, Sprite, Vector3, WaitForSeconds, Input } from 'UnityEngine';
import { Vector2, RectTransform, Random, Rect, Debug } from 'UnityEngine';
import { Image, Slider } from "UnityEngine.UI";
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from './GameManager';
import { Ingredient } from './OrderManager';
import Slicable from './Slicable';

export default class SliceController extends ZepetoScriptBehaviour {
    public slicablePrefab: GameObject;  // The prefab for the ingredient that will be sliced
    public canvas: Canvas;  // The canvas on which the ingredients will be spawned

    public originSprites: Sprite[]; // The original sprites for each type of ingredient
    private ingredients: Map<number, Ingredient>;   // A map of ingredient indices to their corresponding enum values
    private slicableItemsPool: GameObject[] = [];   // An object pool of GameObjects used to spawn new ingredients
    private spawnCount = 0; // The number of ingredients to spawn initially
    private isCutting = false;  // Whether the player is currently in the process of cutting ingredients

    public initialVelocity: Vector2;    // The initial velocity of the ingredient
    public tiltAngle: number;     // the degree to which the ingredients are tilted
    public gravity: number;    // The acceleration due to gravity
    public speed: number;    // speed of the ingredient

    // The minimum and maximum delay between shots
    public minDelay: number;
    public maxDelay: number;

    // The maximum left and right position at which the ingredient can spawn.
    public leftSpawnPos: RectTransform;
    public rightSpawnPos: RectTransform;

    // The start and end positions of the cut.
    public startSlicePoint: RectTransform;
    public endSlicePoint: RectTransform;

    Start() {
        this.ingredients = new Map<number, Ingredient>();
        this.ingredients.set(0, Ingredient.CABBAGE);
        this.ingredients.set(1, Ingredient.TOMATO);
        this.ingredients.set(2, Ingredient.ONION);
        this.spawnCount = 10;

        // Initialize the object pool with 10 instances of the receipt item prefab
        for (let i = 0; i < this.spawnCount; i++) {
            this.slicableItemsPool.push(this.CreateSlicable());
        }

        // Start the coroutine that shoots the projectiles
        this.StartCoroutine(this.ShootSlicables());
    }

    DisableSlicables(){
        this.StopAllCoroutines();
        for (let i = 0; i < this.slicableItemsPool.length; i++) {
            this.slicableItemsPool[i].SetActive(false);
        }
    }

    private OnEnable() {
        this.DisableSlicables();
        this.StartCoroutine(this.ShootSlicables());
    }

    private OnDisable() {
        this.DisableSlicables();
    }

    Update() {
        if (Input.GetMouseButtonDown(0)) {
            Debug.Log("GetMouseButtonDown");
            this.startSlicePoint.position = Input.mousePosition;
            this.isCutting = true;
        } else if (Input.GetMouseButtonUp(0) && this.isCutting) {
            Debug.Log("GetMouseButtonUp");
            this.endSlicePoint.position = Input.mousePosition;
            this.isCutting = false;
            this.SliceObjects();
            //this.DrawLine();
        }
    }

    private *ShootSlicables() {
        while (true) {
            // Wait for a random amount of time between shots
            let delay = Random.Range(this.minDelay, this.maxDelay);
            yield new WaitForSeconds(delay);

            // Instantiate a new slicableObj
            let slicableObj = this.GetSlicable();
            const spawnX = Random.Range(this.leftSpawnPos.position.x, this.rightSpawnPos.position.x);
            slicableObj.transform.position = this.leftSpawnPos.position + new Vector3(spawnX, 0, 0);
            slicableObj.SetActive(true);
            //slicableObj.AddComponent<SpriteRenderer>().sprite = this.sprites[Random.Range(0, this.sprites.length)];
            this.initialVelocity = new Vector2(Random.Range(-1 * this.tiltAngle, this.tiltAngle), 1);
            slicableObj.GetComponent<Rigidbody2D>().gravityScale = this.gravity;
            slicableObj.GetComponent<Rigidbody2D>().velocity = this.initialVelocity * this.speed;

            // Destroy the slicableObj after a certain amount of time
            //GameObject.Destroy(slicableObj, 10);
        }
    }

    public GetSlicable(): GameObject {
        let slicableObj: GameObject = null;
        // Check if there's a deactivated receipt item in the pool
        for (const item of this.slicableItemsPool) {
            if (!item.activeSelf) {
                slicableObj = item;
                break;
            }
        }
        // If there's no deactivated item, create a new one and add it to the pool
        if (!slicableObj) {
            slicableObj = this.CreateSlicable();
            this.slicableItemsPool.push(slicableObj);
        }
        // Set the position and sprite of the receipt item and activate it
        const slicable = slicableObj.GetComponent<Slicable>();
        const randomIndex = Math.floor(Random.Range(0, this.ingredients.size));
        slicable.SetSlicable(this.originSprites[randomIndex], this.ingredients.get(randomIndex));
        return slicableObj;
    }

    private CreateSlicable(): GameObject {
        let slicableObj: GameObject = null;
        slicableObj = Object.Instantiate(this.slicablePrefab, new Vector3(0, 0, 0), Quaternion.identity, this.canvas.transform) as GameObject;
        slicableObj.SetActive(false);
        return slicableObj;
    }

    private SliceObjects() {
        //Debug.Log("cut");

        for (let i = 0; i < this.slicableItemsPool.length; i++) {
            const slicable = this.slicableItemsPool[i].GetComponent<Slicable>();
            let food = slicable.GetSlicableImage();
            let screenPos = food.transform.position;
            let size = food.GetComponent<RectTransform>().sizeDelta;
            // The target image's position and dimensions
            // Debug.Log("size.x: " + size.x + ", size.y: " + size.y);
            // Debug.Log("screenPos.x: " + screenPos.x + ", screenPos.y: " + screenPos.y);
            //let imageRect: Rect = new Rect(screenPos.x - (size.x / 2), screenPos.y - (size.y / 2), screenPos.x + (size.x / 2), screenPos.y + (size.y / 2));
            let imageRect: Rect = new Rect(screenPos.x, screenPos.y, size.x, size.y);
            if (this.IsWithinCuttingBounds(imageRect)) {
                // Debug.Log("posx: " + screenPos.x + ", posy: " + screenPos.y);
                // Debug.Log("sx: " + this.startPos.position.x + ", sy: " + this.startPos.position.y);
                // Debug.Log("ex: " + this.endPos.position.x + ", ey: " + this.endPos.position.y);
                Debug.Log("Slice :" + slicable.GetIngredient());
                slicable.Sliced();
                //this.foodImages.push(food);
                //OrderManager.GetInstance().AddItemToInventory(this.slicabes[i].GetIngredient());
            }
        }

        // for (let i = 0; i < this.slicedImages.length; i++) {
        //     //Debug.Log("cut");
        //     // Implement the logic to cut the objects here
        // }
    }

    // 이미지 Rect가 커팅 범위 내에 있는지 확인
    private IsWithinCuttingBounds(r: Rect): boolean {
        let minX = Math.min(this.startSlicePoint.position.x, this.endSlicePoint.position.x);
        let maxX = Math.max(this.startSlicePoint.position.x, this.endSlicePoint.position.x);
        let minY = Math.min(this.startSlicePoint.position.y, this.endSlicePoint.position.y);
        let maxY = Math.max(this.startSlicePoint.position.y, this.endSlicePoint.position.y);
        Debug.Log("xMin: " + r.xMin + ", xMax: " + r.xMax);
        Debug.Log("yMin: " + r.xMax + ", yMax: " + r.yMax);
        return (
            r.xMin <= maxX &&
            r.xMax >= minX &&
            r.yMin <= maxY &&
            r.yMax >= minY
        );
    }

}