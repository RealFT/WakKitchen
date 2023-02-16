import { SceneManager } from 'UnityEngine.SceneManagement';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, InputField, Slider, Text } from "UnityEngine.UI";
import UIManager from './UIManager';
import SceneLoadManager, { SceneName } from './SceneLoadManager';

export default class MainUIController extends ZepetoScriptBehaviour {

    public sceneName: SceneName;

    public startBtn: Button;

    Start() {
        this.startBtn.onClick.AddListener(() => {
            //this.MoveScene(this.sceneName);
            SceneLoadManager.GetInstance().LoadScene(this.sceneName);
        });
    }
}