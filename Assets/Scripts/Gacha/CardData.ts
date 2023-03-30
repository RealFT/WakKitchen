import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Sprite, Debug } from 'UnityEngine'
import { Image, Button, Slider } from "UnityEngine.UI";
import { Character } from '../DataManager';
export default class CardData extends ZepetoScriptBehaviour {
    private productId: string;
    private characterName: string;
    private grade: string;
    private dispenserProficiency: number;
    private frierProficiency: number;
    private grillProficiency: number;
    private sliceProficiency: number;
    private quantity: number;

    public SetCardData(productId: string, characterName: string, grade: string, 
        dispenserProficiency: number, frierProficiency: number, grillProficiency: number, sliceProficiency: number): void {
        this.productId = productId;
        this.characterName = characterName;
        this.grade = grade;
        this.dispenserProficiency = dispenserProficiency;
        this.frierProficiency = frierProficiency;
        this.grillProficiency = grillProficiency;
        this.sliceProficiency = sliceProficiency;
    }

    public GetCardId(): string {
        return this.productId;
    }

    public GetGrade(): string {
        return this.grade;
    }
}