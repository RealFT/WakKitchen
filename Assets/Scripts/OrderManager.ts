import { SceneManager } from 'UnityEngine.SceneManagement';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, InputField, Slider } from "UnityEngine.UI";
import { GameObject, Random, WaitForSeconds } from 'UnityEngine';

export default class OrderManager extends ZepetoScriptBehaviour {

    public orders: GameObject[];
    public customers: GameObject[];
    private newOrderNumber: int;
    private maxOrderNumber: int;

    Start() {
        this.newOrderNumber = 1;
        // 주문 가능한 개수만큼 비활성화
        for (let idx = 0; idx < this.orders.length; idx++) {
            this.DeActivateOrder(idx);
        }
        this.StartCoroutine(this.DoOrder());
        //this.ActivateOrder(0);
    }

    Update() {
    }

    *DoOrder() {
        while (true) {
            yield new WaitForSeconds(1.0);
            this.DeActivateOrder(0);
            yield new WaitForSeconds(1.0);
            this.ActivateOrder(0);
        }
    }

    // 해당 인덱스 주문 활성화
    ActivateOrder(index: int) {
        this.orders[index].gameObject.SetActive(true);
        this.customers[index].gameObject.SetActive(true);
    }

    // 해당 인덱스 주문 비활성화
    DeActivateOrder(index: int) {
        this.orders[index].SetActive(false);
        this.customers[index].SetActive(false);
    }
}