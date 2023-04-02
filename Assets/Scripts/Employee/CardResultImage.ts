import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Sprite, Debug } from 'UnityEngine'
import { Image, Button, Slider } from "UnityEngine.UI";

export default class CardResultImage extends ZepetoScriptBehaviour {
    private productId: string;
    private grade: string;

    @SerializeField() private characterImage: Image;

    public SetCardResult(productId: string, grade: string, characterSprite: Sprite): void {
        this.productId = productId;
        this.grade = grade;
        this.characterImage.sprite = characterSprite;
    }
}