import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button } from 'UnityEngine.UI';
import { TextMeshProUGUI } from 'TMPro';
import HelpManager from './HelpManager';
import DataManager, { Section } from '../DataManager';
import { GameObject } from 'UnityEngine';
export default class HelpPanel extends ZepetoScriptBehaviour {
    @SerializeField() private mainPanel: GameObject;
    // @SerializeField() private help_receipt: Button;
    // @SerializeField() private help_receiptText: TextMeshProUGUI;
    @SerializeField() private help_employee: Button;
    @SerializeField() private help_employeeText: TextMeshProUGUI;
    @SerializeField() private help_plating: Button;
    @SerializeField() private help_platingText: TextMeshProUGUI;
    @SerializeField() private help_dispenser: Button;
    @SerializeField() private help_dispenserText: TextMeshProUGUI;
    @SerializeField() private help_grill: Button;
    @SerializeField() private help_grillText: TextMeshProUGUI;
    @SerializeField() private help_prep: Button;
    @SerializeField() private help_prepText: TextMeshProUGUI;
    @SerializeField() private help_fryer: Button;
    @SerializeField() private help_fryerText: TextMeshProUGUI;
    @SerializeField() private toMainButton: Button;
    @SerializeField() private mainText: TextMeshProUGUI;

    OnEnable(){
        this.ToMain();
    }

    Start() {
        this.help_employee.onClick.AddListener(() => {
            this.ToHelpSection("employee");
        });
        this.help_plating.onClick.AddListener(() => {
            this.ToHelpSection("plating");
        });
        this.help_dispenser.onClick.AddListener(() => {
            this.ToHelpSection("dispenser");
        });
        this.help_grill.onClick.AddListener(() => {
            this.ToHelpSection("grill");
        });
        this.help_prep.onClick.AddListener(() => {
            this.ToHelpSection("prep");
        });
        this.help_fryer.onClick.AddListener(() => {
            this.ToHelpSection("fryer");
        });
        this.toMainButton.onClick.AddListener(() => {
            this.ToMain();
        });
    }

    private ToHelpSection(section: string){
        this.mainPanel.SetActive(false);
        HelpManager.GetInstance().OpenHelpSection(section);
    }

    private ToMain(){
        HelpManager.GetInstance().ClearHelpContents();
        this.mainPanel.SetActive(true);
    }
}