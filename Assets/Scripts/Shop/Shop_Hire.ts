import { Object, GameObject, Quaternion, RectTransform, Vector2, Sprite, Debug } from 'UnityEngine'
import { HorizontalLayoutGroup,Button } from "UnityEngine.UI";
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ProductRecord } from 'ZEPETO.Product';
import ItemManager from '../ItemManager';
import Mediator, { EventNames, IListener } from '../Notification/Mediator';

export default class Shop_Hire extends ZepetoScriptBehaviour implements IListener {

    public InitHireShop(){

        Mediator.GetInstance().RegisterListener(this);
    }
    private OnDestroy() {
        Mediator.GetInstance().UnregisterListener(this);
    }
    public OnNotify(sender: any, eventName: string, eventData: any): void {
        if (eventName == EventNames.CurrencyUpdatedEvent) {
            const product = ItemManager.GetInstance().GetProduct(eventData);
            if (product){
                const match = product.productId.split('_');
                //product.Name
            }
        }
    }
}