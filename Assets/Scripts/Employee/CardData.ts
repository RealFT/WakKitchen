import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class CardData extends ZepetoScriptBehaviour {
    private productId: string;
    private characterIndex: number;
    private characterName: string;
    private grade: string;
    private dispenserProficiency: number;
    private frierProficiency: number;
    private grillProficiency: number;
    private sliceProficiency: number;
    private quantity: number;

    public SetCardData(productId: string, characterIndex: number, characterName: string, grade: string, 
        dispenserProficiency: number, frierProficiency: number, grillProficiency: number, sliceProficiency: number): void {
        this.productId = productId;
        this.characterIndex = characterIndex;
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