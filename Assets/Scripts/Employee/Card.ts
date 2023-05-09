import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Sprite, Debug, Animator } from 'UnityEngine'
import { Image, Button, Slider } from "UnityEngine.UI";
import DataManager from '../DataManager';
export default class Card extends ZepetoScriptBehaviour {
    private cardId: string;
    private grade: string;

    @SerializeField() private debug_id: string;
    @SerializeField() private characterImage: Image;
    @SerializeField() private cardBackgroundImage: Image;
    @SerializeField() private cardFrameImage: Image;
    @SerializeField() private cardOpenButton: Button;
    @SerializeField() private animator: Animator;

    private Start(){
        this.cardOpenButton.onClick.AddListener(()=>{
            //this.animator.Play(0);
        });
    }

    public SetCard(cardId: string, grade: string, characterSprite: Sprite): void {
        this.debug_id = cardId;
        this.cardId = cardId;
        this.grade = grade;
        this.characterImage.sprite = characterSprite;
        this.cardBackgroundImage.sprite = DataManager.GetInstance().GetCardBackgroundSpriteByGrade(grade);
        this.cardFrameImage.sprite = DataManager.GetInstance().GetCardFrameByGrade(grade);
    }

    public GetCardId(): string {
        return this.cardId;
    }

    public GetGrade(): string {
        return this.grade;
    }
}