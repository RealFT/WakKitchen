import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Text } from "UnityEngine.UI";
import { GameObject } from 'UnityEngine';

//define variable to use
export default class StageUIController extends ZepetoScriptBehaviour {
    public messageText: Text;
    public timeText: Text;

    Start() {
        this.Init();
    }

    public Init() {
        this.messageText.text = " ";
    }

    public Announce(text: string) {
        this.messageText.text = text;
    }

    public SetTimeUI(hour: int, minute: int) {
        // Convert hour to 12-hour format and add AM/PM
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;

        // Add leading zeros to minute and hour if necessary
        const formattedHour = hour < 10 ? `0${hour}` : hour;
        const formattedMinute = minute < 10 ? `0${minute}` : minute;

        // Combine strings to create the desired output
        const time = `${formattedHour}:${formattedMinute} ${ampm}`;

        this.timeText.text = time;
    }

}