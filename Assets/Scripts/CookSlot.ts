import { SceneManager } from 'UnityEngine.SceneManagement';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, InputField, Slider } from "UnityEngine.UI";

export default class UIEvent extends ZepetoScriptBehaviour {

    public sceneName: string;

    public startBtn: Button;

    Start() {
        this.startBtn.onClick.AddListener(() => {
            this.MoveScene(this.sceneName);
        });
    }

    MoveScene(scene: string) {
        SceneManager.LoadScene(scene);
    }
}