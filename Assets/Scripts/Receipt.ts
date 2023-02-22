import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Sprite } from 'UnityEngine';

export default class Receipt extends ZepetoScriptBehaviour {

    private _id: number;
    private _pay: number;
    private _drink: number;
    private _side: number;
    private _character: number;
    private _additionalOrder: string;
    private _ingredients: number[];

    public get id(): number {
        return this._id;
    }

    public get pay(): number {
        return this._pay;
    }

    public get drink(): number {
        return this._drink;
    }

    public get side(): number {
        return this._side;
    }

    public get character(): number {
        return this._character;
    }

    public get additionalOrder(): string {
        return this._additionalOrder;
    }

    public get ingredients(): number[] {
        return this._ingredients;
    }

    setReceipt(id: number, pay: number, drink: number, side: number, character: number, additionalOrder: string, ingredients: number[]){
        this._id = id;
        this._pay = pay;
        this._ingredients = ingredients;
        this._drink = drink;
        this._side = side;
        this._character = character;
        this._additionalOrder = additionalOrder;
    }

    compareReceipt(drink: number, side: number, ingredients: number[]) {
        // Compare if material order and number are the same
        if(this.ingredients.length != ingredients.length) return false;
        for (let i = 0; i < this.ingredients.length; i++) {
            if (this.ingredients[i] != ingredients[i])
                return false;
        }
        // Compare drink, side
        return (this._drink == drink &&
            this._side == side) ? true : false;
    }
}