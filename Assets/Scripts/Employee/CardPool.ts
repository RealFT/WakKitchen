import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import Card from './Card';
export default class CardPool extends ZepetoScriptBehaviour {

    private cards: Card[];

    public addCard(card: Card): void {
        this.cards.push(card);
    }

    public getCards(): Card[] {
        return this.cards;
    }

    public clearCards(): void {
        this.cards = [];
    }
}