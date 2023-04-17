import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject, Object, Transform, PlayerPrefs } from 'UnityEngine';
import { Button, Image } from "UnityEngine.UI";
import DataManager from './DataManager';
import UIManager from './UIManager';

// Class for daily rewards
export default class DailyReward extends ZepetoScriptBehaviour {
    private rewardAmount: number = 1; // Amount of daily reward
    private rewardDateKey: string = "lastRewardDate"; // Key to save the date of the last reward
    private wakduKey: string = "wakdu"; // Key to save the wakdu to be awarded as a reward
    @SerializeField() private claimButton: Button;    // button to claim reward
    @SerializeField() private newImage: Image;    // Image to inform new
    @SerializeField() private stampPrefab: GameObject;    
    @SerializeField() private stampPool: GameObject[];    
    @SerializeField() private contentsParent: Transform;    
    
    Start(){
        // Debug: Decrease saved date by one day for debugging purposes
        let debugDate: Date = new Date();
        debugDate.setDate(debugDate.getDate() - 1);
        PlayerPrefs.SetString(this.rewardDateKey, debugDate.toISOString());
        // Debug: set wakdu 1 for debugging purposes
        DataManager.GetInstance().SetValue(this.wakduKey, 1);

        // Initialize claimButton
        this.claimButton.onClick.AddListener(() => this.ClaimReward());

        // Initailize wakdu stamp
        let currentWakdu: number = DataManager.GetInstance().GetValue(this.wakduKey);
        for(let i=0;i<currentWakdu;i++){
            this.CreateWakdu();
        }
    }

    private CreateWakdu(){
        const stamp = Object.Instantiate(this.stampPrefab, this.contentsParent) as GameObject;
        this.stampPool.push(stamp);
    }

    // Method to check if daily reward is claimable
    private CheckIfRewardClaimable(): boolean {
        // Initialize lastRewardDate to today's date
        let lastRewardDate: Date = new Date();

        // Check if the last reward date is saved in PlayerPrefs
        if (PlayerPrefs.HasKey(this.rewardDateKey)) {
            // Retrieve the saved date as a string and convert it to a Date object
            const dateString: string = PlayerPrefs.GetString(this.rewardDateKey);
            lastRewardDate = new Date(dateString);
        }

        // Calculate the difference between the current date and the date of the last reward
        const currentDate: Date = new Date();
        const difference: number = (currentDate.getTime() - lastRewardDate.getTime()) / (1000 * 3600 * 24);

        // Output the current date, last reward date, and difference for debugging purposes
        console.log("currentDate: " + currentDate.getTime());
        console.log("lastRewardDate: " + lastRewardDate.getTime());
        console.log("difference: " + difference);

        // Determine whether the daily reward is claimable based on the difference
        const isClaimable = difference >= 1;

        // Activate or deactivate the new image and claim button based on claimability
        this.newImage.gameObject.SetActive(isClaimable);
        this.claimButton.interactable = isClaimable;

        // Return whether the difference is greater than or equal to 1 day
        return isClaimable;
    }

    // Method to claim daily reward
    public ClaimReward(): void {
        const isClaimable = this.CheckIfRewardClaimable();
        if (isClaimable) {
            // Grant the daily reward
            let currentWakdu: number = DataManager.GetInstance().GetValue(this.wakduKey);
            currentWakdu += this.rewardAmount;
            DataManager.GetInstance().SetValue(this.wakduKey, currentWakdu);

            // Update the date of the last reward
            const currentDate: Date = new Date();
            PlayerPrefs.SetString(this.rewardDateKey, currentDate.toISOString());

            this.CreateWakdu();
            this.newImage.gameObject.SetActive(!isClaimable);
            this.claimButton.interactable = !isClaimable;

            UIManager.GetInstance().OpenInformation("Daily reward granted.");
        }
        else {
            UIManager.GetInstance().OpenInformation("Reward already claimed today.");
        }
    }
}