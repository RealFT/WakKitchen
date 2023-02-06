import { SceneManager } from 'UnityEngine.SceneManagement';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Vector3, Debug } from "UnityEngine";
import { Button, Image, Slider } from "UnityEngine.UI";

export default class CookSlot extends ZepetoScriptBehaviour {

    public ingredientSlots: Button[];   // ��� ���� ��ư��

    public plate: Button;   // ����
    public plateImages: Button[];   // ���� �� �̹�����(������ ���� ��ư �� �̹��� Ȱ��)
    public plateIndex: int; // ���ÿ� ���� ��� �ε���
    public plateLimit: int; // ���ÿ� �ִ�� ���� �� �ִ� ��� ��


    Start() {
        this.plateIndex = 0;
        this.plateLimit = this.plateImages.length;
        this.InitPlate();

        var index: int = 0;
        for (var slot of this.ingredientSlots) {
            slot.onClick.AddListener(() => {
                this.SetIngredient(index);
            });
            Debug.Log(index);
            index++;
        }

        this.plate.onClick.AddListener(() => {
            this.Serve();
        });
    }

    // ��Ḧ ���ÿ� ��´�.
    SetIngredient(index: int) {

        // ��ᰡ �ʰ����� �ʾ��� ���
        if (this.plateLimit > this.plateIndex) {

            // ���� �̹����� ������ �̹����� ��ü�Ѵ�.
            //this.plateImages[this.plateIndex].image.sprite = this.ingredientSlots[index].image.sprite;
            // ���� �̹��� Ȱ��ȭ
            this.plateImages[this.plateIndex].image.enabled = true;
            Debug.Log(this.plateImages[this.plateIndex].image.enabled);
            this.plateIndex++;
        }
    }

    // �丮�� �� ����.
    Serve() {
        /* ������ �丮�� �ִ��� Ȯ�� �� ���� */

        this.InitPlate();
    }

    // ���� �ʱ�ȭ
    InitPlate() {
        // ���� �̹��� �ʱ�ȭ
        for (var images of this.plateImages) {
            // �̹��� ��Ȱ��ȭ
            images.image.enabled = false;
            Debug.Log(images.image.enabled);
        }
        // ���ÿ� ���� ��� �ε��� �ʱ�ȭ
        this.plateIndex = 0;
    }
}