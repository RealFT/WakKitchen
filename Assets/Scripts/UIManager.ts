import { SceneManager } from 'UnityEngine.SceneManagement';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, InputField, Slider, Text } from "UnityEngine.UI";
import { GameObject } from 'UnityEngine';
export default class UIManager extends ZepetoScriptBehaviour {
    // �̱��� ����
    private static Instance: UIManager;
    public static GetInstance(): UIManager {

        if (!UIManager.Instance) {
            var _obj = new GameObject("UIManager");
            GameObject.DontDestroyOnLoad(_obj);
            UIManager.Instance = _obj.AddComponent<UIManager>();
        }
        return UIManager.Instance;
    }

    public sceneName: string;

    public timeText: Text;


    DisplayTime(hour: int, min: int) {
        var ampm: string;
        (hour < 12) ? ampm = " AM" : ampm = " PM";

        this.timeText.text = hour + ":" + min + ampm;

    }



    MoveScene(scene: string) {
        SceneManager.LoadScene(scene);
    }
}