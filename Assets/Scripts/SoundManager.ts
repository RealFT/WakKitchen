import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { AudioClip, AudioSource, GameObject, Resources, Sprite } from "UnityEngine";
import { Toggle, Slider, Button } from "UnityEngine.UI";
import { TextMeshProUGUI } from 'TMPro';
export default class SoundManager extends ZepetoScriptBehaviour {
    // singleton
    private static Instance: SoundManager;
    public static GetInstance(): SoundManager {

        if (!SoundManager.Instance) {

            var _obj = GameObject.Find("SoundManager");
            if (!_obj) {
                _obj = new GameObject("SoundManager");
                _obj.AddComponent<SoundManager>();
            }
            SoundManager.Instance = _obj.GetComponent<SoundManager>();
            GameObject.DontDestroyOnLoad(_obj);
        }
        return SoundManager.Instance;
    }
    Awake() {
        if (this != SoundManager.GetInstance()) GameObject.Destroy(this.gameObject);
    }

    // Variables to store scene names
    public keyMain: string = 'Main'; // Main scene key
    public keyStage: string = 'Stage'; // Stage scene key
    public keyShop: string = 'Shop'; // Shop scene key
    public keyCardSet: string = 'CardSet'; // CardSet scene key

    // Map to store loaded audio clips for BGM and SFX
    private BGMMap: Map<string, AudioClip> = new Map<string, AudioClip>();
    private SFXMap: Map<string, AudioClip> = new Map<string, AudioClip>();
    
    // Audio sources for BGM and SFX
    @SerializeField() private BGM: AudioSource;
    @SerializeField() private SFX: AudioSource;
    @SerializeField() private muteBGM: Toggle;
    @SerializeField() private muteSFX: Toggle;

    private masterMute: boolean = false; // Master mute flag
    private masterVolume: number = 1; // Master volume level
    
    private SFXMute: boolean = false; // SFX mute flag
    private SFXVolume: number = 1; // SFX volume level
    
    private BGMMute: boolean = false; // BGM mute flag
    private BGMVolume: number = 1; // BGM volume level

    // Getter functions to retrieve the current state of sound settings
    get SFXSoundMute() {
        return this.masterMute || this.SFXMute;
    }
    get SFXSoundVolume() {
        return this.SFXVolume * this.masterVolume;
    }
    get BGMSoundMute() {
        return this.masterMute || this.BGMMute;
    }
    get BGMSoundVolume() {
        return this.BGMVolume * this.masterVolume;
    }

    Start(){
        this.muteBGM.onValueChanged.AddListener(() => this.MuteBGMVolume(this.muteBGM));
        this.muteSFX.onValueChanged.AddListener(() => this.MuteSFXVolume(this.muteSFX));
    }
    
    // Functions to change the sound settings
    public ChangeMasterVolume(slider: Slider) {
        this.masterVolume = slider.value;
        this.ApplyBGMVolume();
        this.ApplySFXVolume();
    }
    public MuteMasterVolume(toggle: Toggle) {
        this.masterMute = toggle.isOn;
        this.ApplyBGMVolume();
        this.ApplySFXVolume();
    }
    public ChangeSFXVolume(slider: Slider) {
        this.SFXVolume = slider.value;
        this.ApplySFXVolume();
    }
    public MuteSFXVolume(toggle: Toggle) {
        this.SFXMute = toggle.isOn;
        this.ApplySFXVolume();
    }
    public ChangeBGMVolume(slider: Slider) {
        this.BGMVolume = slider.value;
        this.ApplyBGMVolume();
    }
    public MuteBGMVolume(toggle: Toggle) {
        this.BGMMute = toggle.isOn;
        this.ApplyBGMVolume();
    }

    public LoadAudio() {
        const bgmClips: AudioClip[] = Resources.LoadAll<AudioClip>("Sounds/BGM");
        const sfxClips: AudioClip[] = Resources.LoadAll<AudioClip>("Sounds/SFX");

        bgmClips.forEach((clip) => {
            if (clip instanceof AudioClip) {
                this.BGMMap.set(clip.name, clip);
            }
        });
        sfxClips.forEach((clip) => {
            if (clip instanceof AudioClip) {
                this.SFXMap.set(clip.name, clip);
            }
            this.SFXMap.set(clip.name, clip);
        });

        this.BGM.loop = true;
        this.SFX.loop = false;
    }
    
    public ApplyBGMVolume(): void {
        this.BGM.volume = this.BGMVolume;
        this.BGM.mute = this.BGMMute;
    }

    public ApplySFXVolume(): void {
        this.SFX.volume = this.SFXVolume;
        this.SFX.mute = this.SFXMute;
    }

    public OnPlayBGM(key: string): void {
        // Stop the currently playing music
        this.BGM.Stop();

        // If already playing, return
        if (this.BGM.isPlaying) return;

        // Set the clip for the specified key
        this.BGM.clip = this.BGMMap.get(key);

        // Only play if music clip exists
        if (!this.BGM.isPlaying) this.BGM.Play();
    }
    
    public OnPlaySFX(clipName: string): void {
        if (this.SFX) this.SFX.Stop();

        if (this.SFX.isPlaying) return;

        // Set the clip for the specified name
        this.SFX.clip = this.SFXMap.get(clipName);

        // Only play if sound clip exists
        if (!this.SFX.isPlaying) this.SFX.Play();
    }

    public ToMain(): void {
        // Stop any currently playing sounds
        this.BGM.Stop();
        this.SFX.Stop();

        // Play the Main BGM
        this.OnPlayBGM(this.keyMain);
    }
}