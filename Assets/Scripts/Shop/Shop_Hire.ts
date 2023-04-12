import { GameObject } from 'UnityEngine'
import { Button } from "UnityEngine.UI";
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ProductRecord } from 'ZEPETO.Product';
import ItemManager from '../ItemManager';
import Card from '../Employee/Card';
import DataManager from '../DataManager';
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {Room, RoomData} from "ZEPETO.Multiplay";
import CardData from '../Employee/CardData';

interface GradeRange {
    grade: string;
    min: number;
    max: number;
}

export default class Shop_Hire extends ZepetoScriptBehaviour{

    @SerializeField() private buyButton: Button;
    @SerializeField() private resultPanel: GameObject;
    @SerializeField() private cardLayout: GameObject;
    @SerializeField() private cards: Card[];

    private gradeRanges: GradeRange[] = [
        { grade: "s", min: 0, max: 1.9 },
        { grade: "a", min: 1.9, max: 6.7 },
        { grade: "b", min: 6.7, max: 30.3 },
        { grade: "c", min: 30.3, max: 60.8 },
        { grade: "d", min: 60.8, max: 100 }
    ];

    public InitHireShop(){

    }

    Start(){
        this.cards = this.cardLayout.GetComponentsInChildren<Card>();
        console.log(this.cards[0].name);
        this.buyButton.onClick.AddListener(() => {
            this.OnBuyButtonClick();
        });

    }

    private GetRandomCard(): CardData | undefined {
        // get random value 0~100
        const randomValue = Math.random() * 100;

        // 랜덤 값이 속한 등급을 찾음
        let cardGrade = "d"; // D 등급으로 초기화
        for (const range of this.gradeRanges) {
            if (randomValue >= range.min && randomValue < range.max) {
                cardGrade = range.grade;
                break;
            }
        }

        // 등급에 맞는 랜덤 카드 선택
        const cardData = DataManager.GetInstance().GetRandomCardByGrade(cardGrade);
        if (cardData) {
            return cardData;
        } else {
            console.log("GetRandomCard: undefined");
            return undefined;
        }
    }

    private OnBuyButtonClick() {
        console.log("OnBuyButtonClick");
        // cards.length 만큼의 카드를 구매
        const purchasedCards = [];
        for (let i = 0; i < this.cards.length; i++) {
          const cardData = this.GetRandomCard();
          if (cardData) {
            purchasedCards.push(cardData);
          }
        }
        console.log(purchasedCards.length);
        if (purchasedCards.length > 0) {
            this.resultPanel.SetActive(true);
            for (let i = 0; i < purchasedCards.length; i++) {
                const cardData = purchasedCards[i];
                const cardId = cardData.GetCardId();
                this.SetResultCard(this.cards[i], cardId);
            }
        }
    }

    private SetResultCard(card: Card, cardId: string){
        const match = cardId.split('_');
        const characterName = match[1];
        const grade = match[2];
        card.SetCard(cardId, grade, DataManager.GetInstance().GetCharacterSpriteByName(characterName));
    }
}