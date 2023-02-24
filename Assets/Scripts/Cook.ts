import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Debug } from "UnityEngine";
import { Button, Image, Text } from "UnityEngine.UI";
import OrderManager from './OrderManager';
import { Ingredient } from './OrderManager';

export default class CookSlot extends ZepetoScriptBehaviour {

    public serveButton: Button; // Button to try serving after plating is finished
    public treshButton: Button; // Button to throwing away food in the trash

    // Inventory related variables
    // must be same index productSlots and productCountTexts
    public productSlots: Button[];  // Slots for stored items
    public productCountTexts: Text[];
    public productCounts: number[];   // number of products stored in the inventory.
    private products: number[] = []; // list of products stored in the inventory.

    // Plate related variables
    public plateImages: Image[];
    public plateIndex: number;
    public plateLimit: number;
    private platedProducts: number[] = []; // an array of the indexes for plated Products

    Start() {
        this.init();
    }

    private OnEnable() {
        this.GetProductsData();
        this.UpdateProductDisplay();
    }

    private OnDisable() {
    }

    init() {
        // Initialize variables
        this.plateIndex = 0;
        this.plateLimit = this.plateImages.length;
        this.InitPlate();

        // Initialize button listeners
        this.serveButton.onClick.AddListener(() => {
            this.Serve();
        });
        this.treshButton.onClick.AddListener(()=>{
            this.RemovePlatedProducts();
            this.GetProductsData();
            this.UpdateProductDisplay();
            this.InitPlate();
        });
        // Initialize product slots
        for (var index: int = 0; index < this.productSlots.length; index++) {
            this.SetupProductButton(index);
        }

        // Get Products Data
        this.GetProductsData();
        // Update Products display
        this.UpdateProductDisplay();
    }

    // Initialize product slot
    private SetupProductButton(index: number) {
        this.productSlots[index].onClick.AddListener(() => {
            if (this.productCounts[index] == 0) return;
            // Add the clicked product to the plate
            if (this.plateLimit > this.plateIndex) {
                this.platedProducts.push(this.products[index]);
                // replace plate's sprite to this sprite
                this.plateImages[this.plateIndex].sprite = this.productSlots[index].image.sprite;  
                this.plateImages[this.plateIndex].enabled = true;
                this.plateIndex++;
                this.ReduceProductCount(index);
            }
            //this.UpdateProductDisplay();
        });
    }

    // Set the display of the product inventory when enabled
    private GetProductsData(): void {
        // Gets the list of items stored in the inventory.
        this.products = OrderManager.GetInstance().GetProductsFromInventory();
        // Update the productSlots, Counts for each item
        for (let i = 0; i < this.products.length; i++) {
            // const product = this.products[i];
            this.productCounts[i] = OrderManager.GetInstance().GetQuantityFromInventory(this.products[i]);
        }
    }

    // Update the display of the product inventory
    private UpdateProductDisplay(): void {
        for (let i = 0; i < this.productSlots.length; i++) {
            if (i < this.products.length) {
                const product = this.products[i];
                this.productSlots[i].image.sprite = OrderManager.GetInstance().getProductSprite(product);
                this.productCountTexts[i].text = this.productCounts[i].toString();
                this.SetSlot(i, true);
            }
            // If the inventory has no more of the current product, disable the corresponding button
            else {
                this.SetSlot(i, false);
            }
        }
    }

    Serve() {
        // If the served food matches the order
        if(OrderManager.GetInstance().checkOrder(this.platedProducts)){
            this.RemovePlatedProducts();
        }
        this.GetProductsData();
        this.UpdateProductDisplay();
        this.InitPlate();
    }

    // Remove food
    private RemovePlatedProducts(){
        for(var product of this.platedProducts){
            OrderManager.GetInstance().RemoveItemFromInventory(product);
        }
    }

    InitPlate() {
        for (var images of this.plateImages) {
            images.enabled = false;
        }
        this.plateIndex = 0;
        this.platedProducts = [];
    }

    SetSlot(index: number, value: boolean) {
        this.productSlots[index].image.enabled = value;
        this.productCountTexts[index].enabled = value;
    }

    private ReduceProductCount(index:number):void{
        this.productCounts[index]--;
        this.productCountTexts[index].text = this.productCounts[index].toString();
        // if this product doesn't exist anymore
        if(this.productCounts[index] <= 0){
            this.SetSlot(index, false);
        }
    }
}