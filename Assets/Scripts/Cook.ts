import { SceneManager } from 'UnityEngine.SceneManagement';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Vector3, Debug } from "UnityEngine";
import { Button, Image, Slider } from "UnityEngine.UI";

export default class CookSlot extends ZepetoScriptBehaviour {

    public ingredientSlots: Button[];   // ��� ���� ��ư��

    public plate: Button;   // ����
    public plateImages: Image[];   // ���� �� �̹�����(������ ���� ��ư �� �̹��� Ȱ��)
    public plateIndex: int; // ���ÿ� ���� ��� �ε���
    public plateLimit: int; // ���ÿ� �ִ�� ���� �� �ִ� ��� ��

    Start() {
        this.plateIndex = 0;
        this.plateLimit = this.plateImages.length;
        this.InitPlate();

        for (var index: int = 0; index < this.ingredientSlots.length; index++) {
            this.SetIngredient(index);
        }

        this.plate.onClick.AddListener(() => {
            this.Serve();
        });
    }

    // ��Ḧ ���ÿ� ��´�.
    SetIngredient(index: int) {
        // ��� ��ư�� ������ �߰�
        this.ingredientSlots[index].onClick.AddListener(() => {
        // ��ᰡ �ʰ����� �ʾ��� ���
            if (this.plateLimit > this.plateIndex) {
            
            Debug.Log(this.ingredientSlots[index].image.sprite);
            // ���� �̹����� ������ �̹����� ��ü�Ѵ�.
            this.plateImages[this.plateIndex].sprite = this.ingredientSlots[index].image.sprite;
            // ���� �̹��� Ȱ��ȭ
            this.plateImages[this.plateIndex].enabled = true;
            Debug.Log(this.plateImages[this.plateIndex].enabled);
            this.plateIndex++;
            }
        });
        Debug.Log("SetIngredient: " + index);
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
            images.enabled = false;
            Debug.Log(images.enabled);
        }
        // ���ÿ� ���� ��� �ε��� �ʱ�ȭ
        this.plateIndex = 0;
    }
}