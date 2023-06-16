import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Rect, Vector2, RectTransform, Screen } from "UnityEngine";

export class SafeArea extends ZepetoScriptBehaviour {
  Awake() {
    const rectTransform: RectTransform = this.GetComponent<RectTransform>();
    const safeArea: Rect = Screen.safeArea;
    const minAnchor: Vector2 = safeArea.position;
    const maxAnchor: Vector2 = new Vector2(minAnchor.x + safeArea.size.x, minAnchor.y + safeArea.size.y);

    minAnchor.x /= Screen.width;
    minAnchor.y /= Screen.height;
    maxAnchor.x /= Screen.width;
    maxAnchor.y /= Screen.height;

    rectTransform.anchorMin = minAnchor;
    rectTransform.anchorMax = maxAnchor;
  }
}