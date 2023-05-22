import { GameObject, Object } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import CardData from './CardData';
import EmployeeSlot from './EmployeeSlot';
import Mediator, { EventNames, IListener } from '../Notification/Mediator';
interface CardDataWithSection {
    cardData: CardData;
    section: number;
}

export default class EmployeeManager extends ZepetoScriptBehaviour implements IListener {
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

    @SerializeField() private employeeSlotContent: GameObject;
    @SerializeField() private employeeSlotPrefab: GameObject;
    private employeeSlots: EmployeeSlot[] = [];
    private cardDataWithSectionArray: CardDataWithSection[] = [];
    private employeeHeadCount: number = 0;

    Awake() {
        if (this != EmployeeManager.GetInstance()) GameObject.Destroy(this.gameObject);
    }

    Start() {    
        // var employees = this.employeeSlotContent.GetComponentsInChildren<EmployeeSlot>(true); 
        // for (let index = 0; index < this.employeeSlots.length; index++) {
        //     this.employeeSlots[index] = employees[index];
        //     console.log(employees[index]);
        // }
        Mediator.GetInstance().RegisterListener(this);
    }

    private OnDestroy() {
        Mediator.GetInstance().UnregisterListener(this);
    }

    public StartEmployee(){
        this.employeeHeadCount = 0;
        this.employeeSlots.forEach((slot)=>{
            slot.gameObject.SetActive(false);
        });
        this.cardDataWithSectionArray.forEach((data)=>{
            if(data.cardData) this.CreateEmployeeSlot(data.cardData, data.section);
        });
        this.employeeSlots.forEach((slot)=>{
            if(slot.IsRegistered()){
                slot.StartWorking();
                this.employeeHeadCount++;
            }
        });
    }

    public OnNotify(sender: any, eventName: string, eventData: any): void {
        if (!this.gameObject.activeSelf) return;
        switch(eventName){
            case EventNames.StageStarted:
                //this.StartEmployee();
                break;
            case EventNames.StageEnded:
                this.employeeSlots.forEach((slot)=>{
                    slot.Init();
                    slot.gameObject.SetActive(false);
                });
                this.cardDataWithSectionArray = [];
                break;
        }
    }
    
    private CreateEmployeeSlot(cardData: CardData, section: number) {
        let slot: EmployeeSlot;
        const inactiveSlotIndex = this.employeeSlots.findIndex(s => !s.gameObject.activeSelf);
        if (inactiveSlotIndex !== -1) { // reuse inactive slot
            slot = this.employeeSlots[inactiveSlotIndex];
            slot.gameObject.SetActive(true);
        } else { // instantiate new slot
            const cardObj = Object.Instantiate(this.employeeSlotPrefab, this.employeeSlotContent.transform) as GameObject;
            slot = cardObj.GetComponent<EmployeeSlot>();
            this.employeeSlots.push(slot);
        }
        slot.SetEmployee(cardData, section);
        slot.gameObject.SetActive(true);
    }

    public RegisterCardBySlotIndex(slotIndex: number, cardData: CardData, section: number) {
        this.cardDataWithSectionArray[slotIndex] = { cardData, section };
    }

    public UnregisterCard(slotIndex: number) {
        this.cardDataWithSectionArray[slotIndex] = { cardData: null, section: null };
    }

    public GetTotalEmployeePay(): number{
        return this.employeeHeadCount * 100;
    }
}