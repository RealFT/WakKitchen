import { SceneManager } from 'UnityEngine.SceneManagement';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, InputField, Slider, Text } from "UnityEngine.UI";

export default class UIManager extends ZepetoScriptBehaviour {
    // ΩÃ±€≈Ê ∆–≈œ
    private static instance: UIManager;
    static Instance() {
        return this.instance || (this.instance = new this());
    }

    public sceneName: string;

    public timeText: Text;

    Start() {
        UIManager.instance = this;
    }

    DisplayTime(hour: int, min: int) {
        var ampm: string;
        (hour < 12) ? ampm = " AM" : ampm = " PM";

        this.timeText.text = hour + ":" + min + ampm;

    }

    MoveScene(scene: string) {
        SceneManager.LoadScene(scene);
    }
}