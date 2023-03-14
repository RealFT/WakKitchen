import { GameObject } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';

export default class Shop_Category extends ZepetoScriptBehaviour {
    @SerializeField() categoryBtns: Button[];
    @SerializeField() panels: GameObject[];

    Start() {
        for (let i = 0; i < this.categoryBtns.length; i++) {
            const categoryBtn = this.categoryBtns[i];
            const categoryPanel = this.panels[i];

            categoryBtn.onClick.AddListener(() => {
                for (let j = 0; j < this.categoryBtns.length; j++) {
                    const btn = this.categoryBtns[j];
                    const panel = this.panels[j];

                    panel.SetActive(categoryPanel === panel);
                    btn.interactable = (categoryBtn != btn);
                }
            });
        }
    }
}