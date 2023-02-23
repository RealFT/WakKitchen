import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { GameObject, Vector2 } from 'UnityEngine';
import { Scrollbar } from 'UnityEngine.UI';

export default class Customer extends ZepetoScriptBehaviour {
  private scrollbar: GameObject;
  private selectButton: GameObject;
  private scroll_pos = 0;
  private selectedBtn = false;
  private pos: number[];
  private scroll: Scrollbar;

  Start() {
    //this.scrollbar = this.gameObject.Find('Scrollbar');
    //this.selectButton = this.gameObject.Find('SelectButton');
    //this.scroll = this.scrollbar.GetComponent(Scrollbar);

    this.pos = new Array(this.transform.childCount);
    const distance = 1 / (this.pos.length - 1);
    for (let i = 0; i < this.pos.length; i++) {
      this.pos[i] = distance * i;
    }
  }

//   Update() {
//     const distance = 1 / (this.pos.length - 1);

//     if (Input.GetMouseButton(0)) {
//       this.scroll_pos = this.scroll.value;
//     } else {
//       if (!this.selectedBtn) {
//         for (let i = 0; i < this.pos.length; i++) {
//           if (
//             this.scroll_pos < this.pos[i] + distance / 2 &&
//             this.scroll_pos > this.pos[i] - distance / 2
//           ) {
//             this.scroll.value = Mathf.Lerp(
//               this.scroll.value,
//               this.pos[i],
//               0.1
//             );
//           }
//         }
//       }
//     }

//     for (let i = 0; i < this.pos.length; i++) {
//       if (
//         this.scroll_pos < this.pos[i] + distance / 2 &&
//         this.scroll_pos > this.pos[i] - distance / 2
//       ) {
//         this.transform.GetChild(i).localScale = Vector2.Lerp(
//           this.transform.GetChild(i).localScale,
//           new Vector2(1, 1),
//           0.1
//         );

//         for (let j = 0; j < this.pos.length; j++) {
//           if (j !== i) {
//             this.transform.GetChild(j).localScale = Vector2.Lerp(
//               this.transform.GetChild(j).localScale,
//               new Vector2(0.8, 0.8),
//               0.1
//             );
//           }
//         }

//         this.selectButton.transform.GetChild(i).localScale = Vector2.Lerp(
//           this.selectButton.transform.GetChild(i).localScale,
//           new Vector2(1, 1),
//           0.1
//         );

//         for (let k = 0; k < this.selectButton.transform.childCount; k++) {
//           if (k !== i) {
//             this.selectButton.transform.GetChild(k).localScale = Vector2.Lerp(
//               this.selectButton.transform.GetChild(k).localScale,
//               new Vector2(0.7, 0.7),
//               0.1
//             );
//           }
//         }
//       }
//     }
//   }

//   public ContentsPosition(): void {
//     const distance = 1 / (this.pos.length - 1);
//     const selectedValue = parseInt(
//       EventSystems.EventSystem.current.currentSelectedGameObject.transform.GetComponentInChildren<Text>().text
//     );
//     StartCoroutine(this.selectBtn(selectedValue - 1, distance));
//   }

//   function* selectBtn(targetValue) {
//     selectedBtn = true;
//     while (true) {
//         yield null;
//         scroll.value = Mathf.Lerp(scroll.value, targetValue, 0.1);
//         if (Mathf.Abs(scroll.value - targetValue) <= 0.1) {
//             scroll_pos = scroll.value;
//             selectedBtn = false;
//             break;
//         }
//     }
}