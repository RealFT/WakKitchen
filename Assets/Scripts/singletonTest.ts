import { GameObject } from 'UnityEngine';
import { SceneManager } from 'UnityEngine.SceneManagement';
import { Button } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class singletonTest extends ZepetoScriptBehaviour {
    // singleton
    private static Instance: singletonTest;
    public static GetInstance(): singletonTest {

        if (!singletonTest.Instance) {
            //Debug.LogError("OrderManager");

            var _obj = GameObject.Find("singletonTest");
            if (!_obj) {
                _obj = new GameObject("singletonTest");
                _obj.AddComponent<singletonTest>();
            }
            singletonTest.Instance = _obj.GetComponent<singletonTest>();
            //GameObject.DontDestroyOnLoad(_obj);
        }
        return singletonTest.Instance;
    }

    public nums:number[] = [];
    public btn:Button;

    public numx:number = 0;

    Start() {    
        this.nums.push(1);
        this.nums.push(2);
        this.numx += this.nums.length;
        this.btn.onClick.AddListener(()=>{
            SceneManager.LoadScene("test_singleton");
        });
    }

}