import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Debug } from "UnityEngine";
import { Button, Image, Text } from "UnityEngine.UI";
import OrderManager from './OrderManager';

export default class CookSlot extends ZepetoScriptBehaviour {

    private orderManager: OrderManager;
    public serveButton: Button;

    // Inventory related variables
    // must be same index productButtons and productCountTexts
    public productButtons: Button[];
    public productCountTexts: Text[];
    private productInventory: Map<number, number>; // number of items in inventory indexed by product id
    private productOrder: number[] = []; // product ids in the order they were added to inventory

    // Plate related variables
    public plateImages: Image[];
    public plateIndex: number;
    public plateLimit: number;
    private platedProducts: number[] = []; // an array of the indexes for plated Products

    Start() {
        this.init();
    }

    init() {
        // Initialize variables
        this.plateIndex = 0;
        this.plateLimit = this.plateImages.length;
        this.productInventory = new Map<number, number>();
        this.InitPlate();

        // Initialize product slots
        for (var index: int = 0; index < this.productButtons.length; index++) {
            this.setupProductButton(index);
        }

        // Initialize button listeners
        this.serveButton.onClick.AddListener(() => {
            this.Serve();
        });
        this.orderManager = OrderManager.GetInstance();

        // Update inventory display
        this.updateInventoryDisplay();
    }

    // Initialize product slot
    private setupProductButton(index: int) {
        this.productButtons[index].onClick.AddListener(() => {
            if (this.plateLimit > this.plateIndex) {
                // Add the clicked product to the plate and inventory                
                this.plateImages[this.plateIndex].sprite = this.productButtons[index].image.sprite;  // replace plate's sprite to this sprite
                this.plateImages[this.plateIndex].enabled = true;
                this.plateIndex++;

                // Add the product to the inventory
                const product = this.orderManager.getProduct(this.plateIndex);
                if (product != -1)
                    this.platedProducts.push(product);
                Debug.Log("productButtons: " + product);
            }
        });
    }

    // Update the display of the product inventory
    private updateInventoryDisplay(): void {
        // Update the productInventory count text for each item
        for (let i = 0; i < this.productOrder.length; i++) {
            let countText = "";
            const ingredientIndex = this.productOrder[i];
            // If the inventory has no more of the current product, disable the corresponding button
            if (this.productInventory[ingredientIndex] == 0) {
                this.setSlot(i, false);
            }
            else{
                countText = this.productInventory[ingredientIndex].toString();
                this.productCountTexts[i].text = countText;
                this.setSlot(i, true);
            }
        }
    }
    
    // Add item to inventory
    public addItemToInventory(product: number, quantity: number = 1): void {
        // if already exist same product
        if (this.productInventory.has(product)) {
            this.productInventory.set(product, this.productInventory.get(product) + quantity);
        } else {
            this.productInventory.set(product, quantity);
            this.productOrder.push(product);
        }
    }

    // Remove item from inventory
    public removeItemFromInventory(product: number, quantity: number = 1): void {
        if (this.productInventory.has(product)) {
            const currentQuantity = this.productInventory.get(product);
            if (currentQuantity >= quantity) {
                this.productInventory.set(product, currentQuantity - quantity);
                // if product doesn't have any quantity
                if (this.productInventory.get(product) === 0) {
                    // delete product from productInventory
                    this.productInventory.delete(product);
                    const index = this.productOrder.indexOf(product);
                    // delete product index from productOrder
                    if (index > -1) {
                        this.productOrder.splice(index, 1);
                    }
                }
            } else {
                Debug.Log(`Not enough ${product} in productInventory`);
            }
        } else {
            Debug.Log(`${product} not found in productInventory`);
        }
    }

    // Remove all items from inventory
    public removeAllItemsFromInventory(): void {
        this.productInventory.clear();
        this.productOrder = [];
    }

    public getQuantityFromInventory(product: number): number {
        if (this.productInventory.has(product)) {
            return this.productInventory.get(product);
        } else {
            return 0;
        }
    }

    Serve() {
        /**/
        this.orderManager.checkOrder(this.platedProducts);

        this.InitPlate();
    }

    InitPlate() {
        for (var images of this.plateImages) {
            images.enabled = false;
        }
        this.plateIndex = 0;
    }

    setSlot(index: number, value: boolean) {
        this.productButtons[index].image.enabled = value;
    }
}