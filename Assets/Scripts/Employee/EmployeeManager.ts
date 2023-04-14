import { GameObject } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import CardData from './CardData';
import EmployeeSlot from './EmployeeSlot';

export default class EmployeeManager extends ZepetoScriptBehaviour {
    // singleton
    private static Instance: EmployeeManager;
    public static GetInstance(): EmployeeManager {
        if (!EmployeeManager.Instance) {

            var _obj = GameObject.Find("EmployeeManager");
            if (!_obj) {
                _obj = new GameObject("EmployeeManager");
                _obj.AddComponent<EmployeeManager>();
            }
            EmployeeManager.Instance = _obj.GetComponent<EmployeeManager>();
            GameObject.DontDestroyOnLoad(_obj);
        }
        return EmployeeManager.Instance;
    }

    @SerializeField() private employeeSlotObjs: GameObject[] = [];
    private employeeSlots: EmployeeSlot[] = [];

    Awake() {
        if (this != EmployeeManager.GetInstance()) GameObject.Destroy(this.gameObject);
    }

    Start() {    
        for (let index = 0; index < this.employeeSlots.length; index++) {
            this.employeeSlots.push(this.employeeSlotObjs[index].GetComponent<EmployeeSlot>());
        }
    }

    public RegisterCardBySlotIndex(slotIndex: number, cardData: CardData, section: number) {
        this.employeeSlots[slotIndex].gameObject.SetActive(true);
        // Register the card to the first empty Employee slot
        this.employeeSlots[slotIndex].SetEmployee(cardData, section);
    }

    public UnregisterCard(slotIndex: number) {    
        // Unregister the card from the target Employee slot
        this.employeeSlots[slotIndex].Init();
        this.employeeSlots[slotIndex].gameObject.SetActive(false);
    }
    
    public RegisterCardToEmptySlot(cardData: CardData, section: number) {
        // Find an empty Employee slot
        let emptyIndex = -1;
        for (let i = 0; i < this.employeeSlots.length; i++) {
            if (!this.employeeSlots[i].IsRegistered()) {
                emptyIndex = i;
                break;
            }
        }
    
        // Check if an empty Employee slot is found
        if (emptyIndex === -1) {
            console.error('Cannot register the card because there are no empty Employee slots.');
            return;
        }

        this.employeeSlots[emptyIndex].gameObject.SetActive(true);
        // Register the card to the first empty Employee slot
        this.employeeSlots[emptyIndex].SetEmployee(cardData, section);
    }

}