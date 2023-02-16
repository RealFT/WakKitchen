import { SceneManager } from 'UnityEngine.SceneManagement';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, InputField, Slider, Text } from "UnityEngine.UI";
import UIManager from './UIManager';
import SceneLoadManager, { SceneName } from './SceneLoadManager';

export default class SceneMove extends ZepetoScriptBehaviour {

    public sceneName: SceneName;
    public sceneMoveBtn: Button;

    Start() {
        this.sceneMoveBtn.onClick.AddListener(() => {
            SceneLoadManager.GetInstance().LoadScene(this.sceneName);
        });
    }
}