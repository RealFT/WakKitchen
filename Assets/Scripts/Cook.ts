import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Vector3, Debug } from "UnityEngine";
import { Button, Image, Text } from "UnityEngine.UI";
import OrderManager from './OrderManager';
import Receipt from './Receipt';

export default class CookSlot extends ZepetoScriptBehaviour {

    private orderInstance: OrderManager;
    public SurveButton: Button;

    // must be same index itemSlots and itemCountText
    public itemSlots: Button[];
    public itemCountText: Text[];
    private inventory: Map<number, number>; // index of Product, number of same products.
    private itemIndices: number[] = []; // order of the Products in your inventory.

    public plateImages: Image[];
    public plateIndex: number;
    public plateLimit: number;
    private platedProducts: number[] = []; // an array of the indexes for plated Products

    Start() {
        this.init();
    }

    init() {
        this.plateIndex = 0;
        this.plateLimit = this.plateImages.length;
        this.inventory = new Map<number, number>();
        this.InitPlate();

        for (var index: int = 0; index < this.itemSlots.length; index++) {
            this.SetIngredient(index);
        }

        this.SurveButton.onClick.AddListener(() => {
            this.Serve();
        });
        this.orderInstance = OrderManager.GetInstance();

        this.updateInventoryDisplay();
    }

    SetIngredient(index: int) {
        this.itemSlots[index].onClick.AddListener(() => {
            if (this.plateLimit > this.plateIndex) {
                // replace plate's sprite to this sprite
                this.plateImages[this.plateIndex].sprite = this.itemSlots[index].image.sprite;
                this.plateImages[this.plateIndex].enabled = true;
                this.plateIndex++;
                const product = this.orderInstance.getProduct(this.plateIndex);
                if(product != -1)
                    this.addItem(product);
                Debug.Log("itemSlots: " + this.orderInstance.getProduct(this.plateIndex));
            }
        });
    }

    private updateInventoryDisplay(): void {
        // Update the inventory count text for each item
        for (let i = 0; i < this.itemSlots.length; i++) {
            let countText = "";
            const itemIndex = this.itemIndices[i];
            if (this.inventory[itemIndex] == 0) {
                this.disableSlot(i);
            }
            else
                countText = this.inventory[itemIndex].toString();
            this.itemCountText[i].text = countText;
        }
    }

    public addItem(product: number, quantity: number = 1): void {
        // if already exist same product
        if (this.inventory.has(product)) {
            this.inventory.set(product, this.inventory.get(product) + quantity);
        } else {
            this.inventory.set(product, quantity);
            this.itemIndices.push(product);
        }
    }

    public removeItem(product: number, quantity: number = 1): void {
        if (this.inventory.has(product)) {
            const currentQuantity = this.inventory.get(product);
            if (currentQuantity >= quantity) {
                this.inventory.set(product, currentQuantity - quantity);
            } else {
                Debug.Log(`Not enough ${product} in inventory`);
            }
        } else {
            Debug.Log(`${product} not found in inventory`);
        }
    }

    public removeAllItems(): void {
        this.inventory.clear();
        this.itemIndices = [];
    }

    public getQuantity(product: number): number {
        if (this.inventory.has(product)) {
            return this.inventory.get(product);
        } else {
            return 0;
        }
    }

    Serve() {
        /**/
        this.orderInstance.checkOrder(this.platedProducts);

        this.InitPlate();
    }

    InitPlate() {
        for (var images of this.plateImages) {
            images.enabled = false;
            Debug.Log(images.enabled);
        }
        this.plateIndex = 0;
    }

    disableSlot(index:number) {
        this.itemSlots[index].gameObject.SetActive(false);
    }
}