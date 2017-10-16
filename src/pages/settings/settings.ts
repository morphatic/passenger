import { Component } from '@angular/core';
import { NavController, AlertController, Events } from 'ionic-angular';
import { SettingsProvider, Language, Voices } from '../../providers/settings/settings';
import { Media/*, MediaObject*/ } from '@ionic-native/media';
import { SpeechRecognition } from '@ionic-native/speech-recognition';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  private language: string;
  private languages: Language[];
  private voice: string;
  private voices: Voices;
  private recogAvailable: boolean = false;
  private recogPermitted: boolean = false;

  constructor(
    public navCtrl: NavController,
    public events: Events,
    public settings: SettingsProvider,
    public alrtCtrl: AlertController,
    public media: Media,
    public sr: SpeechRecognition
  ) {
    this.languages = settings.languages;
    this.voices = settings.voices;
    // monitor the language for changes
    events.subscribe('language:changed', (lang: string) => {
      this.language = lang;
    });
    events.subscribe('voice:changed', (v: string) => {
      this.voice = v;
    });
    this.sr.isRecognitionAvailable().then(
      (avail: boolean) => {
        settings.setSpeechRecognitionAvailability(avail);
        this.recogAvailable = avail;
        if (avail) {
          this.sr.hasPermission().then(
            (perm: boolean) => {
              this.recogPermitted = perm;
              settings.setSpeechRecognitionPermission(perm);
            }
          );
        }
      }
    );
  }

  ionViewDidLoad() {
    this.getLanguage();
    this.getVoice();
    if (!this.recogPermitted) {
      this.sr.requestPermission().then(
        () => {
          this.settings.setSpeechRecognitionPermission(true);
          this.recogPermitted = true;
        },
        () => {
          this.settings.setSpeechRecognitionPermission(false);
          this.recogPermitted = false;
        }
      );
    }
  }

  getLanguage() {
    this.settings.getLanguage().then((lang:string) => {
      this.language = lang;
    });
  }

  selectLanguage(lang: string) {
    this.settings.setLanguage(lang);
    let v = !!this.voices[lang].male ? this.voices[lang].male : this.voices[lang].female;
    this.selectVoice(v);
  }

  getVoice() {
    this.settings.getVoice().then((voice: string) => {
      this.voice = voice;
    });
  }

  selectVoice(v: string) {
    this.voice = v;
    this.settings.setVoice(v);
  }

  getSpeechRecognitionPermission() {
    this.settings.getSpeechRecognitionAvailability
  }

  isRecognitionAvailable = (): boolean => this.recogAvailable;

  record() {
    let alert = this.alrtCtrl.create({
      title: 'Speech Recog Info',
      buttons: ['OK']
    });
    if (this.recogAvailable) {
      this.sr.startListening({language: this.language, showPopup: false}).subscribe(
        (matches: string[]) => {
          alert.setSubTitle(matches[0]);
          alert.present();
        },
        (err: any) => {
          alert.setSubTitle('Error: ' + err);
          alert.present();
        }
      );
    } else {
      alert.setSubTitle('Recog is NOT available :(');
      alert.present();
    }
  }

}
