import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Vector3, Debug } from "UnityEngine";
import { Button, Image, Slider } from "UnityEngine.UI";
import OrderManager from './OrderManager';
import Receipt from './Receipt';

export default class CookSlot extends ZepetoScriptBehaviour {

    public ingredientSlots: Button[];

    public SurveButton: Button;
    public plateImages: Image[];
    public plateIndex: int;
    public plateLimit: int;
    private servedReceipt: Receipt;
    private orderInstance: OrderManager;

    Start() {
        this.init();
    }

    init() {
        this.plateIndex = 0;
        this.plateLimit = this.plateImages.length;
        this.InitPlate();

        for (var index: int = 0; index < this.ingredientSlots.length; index++) {
            this.SetIngredient(index);
        }

        this.SurveButton.onClick.AddListener(() => {
            this.Serve();
        });
        this.servedReceipt = new Receipt();
        this.orderInstance = OrderManager.GetInstance();
    }

    SetIngredient(index: int) {
        this.ingredientSlots[index].onClick.AddListener(() => {
            if (this.plateLimit > this.plateIndex) {
                
                this.plateImages[this.plateIndex].sprite = this.ingredientSlots[index].image.sprite;
                this.plateImages[this.plateIndex].enabled = true;
                this.plateIndex++;
                this.orderInstance.getProduct(this.plateIndex);
            }
        });
    }

    Serve() {
        /**/
        this.orderInstance.checkOrder(this.servedReceipt);

        this.InitPlate();
    }


    InitPlate() {
        for (var images of this.plateImages) {
            images.enabled = false;
            Debug.Log(images.enabled);
        }
        this.plateIndex = 0;
    }
}