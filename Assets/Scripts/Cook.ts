import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Debug } from "UnityEngine";
import { Button, Image, Text } from "UnityEngine.UI";
import OrderManager from './OrderManager';
import Mediator, { EventNames, IListener } from './Notification/Mediator';
import DataManager, { Ingredient, Drink, Side } from './DataManager';
import { TextMeshProUGUI } from 'TMPro';
import SoundManager from './SoundManager';
import UIManager from './UIManager';

export default class CookSlot extends ZepetoScriptBehaviour implements IListener{

    @SerializeField() private serveButton: Button; // Button to try serving after plating is finished
    @SerializeField() private treshButton: Button; // Button to throwing away food in the trash

    // Inventory related variables
    // must be same index productSlots and productCountTexts
    @SerializeField() private productSlots: Button[];  // Slots for stored items
    //@SerializeField() private productCountTexts: Text[] = [];
    @SerializeField() private productCountTexts: TextMeshProUGUI[] = [];
    private productCounts: number[] = [];   // number of products stored in the inventory.
    private products: number[] = []; // list of products stored in the inventory.

    // Plate related variables
    @SerializeField() private plateSideImage: Image;   // Side image to be served on a plate
    @SerializeField() private plateDrinkImage: Image;  // Drink Image to be served on a plate
    @SerializeField() private plateImages: Image[];
    private plateIndex: number;
    private plateLimit: number;
    private platedProducts: number[] = []; // an array of the indexes for plated Products

    Start() {
        this.init();
        Mediator.GetInstance().RegisterListener(this);
    }
    private OnDestroy() {
        Mediator.GetInstance().UnregisterListener(this);
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
            SoundManager.GetInstance().OnPlaySFX("Tresh");
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
            // If the product is Burger ingredient
            if (this.products[index] <= Ingredient.END && this.plateLimit > this.plateIndex) {
                // replace plate's sprite to this sprite
                this.plateImages[this.plateIndex].sprite = this.productSlots[index].image.sprite;
                this.plateImages[this.plateIndex].enabled = true;
                this.plateIndex++;
            }
            // If the product is Drink
            else if (this.products[index] >= Drink.START &&
                this.products[index] <= Drink.END && this.plateDrinkImage.enabled != true){
                this.plateDrinkImage.sprite = this.productSlots[index].image.sprite;
                this.plateDrinkImage.enabled = true;
            }
            // If the product is Side
            else if (this.products[index] >= Side.START &&
                this.products[index] <= Side.END && this.plateSideImage.enabled != true) {
                this.plateSideImage.sprite = this.productSlots[index].image.sprite;
                this.plateSideImage.enabled = true;
            }
            else return;
            this.platedProducts.push(this.products[index]);
            this.ReduceProductCount(index);
            //this.UpdateProductDisplay();
            SoundManager.GetInstance().OnPlaySFX(SoundManager.GetInstance().keyBtnSelect);
        });
    }

    // Set the display of the product inventory when enabled
    private GetProductsData(): void {
        // Gets the list of items stored in the inventory.
        this.products = OrderManager.GetInstance().GetProductsFromInventory();
        if (!this.products) return;
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
                this.productSlots[i].image.sprite = DataManager.GetInstance().getProductSprite(product);
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
            SoundManager.GetInstance().OnPlaySFX("Selling_Items");
        }
        else {
            UIManager.GetInstance().OpenInformation("Invalid recipe.");
            SoundManager.GetInstance().OnPlaySFX("Tresh");
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
        // disable plate images
        this.plateSideImage.enabled = false;
        this.plateDrinkImage.enabled = false;
        for (var images of this.plateImages) {
            images.enabled = false;
        }
        // init plate Index
        this.plateIndex = 0;
        // init plated Products
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

    private OnEnable() {
        this.GetProductsData();
        this.UpdateProductDisplay();
    }

    public OnNotify(sender: any, eventName: string, eventData: any): void {
        if (eventName == EventNames.IngredientCountUpdated) {
            this.GetProductsData();
            this.UpdateProductDisplay();
        }
        if (eventName == EventNames.StageEnded) {
            this.Reset();
        }
    }
    
    Reset() {
        this.InitPlate();
        this.GetProductsData();
        this.UpdateProductDisplay();
    }
}