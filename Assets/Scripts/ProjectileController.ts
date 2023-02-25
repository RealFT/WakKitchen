import { Canvas, Object, GameObject, Quaternion, Random, Rigidbody2D, Sprite, SpriteRenderer, Vector2, Vector3, WaitForSeconds } from 'UnityEngine';
import { Image, Slider } from "UnityEngine.UI";
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from './GameManager';
import { Ingredient } from './OrderManager';
import Slicable from './Slicable';

export default class ProjectileController extends ZepetoScriptBehaviour {
    // // The initial velocity of the projectile
    // public initialVelocity: Vector2;

    // // The acceleration due to gravity
    // public gravity: number;

    // // The horizontal speed of the projectile
    // public speed: number;

    // // The minimum and maximum delay between shots
    // public minDelay: number;
    // public maxDelay: number;

    // // The sprites to use for the projectiles
    // public sprites: Sprite[];

    // // Start() {
    // //     // Start the coroutine that shoots the projectiles
    // //     this.StartCoroutine(this.ShootProjectiles());
    // // }

    // private *ShootProjectiles() {
    //     while (true) {
    //         // Wait for a random amount of time between shots
    //         let delay = Random.Range(this.minDelay, this.maxDelay);
    //         yield new WaitForSeconds(delay);

    //         // Instantiate a new projectile
    //         let projectile = new GameObject();
    //         projectile.transform.position = this.transform.position;
    //         projectile.AddComponent<SpriteRenderer>().sprite = this.sprites[Random.Range(0, this.sprites.length)];
    //         projectile.AddComponent<Rigidbody2D>().gravityScale = this.gravity;
    //         projectile.GetComponent<Rigidbody2D>().velocity = this.initialVelocity * this.speed;

    //         // Destroy the projectile after a certain amount of time
    //         GameObject.Destroy(projectile, 10);
    //     }
    // }
    public slicablePrefab: GameObject;
    public canvas: Canvas;
    
    public originSprites: Sprite[];
    private ingredients: Map<number, Ingredient>;
    private slicableItemsPool: GameObject[] = [];
    private spawnCount = 0;

    Start() {
        this.ingredients = new Map<number, Ingredient>();
        this.ingredients.set(0,Ingredient.CABBAGE);
        this.ingredients.set(1,Ingredient.TOMATO);
        this.ingredients.set(2,Ingredient.ONION);
        this.spawnCount = 10;
        
        // Initialize the object pool with 10 instances of the receipt item prefab
        for (let i = 0; i < this.spawnCount; i++) {
            this.slicableItemsPool.push(this.CreateSlicable());
        }
        
        this.SpawnSlicable(new Vector3(0, 0, 0));
        this.SpawnSlicable(new Vector3(0, 0, 0));
        this.SpawnSlicable(new Vector3(0, 0, 0));
    }

    public SpawnSlicable(position: Vector3) {
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
        slicable.SetSlicable(this.originSprites[0], this.ingredients.get(0));
        slicableObj.transform.position = position;
        slicableObj.SetActive(true);
    }

    private CreateSlicable(): GameObject {
        let slicableObj: GameObject = null;
        slicableObj = Object.Instantiate(this.slicablePrefab, new Vector3(0, 0, 0), Quaternion.identity, this.canvas.transform) as GameObject;
        slicableObj.SetActive(false);
        return slicableObj;
    }
}