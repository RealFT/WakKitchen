import { Collider } from 'UnityEngine';
import { SceneManager } from 'UnityEngine.SceneManagement';
import { ZepetoCharacter, ZepetoPlayer, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour, ZepetoScriptInstance } from 'ZEPETO.Script';

export default class SceneMove extends ZepetoScriptBehaviour {

    public sceneName: string;
    private zepetoCharacter: ZepetoCharacter;
    
    Start() {
        // Zepeto character object
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this.zepetoCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        });
    }
    
    OnTriggerEnter(collider: Collider) {
        if (this.zepetoCharacter == null || collider.gameObject != this.zepetoCharacter.gameObject) 
            return;
        
        
        // Scene moves when the player contacts an object
        SceneManager.LoadScene(this.sceneName);
    }

    MoveScene() {
        // Scene moves when the player contacts an object
        SceneManager.LoadScene(this.sceneName);
    }
}