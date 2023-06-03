import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Image, Text, Button } from 'UnityEngine.UI';
import { GameObject, Sprite } from 'UnityEngine';
import GameManager from './GameManager';

export default class ExpandOrderReceipt extends ZepetoScriptBehaviour {

    @SerializeField() private panel: GameObject;
    @SerializeField() private closePanelButton: Button;

    //private ingredientImages: Image[];
    @SerializeField() private burgerImages: Image[];
    @SerializeField() private drinkImage: Image;
    @SerializeField() private sideImage: Image;
    @SerializeField() private langDialogueText: Text;
    @SerializeField() private priceText: Text;
    @SerializeField() private customerImage: Image;

    Start(){
        this.closePanelButton.onClick.AddListener(() => {
            this.setPanel(false);
        });
    }

    // OnDisable(){
    //     GameManager.GetInstance().ResumeStage();
    // }

    public SetOrderReceipt(burgerSprites: Sprite[], drinkSprite: Sprite, 
        sideSprite: Sprite, langDialogue: string, pay: string, customerSprite: Sprite): void {
            
        this.ClearOrderReceipt();
        for (let i = 0; i < burgerSprites.length; i++) {
            this.burgerImages[i].sprite = burgerSprites[i];
            this.burgerImages[i].enabled = true;
        }

        if(drinkSprite) this.EnableImage(this.drinkImage, drinkSprite);
        if(sideSprite) this.EnableImage(this.sideImage, sideSprite);
        if(customerSprite) this.EnableImage(this.customerImage, customerSprite);
        this.customerImage.SetNativeSize();
        if(this.langDialogueText) this.langDialogueText.text = langDialogue;
        if(this.priceText) this.priceText.text = pay;
    }

    private ClearOrderReceipt(){
        for (let i = 0; i < this.burgerImages.length; i++) {
            this.burgerImages[i].enabled = false;
        }
        this.drinkImage.enabled = false;
        this.sideImage.enabled = false;
        this.langDialogueText.text = "";
        this.priceText.text = "";
        this.customerImage.enabled = false;
    }

    private EnableImage(image:Image, sprite: Sprite){
        image.sprite = sprite;
        image.enabled = true;
    }

    public setPanel(value: boolean) {
        this.panel.SetActive(value);
    }
}