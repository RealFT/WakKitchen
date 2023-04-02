import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import Card from './Card';
import CardPool from './CardPool';

export enum Grade {
    F = "F",
    D = "D",
    C = "C",
    B = "B",
    A = "A",
    S = "S",
    SS = "SS"
}

export default class Gacha extends ZepetoScriptBehaviour {
    private cardPool: CardPool;

    // 가챠 실행 메서드
    public executeGacha(): Card {
        // 무작위로 아이템을 선택
        const random = Math.random();
        let cumulativeProbability = 0;
        for (const card of this.cardPool.getCards()) {
            cumulativeProbability += card.getProbability();
            if (random <= cumulativeProbability) {
                return card;
            }
        }

        // 아이템을 선택하지 못한 경우
        return null;
    }

    public getProbabilityByGrade(grade: string): number {
        switch (grade) {
            case Grade.F:
                return 0.05;
            case Grade.D:
                return 0.1;
            case Grade.C:
                return 0.2;
            case Grade.B:
                return 0.3;
            case Grade.A:
                return 0.2;
            case Grade.S:
                return 0.04;
            case Grade.SS:
                return 0.01;
            default:
                return 0;
        }
    }
}