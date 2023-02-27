import { TextAsset } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class XML extends ZepetoScriptBehaviour {

    @SerializeField() xmlText:TextAsset;
    
    Start() {    
        if (!this.xmlText) throw new DOMException("Not Find TextAsset : {0}",this.xmlText.name);
        var xmlDoc = new XMLDocument();
        xmlDoc.getElementById(this.xmlText.text); // text파일을 xml 데이터 형태로 변환.
    }

}