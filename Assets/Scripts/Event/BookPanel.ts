import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject } from 'UnityEngine';
import { Image, Button, Text, Slider } from 'UnityEngine.UI'
import SoundManager from '../SoundManager';
import EventTimer from './EventTimer';

export default class BookPanel extends ZepetoScriptBehaviour {
    @SerializeField() private bookButton: Button;
    @SerializeField() private stampButton: Button;
    @SerializeField() private eventButton: Button;
    @SerializeField() private closeButton: Button;   
    @SerializeField() private bookPanel: GameObject;
    @SerializeField() private stampPanel: GameObject;
    @SerializeField() private eventPanel: GameObject;

    Start(){
        this.bookButton.onClick.AddListener(()=>{
            this.bookPanel.SetActive(true);
            SoundManager.GetInstance().OnPlayButtonClick();
        });
        this.stampButton.onClick.AddListener(() => {
            this.OpenStampPanel();
            SoundManager.GetInstance().OnPlayButtonClick();
        });
        this.eventButton.onClick.AddListener(() => {
            this.OpenEventPanel();
            SoundManager.GetInstance().OnPlayButtonClick();
        });
        this.closeButton.onClick.AddListener(() => {
            this.bookPanel.SetActive(false);
            SoundManager.GetInstance().OnPlayButtonClick();
        });
        const event = this.eventPanel.GetComponent<EventTimer>();
        if (event.IsDateWithinRange()) {
            this.OpenEventPanel();
        }
    }

    private InitBookPanel() {
        this.bookPanel.SetActive(true);
        this.stampPanel.SetActive(false);
        this.eventPanel.SetActive(false);
    }
    public OpenStampPanel() {
        this.InitBookPanel();
        this.stampPanel.SetActive(true);
    }
    public OpenEventPanel() {
        this.InitBookPanel();
        this.eventPanel.SetActive(true);
    }
}