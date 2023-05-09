import { Canvas, Object, GameObject, Quaternion, Rigidbody2D, Sprite, Vector3, WaitForSeconds, Input, Time } from 'UnityEngine';
import { Vector2, RectTransform, Random, Rect, Debug } from 'UnityEngine';
import { Image, Slider } from "UnityEngine.UI";
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from './GameManager';
import OrderManager from './OrderManager';
import DataManager, { Ingredient } from './DataManager';
import Slicable from './Slicable';
import ItemManager from './ItemManager';
import Mediator, { EventNames, IListener }  from './Notification/Mediator';

export default class SliceController extends ZepetoScriptBehaviour implements IListener  {
    public slicablePrefab: GameObject;  // The prefab for the ingredient that will be sliced
    public mask: GameObject;  // The mask on which the ingredients will be spawned

    public originSprites: Sprite[]; // The original sprites for each type of ingredient
    // A map of ingredient indices to their corresponding enum values
    private ingredients: Map<number, Ingredient> = new Map<number, Ingredient>();   
    private slicableItemsPool: Slicable[] = [];   // An object pool of GameObjects used to spawn new ingredients
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
    public slicePoint: RectTransform;

    Start() {
        this.ingredients.set(0, Ingredient.CABBAGE);
        this.ingredients.set(1, Ingredient.TOMATO);
        this.ingredients.set(2, Ingredient.ONION);
        this.spawnCount = 10;

        // Initialize the object pool with 10 instances of the receipt item prefab
        for (let i = 0; i < this.spawnCount; i++) {
            this.slicableItemsPool.push(this.CreateSlicable().GetComponent<Slicable>());
        }

        const upgradedlevel = ItemManager.GetInstance().GetUpgradedLevel("slice");
        this.SlcieUnlock(upgradedlevel);

        // Start the coroutine that shoots the projectiles
        this.StartCoroutine(this.ShootSlicables());
        Mediator.GetInstance().RegisterListener(this);
    }

    private OnDestroy() {
        Mediator.GetInstance().UnregisterListener(this);
    }

    public OnNotify(sender: any, eventName: string, eventData: any): void {
        if(eventName === EventNames.UpgradeUpdated){
            const upgradedlevel = ItemManager.GetInstance().GetUpgradedLevel("slice");
            this.SlcieUnlock(upgradedlevel);
        }
    }
    
    DisableSlicables(){
        this.StopAllCoroutines();
        for (let i = 0; i < this.slicableItemsPool.length; i++) {
            this.slicableItemsPool[i].gameObject.SetActive(false);
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
        if (Input.GetMouseButton(0)) {
            if (!this.slicePoint.gameObject.activeSelf)
                this.slicePoint.gameObject.SetActive(true);
            this.slicePoint.position = Input.mousePosition;
            this.SliceObjects(this.slicePoint.position);
        } else {
            this.slicePoint.gameObject.SetActive(false);
        }
    }

    private *ShootSlicables() {
        while (true) {
            // Wait for a random amount of time between shots
            let delay = Random.Range(this.minDelay, this.maxDelay);
            yield new WaitForSeconds(delay);

            // Instantiate a new slicableObj
            let slicableObj = this.GetSlicable().gameObject;
            const spawnX = Random.Range(this.leftSpawnPos.position.x, this.rightSpawnPos.position.x);
            slicableObj.transform.position = this.leftSpawnPos.position + new Vector3(spawnX, 0, 0);
            slicableObj.SetActive(true);
            //slicableObj.AddComponent<SpriteRenderer>().sprite = this.sprites[Random.Range(0, this.sprites.length)];
            this.initialVelocity = new Vector2(Random.Range(-1 * this.tiltAngle, this.tiltAngle), 1);
            slicableObj.GetComponent<Rigidbody2D>().gravityScale = this.gravity;
            slicableObj.GetComponent<Rigidbody2D>().velocity = this.initialVelocity * this.speed;
        }
    }

    public GetSlicable(): Slicable {
        let slicableObj: GameObject = null;
        // Check if there's a deactivated receipt item in the pool
        for (const item of this.slicableItemsPool) {
            if (!item.gameObject.activeSelf) {
                slicableObj = item.gameObject;
                break;
            }
        }
        // If there's no deactivated item, create a new one and add it to the pool
        if (!slicableObj) {
            slicableObj = this.CreateSlicable();
            this.slicableItemsPool.push(slicableObj.GetComponent<Slicable>());
        }
        // Set the position and sprite of the receipt item and activate it
        const slicable = slicableObj.GetComponent<Slicable>();
        const randomIndex = Math.floor(Random.Range(0, this.ingredients.size));
        const randomInt = Math.floor(Math.random() * 3); // 0, 1, 2 중 랜덤으로 선택됩니다.
        let selectedIndex: Ingredient.CABBAGE | Ingredient.TOMATO | Ingredient.ONION;
        switch (randomInt) {
            case 0:
                selectedIndex = Ingredient.CABBAGE;
                break;
            case 1:
                selectedIndex = Ingredient.TOMATO;
                break;
            case 2:
                selectedIndex = Ingredient.ONION;
                break;
            default:
                throw new Error("Unexpected random integer value.");
        }
        slicable.SetSlicable(this.originSprites[selectedIndex], this.ingredients.get(selectedIndex));
        return slicable;
    }

    private CreateSlicable(): GameObject {
        let slicableObj: GameObject = null;
        slicableObj = Object.Instantiate(this.slicablePrefab, new Vector3(0, 0, 0), Quaternion.identity, this.mask.transform) as GameObject;
        slicableObj.SetActive(false);
        return slicableObj;
    }

    private SliceObjects(point: Vector3) {
        for (let i = 0; i < this.slicableItemsPool.length; i++) {
            if(!this.slicableItemsPool[i].gameObject.activeSelf) continue;
            const slicable = this.slicableItemsPool[i];
            let screenPos = slicable.transform.position;
            let size = slicable.GetComponent<RectTransform>().sizeDelta;
            let imageRect: Rect = new Rect(screenPos.x, screenPos.y, size.x, size.y);
            if (this.IsPointWithinRect(point, imageRect)) {
                slicable.Sliced();
                OrderManager.GetInstance().AddItemToInventory(slicable.GetIngredient());
            }
        }
    }

    private IsPointWithinRect(point: Vector3, rect: Rect): boolean {
        return (
            point.x >= rect.xMin &&
            point.x <= rect.xMax &&
            point.y >= rect.yMin &&
            point.y <= rect.yMax
        );
    }

    public SlcieUnlock(level:number){
        if(level >= 1){
            this.maxDelay = 1.4;
        }
        if(level >= 2){
            this.maxDelay = 1.0;
        }
        if(level >= 3){
            this.maxDelay = 0.6;
        }
    }
}