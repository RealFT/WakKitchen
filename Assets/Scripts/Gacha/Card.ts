import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class Card extends ZepetoScriptBehaviour {
    private cardName: string;
    private grade: string;
    private probability: number;

    setCard(cardName: string, grade: string, probability: number) {
        this.cardName = cardName;
        this.grade = grade;
        this.probability = probability;
    }

    public getCardName(): string {
        return this.cardName;
    }

    public getGrade(): string {
        return this.grade;
    }

    public getProbability(): number {
        return this.probability;
    }
}