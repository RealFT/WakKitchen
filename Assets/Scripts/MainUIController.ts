import { SceneManager } from 'UnityEngine.SceneManagement';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, InputField, Slider, Text } from "UnityEngine.UI";
import UIManager from './UIManager';

export default class MainUIController extends ZepetoScriptBehaviour {

    public sceneName: string;

    public startBtn: Button;

    Start() {
        let instance = UIManager.GetInstance();
        this.startBtn.onClick.AddListener(() => {
            //this.MoveScene(this.sceneName);
            if (instance) instance.MoveScene(this.sceneName);
        });
    }
}