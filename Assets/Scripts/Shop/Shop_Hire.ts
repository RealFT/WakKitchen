import { Object, GameObject, Quaternion, RectTransform, Vector2, Sprite, Debug, Random } from 'UnityEngine'
import { HorizontalLayoutGroup,Button } from "UnityEngine.UI";
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ProductRecord } from 'ZEPETO.Product';
import ItemManager from '../ItemManager';
import Card from '../Gacha/Card';
import DataManager from '../DataManager';

export default class Shop_Hire extends ZepetoScriptBehaviour{

    @SerializeField() private buyButton: Button;
    @SerializeField() private resultPanel: GameObject;
    @SerializeField() private cardObj: GameObject;
    @SerializeField() private card: Card;

    Start() {
        this.card = this.cardObj.GetComponent<Card>();
        this.buyButton.onClick.AddListener(()=>{
            this.PurchaceRandomCard();
        });
    }

    public InitHireShop(){

    }

    private PurchaceRandomCard(){
        var cardId = ItemManager.GetInstance().GetRandomCardId();
        if (!cardId) return; 
        console.log(cardId);
        var cardProduct = ItemManager.GetInstance().GetProduct(cardId);
        //ItemManager.GetInstance().PurchaseItem(cardId);

        // cardProductId: card_character_grade
        this.ShowPurchaseResult(cardId);
    }

    private ShowPurchaseResult(cardId: string) {
        const match = cardId.split('_');
        const characterName = match[1];
        const grade = match[2];
        this.card.SetCard(cardId, grade, DataManager.GetInstance().GetCharacterSpriteByName(characterName));
        this.resultPanel.SetActive(true);
    }

}