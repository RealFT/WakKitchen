import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Rect, RectTransform, Screen } from "UnityEngine";

export class SafeArea extends ZepetoScriptBehaviour {
  Awake() {
    const rectTransform: RectTransform = this.GetComponent<RectTransform>();
    const safeArea: Rect = Screen.safeArea;
    let newAnchorMin = safeArea.position;
    let newAnchorMax = safeArea.position + safeArea.size;

    newAnchorMin.x /= Screen.width;
    newAnchorMax.x /= Screen.width;
    newAnchorMin.y /= Screen.height;
    newAnchorMax.y /= Screen.height;

    rectTransform.anchorMin = newAnchorMin;
    rectTransform.anchorMax = newAnchorMax;
  }
}