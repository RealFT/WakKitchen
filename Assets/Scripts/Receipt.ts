import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Sprite } from 'UnityEngine';

export default class Receipt extends ZepetoScriptBehaviour {

    private _ingredients: string[];
    private _drink: string;
    private _side: string;
    private _character: string;
    private _additionalOrder: string;

    public get ingredients(): string[] {
        return this._ingredients;
    }

    public get drink(): string {
        return this._drink;
    }

    public get side(): string {
        return this._side;
    }

    public get character(): string {
        return this._character;
    }

    public get additionalOrder(): string {
        return this._additionalOrder;
    }

    setReceipt(ingredients: string[], drink: string, side: string, character: string, additionalOrder: string){
        this._ingredients = ingredients;
        this._drink = drink;
        this._side = side;
        this._character = character;
        this._additionalOrder = additionalOrder;
    }
}