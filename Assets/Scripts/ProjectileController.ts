import { Canvas, Object, GameObject, Quaternion, Random, Rigidbody2D, Sprite, SpriteRenderer, Vector2, Vector3, WaitForSeconds } from 'UnityEngine';
import { Image, Slider } from "UnityEngine.UI";
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class ProjectileController extends ZepetoScriptBehaviour {
    // The initial velocity of the projectile
    public initialVelocity: Vector2;

    // The acceleration due to gravity
    public gravity: number;

    // The horizontal speed of the projectile
    public speed: number;

    // The minimum and maximum delay between shots
    public minDelay: number;
    public maxDelay: number;

    // The sprites to use for the projectiles
    public sprites: Sprite[];

    // Start() {
    //     // Start the coroutine that shoots the projectiles
    //     this.StartCoroutine(this.ShootProjectiles());
    // }

    private *ShootProjectiles() {
        while (true) {
            // Wait for a random amount of time between shots
            let delay = Random.Range(this.minDelay, this.maxDelay);
            yield new WaitForSeconds(delay);

            // Instantiate a new projectile
            let projectile = new GameObject();
            projectile.transform.position = this.transform.position;
            projectile.AddComponent<SpriteRenderer>().sprite = this.sprites[Random.Range(0, this.sprites.length)];
            projectile.AddComponent<Rigidbody2D>().gravityScale = this.gravity;
            projectile.GetComponent<Rigidbody2D>().velocity = this.initialVelocity * this.speed;

            // Destroy the projectile after a certain amount of time
            GameObject.Destroy(projectile, 10);
        }
    }
    public receiptItemPrefab: GameObject;
    public canvas: Canvas;

    private receiptItemsPool: GameObject[] = [];

    Start() {
        // Initialize the object pool with 10 instances of the receipt item prefab
        for (let i = 0; i < 10; i++) {
            const obj = Object.Instantiate(this.receiptItemPrefab) as GameObject;
            const receiptItem = Object.Instantiate(this.receiptItemPrefab, new Vector3(0, 0, 0), Quaternion.identity, this.canvas.transform) as GameObject;
            receiptItem.SetActive(false);
            this.receiptItemsPool.push(receiptItem);
        }
    }

    public ShowReceiptItem(position: Vector3, sprite: Sprite) {
        let receiptItem: GameObject = null;

        // Check if there's a deactivated receipt item in the pool
        for (const item of this.receiptItemsPool) {
            if (!item.activeSelf) {
                receiptItem = item;
                break;
            }
        }

        // If there's no deactivated item, create a new one and add it to the pool
        if (!receiptItem) {
            receiptItem = Object.Instantiate(this.receiptItemPrefab, new Vector3(0, 0, 0), Quaternion.identity, this.canvas.transform) as GameObject;
            receiptItem.SetActive(false);
            this.receiptItemsPool.push(receiptItem);
        }

        // Set the position and sprite of the receipt item and activate it
        receiptItem.transform.position = position;
        receiptItem.GetComponent<Image>().sprite = sprite;
        receiptItem.SetActive(true);
    }
}