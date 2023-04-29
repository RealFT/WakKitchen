import { GameObject } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import Shop_Hire from './Shop_Hire';
import Shop_Upgrade from './Shop_Upgrade';
import Shop_Food from './Shop_Food';
import GameManager from '../GameManager';

export default class Shop extends ZepetoScriptBehaviour {
    @SerializeField() private categoryBtns: Button[];
    @SerializeField() private toStageBtn: Button;
    @SerializeField() private panels: GameObject[];

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
            });
        }
        this.toStageBtn.onClick.AddListener(() => {
            GameManager.GetInstance().NextStage();
        });
    }

    public InitShop(){
        var hireShop = this.panels[0].GetComponent<Shop_Hire>();
        if(hireShop) hireShop.InitHireShop();
        var upgradeShop = this.panels[1].GetComponent<Shop_Upgrade>();
        if(upgradeShop) upgradeShop.InitUpgradeShop();
        // var foodShop = this.panels[2].GetComponent<Shop_Food>();
        // if(foodShop) foodShop.InitFoodShop();
    }
}