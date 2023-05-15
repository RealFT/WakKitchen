import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, InputField, Slider } from "UnityEngine.UI";
import { GameObject, Random, WaitForSeconds, Debug, Time } from 'UnityEngine';
import UIManager from '../UIManager';
import SoundManager from '../SoundManager';
import HelpWindow from './HelpWindow';
import DataManager from '../DataManager';
import GameManager from '../GameManager';

export default class HelpManager extends ZepetoScriptBehaviour {
    // 싱글톤 패턴
    private static Instance: HelpManager;
    public static GetInstance(): HelpManager {

        if (!HelpManager.Instance) {
            //Debug.LogError("GameManager");

            var _obj = GameObject.Find("HelpManager");
            if (!_obj) {
                _obj = new GameObject("HelpManager");
                _obj.AddComponent<HelpManager>();
            }
            HelpManager.Instance = _obj.GetComponent<HelpManager>();
            GameObject.DontDestroyOnLoad(_obj);
        }
        return HelpManager.Instance;
    }
    Awake() {
        if (this != HelpManager.GetInstance()) GameObject.Destroy(this.gameObject);
        this.window_full = this.helpWindow_full.GetComponent<HelpWindow>();
        this.window_upper = this.helpWindow_upper.GetComponent<HelpWindow>();
        this.window_lower = this.helpWindow_lower.GetComponent<HelpWindow>();
    }

    @SerializeField() private nextBtn: Button;
    @SerializeField() private helpUI: GameObject;
    @SerializeField() private helpWindow_full: GameObject;
    @SerializeField() private helpWindow_upper: GameObject;
    @SerializeField() private helpWindow_lower: GameObject;
    @SerializeField() private guideObjects: GameObject[];
    private gameObjectMap = new Map<string, GameObject[]>();
    private window_full: HelpWindow;
    private window_upper: HelpWindow;
    private window_lower: HelpWindow;
    private curPage: number;

    Start(){
        for (const gameObject of this.guideObjects) {
            const name = gameObject.name; // Get the name of the current GameObject.
            // const words = name.split("_"); // Split the name by '_' to get an array of words.
            // const firstWord = words[0]; // Get the first word of the name.
            let group = this.gameObjectMap.get(name); // Get the array of GameObjects with the same first word.
            if (!group) { // If there is no array for the first word yet, create a new one.
              group = [];
              this.gameObjectMap.set(name, group);
            }
            group.push(gameObject); // Add the current GameObject to the array of GameObjects with the same first word.
        }
        this.helpUI.SetActive(false);
        this.helpWindow_full.SetActive(false);
        this.helpWindow_upper.SetActive(false);
        this.helpWindow_lower.SetActive(false);
    }
    
    public GuideStartGame(){
        this.helpUI.SetActive(true);
        this.StartCoroutine(this.GuideStartRoutine());
    }

    *GuideStartRoutine(){
        this.curPage = 0;

        // page 1
        this.helpWindow_full.gameObject.SetActive(true);
        UIManager.GetInstance().PlayText(this.window_full.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_start_ment1"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                this.curPage = 1;
            }
        })
        while (this.curPage < 1) yield null;

        // page 2
        this.helpWindow_full.gameObject.SetActive(false);
        this.helpWindow_lower.gameObject.SetActive(true);
        const playButton = this.gameObjectMap.get("Help_ToStageBtn")?.[0];
        playButton.SetActive(true);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_lower.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_start_ment2"));
        this.nextBtn.onClick.AddListener(()=>{
            UIManager.GetInstance().nextText()
        });
        playButton.GetComponent<Button>().onClick.AddListener(()=>{
            GameManager.GetInstance().NextStage();
            this.curPage = 2;
            playButton.SetActive(false);
        });
        while (this.curPage < 2) yield null;

        // page 3
        this.helpWindow_lower.gameObject.SetActive(false);
        this.helpWindow_full.gameObject.SetActive(true);
        this.gameObjectMap.get("Focus_Section_Cook")?.[0].SetActive(true);
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_full.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_start_ment3"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                this.curPage = 3;
            }
        })
        while (this.curPage < 3) yield null;
        this.nextBtn.onClick.RemoveAllListeners();
        UIManager.GetInstance().PlayText(this.window_full.GetHelpText(), DataManager.GetInstance().GetCurrentLanguageData("tutorial_start_ment4"));
        this.nextBtn.onClick.AddListener(()=>{
            if(UIManager.GetInstance().nextText()){
                this.curPage = 3;
            }
        })

        this.helpWindow_full.gameObject.SetActive(false);
        this.helpWindow_lower.gameObject.SetActive(false);
        this.helpUI.SetActive(false);
    }
}