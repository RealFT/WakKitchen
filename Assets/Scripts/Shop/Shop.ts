import { GameObject } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import Shop_Employee from './Shop_Employee';
import Shop_Upgrade from './Shop_Upgrade';
import Shop_Food from './Shop_Food';
import GameManager from '../GameManager';
import SoundManager from '../SoundManager';
import DataManager from '../DataManager';
import { TextMeshProUGUI } from 'TMPro';
export default class Shop extends ZepetoScriptBehaviour {
    @SerializeField() private categoryBtns: Button[];
    @SerializeField() private categoryTextEmployee: TextMeshProUGUI;
    @SerializeField() private categoryTextUpgrade: TextMeshProUGUI;
    @SerializeField() private toStageBtn: Button;
    @SerializeField() private panels: GameObject[];

    OnEnable(){
        this.categoryTextEmployee.text = DataManager.GetInstance().GetCurrentLanguageData("shop_employee_category");
        this.categoryTextUpgrade.text = DataManager.GetInstance().GetCurrentLanguageData("shop_upgrade_category");
    }

    Start() {

        for (let i = 0; i < this.categoryBtns.length; i++) {
            const categoryBtn = this.categoryBtns[i];
            const categoryPanel = this.panels[i];

            categoryBtn.onClick.AddListener(() => {
                for (let j = 0; j < this.categoryBtns.length; j++) {
                    const btn = this.categoryBtns[j];
                    const panel = this.panels[j];

                    panel.SetActive(categoryPanel === panel);
                    btn.interactable = (categoryBtn != btn);
                }
                SoundManager.GetInstance().OnPlayButtonClick();
            });
        }
        this.toStageBtn.onClick.AddListener(() => {
            GameManager.GetInstance().NextStage();
            SoundManager.GetInstance().OnPlayButtonClick();
        });
    }

    public InitShop(){
        var employeeShop = this.panels[0].GetComponent<Shop_Employee>();
        if(employeeShop) employeeShop.InitEmployeeShop();
        var upgradeShop = this.panels[1].GetComponent<Shop_Upgrade>();
        if(upgradeShop) upgradeShop.InitUpgradeShop();
        // var foodShop = this.panels[2].GetComponent<Shop_Food>();
        // if(foodShop) foodShop.InitFoodShop();
    }
}