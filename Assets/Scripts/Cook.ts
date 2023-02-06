import { SceneManager } from 'UnityEngine.SceneManagement';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Vector3, Debug } from "UnityEngine";
import { Button, Image, Slider } from "UnityEngine.UI";

export default class CookSlot extends ZepetoScriptBehaviour {

    public ingredientSlots: Button[];   // 재료 슬롯 버튼들

    public plate: Button;   // 접시
    public plateImages: Button[];   // 접시 속 이미지들(오류로 인해 버튼 속 이미지 활용)
    public plateIndex: int; // 접시에 쌓인 재료 인덱스
    public plateLimit: int; // 접시에 최대로 쌓을 수 있는 재료 수


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

    // 재료를 접시에 담는다.
    SetIngredient(index: int) {

        // 재료가 초과되지 않았을 경우
        if (this.plateLimit > this.plateIndex) {

            // 접시 이미지를 선택한 이미지로 교체한다.
            //this.plateImages[this.plateIndex].image.sprite = this.ingredientSlots[index].image.sprite;
            // 접시 이미지 활성화
            this.plateImages[this.plateIndex].image.enabled = true;
            Debug.Log(this.plateImages[this.plateIndex].image.enabled);
            this.plateIndex++;
        }
    }

    // 요리를 내 간다.
    Serve() {
        /* 적합한 요리가 있는지 확인 후 서빙 */

        this.InitPlate();
    }

    // 접시 초기화
    InitPlate() {
        // 기존 이미지 초기화
        for (var images of this.plateImages) {
            // 이미지 비활성화
            images.image.enabled = false;
            Debug.Log(images.image.enabled);
        }
        // 접시에 쌓인 재료 인덱스 초기화
        this.plateIndex = 0;
    }
}