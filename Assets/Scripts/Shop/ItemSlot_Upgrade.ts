import { Button, Image, Text } from 'UnityEngine.UI';
import { GameObject, Sprite } from 'UnityEngine'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ProductRecord } from 'ZEPETO.Product';
import ItemManager from '../ItemManager';
import GameManager from '../GameManager';
import { TextMeshProUGUI } from 'TMPro';
import UIManager from '../UIManager';

export default class ItemSlot_Upgrade extends ZepetoScriptBehaviour {

    // Upgrade slot
    @SerializeField() private itemImage: Image;
    @SerializeField() private nameText :Text;
    @SerializeField() private priceText :Text;
    @SerializeField() private buyBtn: Button;
    @SerializeField() private starObjs : GameObject[] = [];

    // Locked Image
    @SerializeField() private lockImage: Image;
    @SerializeField() private lockText :TextMeshProUGUI;
    private itemRecord: ProductRecord;
    private unlockStage: number;
    private isLock: boolean;

    public SetItem(ir: ProductRecord, sprite: Sprite, upgradeLevel: number, isFullyUpgraded: boolean, unlockStage: number) {
        this.itemImage.sprite = sprite;
        this.itemRecord = ir;
        this.nameText.text = ir.name.toString();
        this.priceText.text = ir.price.toString();
        if (!isFullyUpgraded) {
            this.buyBtn.onClick.AddListener(() => {
                this.StartCoroutine(ItemManager.GetInstance().PurchaseItem(ir.productId));
            });
            this.SetStar(upgradeLevel);
        }
        else{
            this.buyBtn.gameObject.SetActive(false);
            this.SetStar(upgradeLevel+1);
        }
        this.unlockStage = unlockStage;
        this.CheckLock();
    }

    private SetStar(upgradeLevel: number) {
        for (let index = 0; index < this.starObjs.length; index++) {
            this.starObjs[index].SetActive(false);
        }
        for (let visibleIndex = 0; visibleIndex < upgradeLevel - 1; visibleIndex++) {
            this.starObjs[visibleIndex].SetActive(true);
        }
    }

    private CheckLock(){
        const curStage = GameManager.GetInstance().GetCurrentStage();
        this.isLock = curStage < this.unlockStage ? true : false;
        // if(curStage == this.unlockStage){
        //     const info = `${this.nameText.text} unlocked!`;
        //     UIManager.GetInstance().OpenInformation(info);
        // }
        // need localize
        this.lockText.text = `Unlock to\nDay ${this.unlockStage}`;
        this.lockImage.gameObject.SetActive(this.isLock);

        // if unlocked, Move the current Transform object to the first sibling
        if (!this.isLock) this.transform.SetSiblingIndex(0);
    }

    public RefreshSlot(){
        this.CheckLock();
    }

    public GetItemRecord(): ProductRecord {
        return this.itemRecord;
    }
}