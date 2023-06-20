import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Rect, RectTransform, Screen, GameObject } from "UnityEngine";

export default class SafeAreaForNotch extends ZepetoScriptBehaviour {
  @SerializeField() private safeAreaObject: GameObject;

  Start() {
    // SafeArea Settings
    let safeArea: Rect = Screen.safeArea;
    let newAnchorMin = safeArea.position;
    let newAnchorMax = safeArea.position + safeArea.size;
    newAnchorMin.x /= Screen.width;
    newAnchorMax.x /= Screen.width;
    newAnchorMin.y /= Screen.height;
    newAnchorMax.y /= Screen.height;

    let rect = this.safeAreaObject.GetComponent<RectTransform>();
    rect.anchorMin = newAnchorMin;
    rect.anchorMax = newAnchorMax;

    // const rectTransform: RectTransform = this.GetComponent<RectTransform>();
    // const safeArea: Rect = Screen.safeArea;
    // let newAnchorMin = safeArea.position;
    // let newAnchorMax = safeArea.position + safeArea.size;

    // newAnchorMin.x /= Screen.width;
    // newAnchorMax.x /= Screen.width;
    // newAnchorMin.y /= Screen.height;
    // newAnchorMax.y /= Screen.height;

    // rectTransform.anchorMin = newAnchorMin;
    // rectTransform.anchorMax = newAnchorMax;
  }
}