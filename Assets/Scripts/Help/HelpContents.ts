import { GameObject } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import HelpPage from './HelpPage';
import { TextMeshProUGUI } from 'TMPro';
import DataManager from '../DataManager';
import GameManager from '../GameManager';

export default class HelpContents extends ZepetoScriptBehaviour {
    @SerializeField() private pageObjs: GameObject[];
    @SerializeField() private closeButton: Button;
    @SerializeField() private confirmText: TextMeshProUGUI;
    private pages: HelpPage[] = [];

    OnEnable(){
        this.confirmText.text = DataManager.GetInstance().GetCurrentLanguageData("button_confirm");
        this.pageObjs[0].SetActive(true);
    }

    Start() {
        for (const page of this.pageObjs) {
            this.pages.push(page.GetComponent<HelpPage>());
        }
        const maxPage = this.pages.length;
        // 첫 페이지의 이전으로, 마지막 페이지의 다음 버튼 비활성화
        this.pages[0].gameObject.SetActive(true);    
        this.pages[0].GetPrevBtn().gameObject.SetActive(false);    
        this.pages[maxPage - 1].GetNextBtn().gameObject.SetActive(false);    
        for (let i = 0; i < maxPage; i++) {
            const curPage = this.pages[i];
            if (i != 0){
                const prevPage = this.pages[i - 1];
                curPage.GetPrevBtn().onClick.AddListener(()=>{
                    curPage.gameObject.SetActive(false);
                    prevPage.gameObject.SetActive(true);
                });
                curPage.gameObject.SetActive(false);
            }
            if (i != maxPage - 1){
                const nextPage = this.pages[i + 1];
                curPage.GetNextBtn().onClick.AddListener(()=>{
                    curPage.gameObject.SetActive(false);
                    nextPage.gameObject.SetActive(true);
                });
            }
        }
        this.pageObjs[0].SetActive(true);
    }

    public GetPages(): HelpPage[]{
        if(this.pages.length == 0){
            for (const page of this.pageObjs) {
                this.pages.push(page.GetComponent<HelpPage>());
            }
        }
        return this.pages;
    }

    public SetCloseBtnVisivility(visible: boolean){
        this.closeButton.gameObject.SetActive(visible);
    }
}