import { GameObject } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'


export class EventNames {
    public static CurrencyUpdatedEvent: string = "CurrencyUpdatedEvent";
    public static IngredientCountUpdated: string = "IngredientCountUpdated";
    public static PossessionMoneyUpdated: string = "PossessionMoneyUpdated";
}

export default class Mediator extends ZepetoScriptBehaviour {
    // singleton
    private static Instance: Mediator;
    public static GetInstance(): Mediator {

        if (!Mediator.Instance) {
            //Debug.LogError("Mediator");

            var _obj = GameObject.Find("Mediator");
            if (!_obj) {
                _obj = new GameObject("Mediator");
                _obj.AddComponent<Mediator>();
            }
            Mediator.Instance = _obj.GetComponent<Mediator>();
            GameObject.DontDestroyOnLoad(_obj);
        }
        return Mediator.Instance;
    }

    private listeners: IListener[] = [];

    Awake() {
        if (this != Mediator.GetInstance()) GameObject.Destroy(this.gameObject);
    }


    public RegisterListener(listener: IListener): void {
        this.listeners.push(listener);
    }

    public UnregisterListener(listener: IListener): void {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    public Notify(sender: any, eventName: string, eventData: any): void {
        this.listeners.forEach(listener => {
            listener.OnNotify(sender, eventName, eventData);
        });
    }

}