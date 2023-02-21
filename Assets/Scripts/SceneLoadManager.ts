import { SceneManager } from 'UnityEngine.SceneManagement';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, InputField, Slider, Text } from "UnityEngine.UI";
import { AsyncOperation, Mathf, Debug, GameObject, SerializeField, WaitForEndOfFrame, WaitForSeconds } from "UnityEngine";
import GameManager from './GameManager';
import OrderManager from './OrderManager';
import UIManager from './UIManager';

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
        // Create an AsyncOperation object to track the progress of the scene load
        let asyncOperation: AsyncOperation = SceneManager.LoadSceneAsync(sceneName.toString());

        // Wait until the scene is fully loaded
        while (!asyncOperation.isDone) {
            // Update the progress of the loading screen based on the progress of the AsyncOperation
            // You can use this to update a loading bar or display a percentage
            let progress = Mathf.Clamp01(asyncOperation.progress * this.inverseNum);
            Debug.Log("Loading progress: " + progress);
            this.loadingProgressBar.value = progress;
            yield;
        }
        // Hide the loading screen
        this.loadingScreen.SetActive(false);

        this.currentScene = sceneName;
        switch(sceneName){
            case SceneName.Main:
            case SceneName.Shop:
                OrderManager.GetInstance().disableOrder();
                UIManager.GetInstance().disableStageUI();
                break;
            case SceneName.Stage:
                Debug.Log("GameManager.GetInstance().InitStage()");
                const Instance = GameManager.GetInstance();
                Instance.InitStage();
                Instance.nextStage();
                break;
            default:
                break;
        }
    }

    public getCurrentScene(): SceneName{
        return this.currentScene;
    }
}