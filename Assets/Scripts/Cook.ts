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
    }

    SetIngredient(index: int) {

        this.ingredientSlots[index].onClick.AddListener(() => {

            if (this.plateLimit > this.plateIndex) {

                Debug.Log(this.ingredientSlots[index].image.sprite);

                this.plateImages[this.plateIndex].sprite = this.ingredientSlots[index].image.sprite;

                this.plateImages[this.plateIndex].enabled = true;
                Debug.Log(this.plateImages[this.plateIndex].enabled);
                this.plateIndex++;
            }
        });
        Debug.Log("SetIngredient: " + index);
    }

    Serve() {
        /**/

        OrderManager.GetInstance().checkOrder(this.servedReceipt);

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