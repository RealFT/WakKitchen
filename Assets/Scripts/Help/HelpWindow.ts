import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, Image, Slider } from "UnityEngine.UI";
import { GameObject, Sprite, WaitForSeconds, Debug, Time } from 'UnityEngine';
import { TextMeshProUGUI } from 'TMPro';
export default class HelpWindow extends ZepetoScriptBehaviour {

    @SerializeField() private background: Image;
    @SerializeField() private guideObjects: GameObject[];
    @SerializeField() private helpText: TextMeshProUGUI;
    private gameObjectMap = new Map<string, GameObject[]>();

    Start(){
        for (const gameObject of this.guideObjects) {
            const name = gameObject.name; // Get the name of the current GameObject.
            const words = name.split("_"); // Split the name by '_' to get an array of words.
            const firstWord = words[0]; // Get the first word of the name.
            let group = this.gameObjectMap.get(firstWord); // Get the array of GameObjects with the same first word.
            if (!group) { // If there is no array for the first word yet, create a new one.
              group = [];
              this.gameObjectMap.set(firstWord, group);
            }
            group.push(gameObject); // Add the current GameObject to the array of GameObjects with the same first word.
          }
    }

    public SetBackgroundAlpha(alpha: number){
        this.background.color.a = alpha;
    }

}