import { SceneManager } from 'UnityEngine.SceneManagement';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Vector2 } from "UnityEngine";
import { Button, InputField, Slider } from "UnityEngine.UI";
import { IBeginDragHandler, IEndDragHandler, IDragHandler } from "UnityEngine.EventSystems";
import { Image } from 'UnityEngine.UIElements';

// ���� �� �켱����
export const COOK_PRIORITY = {
    Bottom: 0,  // ���� ���� ��������(��)
    Middle: 1,  // �߰� ���
    Top: 2      // �������� ����ִ� ��
}

export default class Ingredient extends ZepetoScriptBehaviour {

    public type: int;
    public visible_height: float;   // �̹������� ��ĥ �� �������� ����

    Start() {
    }
}