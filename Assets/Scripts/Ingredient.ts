import { SceneManager } from 'UnityEngine.SceneManagement';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Vector2 } from "UnityEngine";
import { Button, InputField, Slider } from "UnityEngine.UI";
import { IBeginDragHandler, IEndDragHandler, IDragHandler } from "UnityEngine.EventSystems";
import { Image } from 'UnityEngine.UIElements';

// 조리 시 우선순위
export const COOK_PRIORITY = {
    Bottom: 0,  // 제일 먼저 깔아줘야함(번)
    Middle: 1,  // 중간 재료
    Top: 2      // 마지막에 깔아주는 번
}

export default class Ingredient extends ZepetoScriptBehaviour {

    public type: int;
    public visible_height: float;   // 이미지에서 겹칠 때 보여지는 높이

    Start() {
    }
}