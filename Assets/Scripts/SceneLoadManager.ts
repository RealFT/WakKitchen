import { SceneManager } from 'UnityEngine.SceneManagement';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, InputField, Slider, Text } from "UnityEngine.UI";
import { AsyncOperation, Mathf, Debug, GameObject, SerializeField, WaitForEndOfFrame, WaitForSeconds } from "UnityEngine";
import GameManager from './GameManager';
import OrderManager from './OrderManager';
import UIManager from './UIManager';
import SoundManager from './SoundManager';

export enum SceneName {
    Main = "00_Main",
    Stage = "01_Stage",
    Shop = "02_Shop",
}

export default class SceneLoadManager extends ZepetoScriptBehaviour {
    // singleton
    private static Instance: SceneLoadManager;
    public static GetInstance(): SceneLoadManager {

        if (!SceneLoadManager.Instance) {
            var _obj = GameObject.Find("SceneLoadManager");
            if (!_obj) {
                _obj = new GameObject("SceneLoadManager");
                _obj.AddComponent<SceneLoadManager>();
            }
            SceneLoadManager.Instance = _obj.GetComponent<SceneLoadManager>();
            GameObject.DontDestroyOnLoad(_obj);
        }
        return SceneLoadManager.Instance;
    }

    // Reference to the loading screen UI element
    public loadingScreen: GameObject;
    public loadingProgressBar: Slider;
    private inverseNum: number = 1 / 0.9;
    private currentScene: SceneName;
    private isCharacterLoaded: boolean;

    Awake() {
        if (this != SceneLoadManager.GetInstance()) GameObject.Destroy(this.gameObject);
    }

    Start() {
        this.loadingScreen.SetActive(false);
        this.currentScene = SceneName.Main;
    }

    // Load the specified scene
    public LoadScene(sceneName: SceneName) {
        // Show the loading screen
        this.loadingScreen.SetActive(true);

        // Load the specified scene asynchronously
        this.StartCoroutine(this.LoadSceneAsync(sceneName));
    }

    *LoadSceneAsync(sceneName: SceneName) {
        this.isCharacterLoaded = false;
        // Create an AsyncOperation object to track the progress of the scene load
        let asyncOperation: AsyncOperation = SceneManager.LoadSceneAsync(sceneName.toString());
        let progress = 0;
        // Wait until the scene is fully loaded
        while (!asyncOperation.isDone) {
            // Update the progress of the loading screen based on the progress of the AsyncOperation
            // You can use this to update a loading bar or display a percentage
            progress = Mathf.Clamp01(asyncOperation.progress * this.inverseNum);
            Debug.Log("Loading progress: " + progress);
            this.loadingProgressBar.value = progress;
            yield;
        }
        this.currentScene = sceneName;
        switch(sceneName){
            case SceneName.Main:
                SoundManager.GetInstance().OnPlayBGM(SoundManager.GetInstance().keyMain);
                break;
            case SceneName.Shop:
                OrderManager.GetInstance().DisableOrder();
                UIManager.GetInstance().DisableStageUI();
                break;
            case SceneName.Stage:
                while (!this.isCharacterLoaded){
                    yield;
                }
                GameManager.GetInstance().InitStage();
                //GameManager.GetInstance().NextStage();
                break;
            default:
                break;
        }
        // Hide the loading screen
        this.loadingScreen.SetActive(false);
    }

    public SetCharacterLoaded(){
        this.isCharacterLoaded = true;
    }

    public getCurrentScene(): SceneName{
        return this.currentScene;
    }
}