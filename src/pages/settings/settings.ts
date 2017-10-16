import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { SettingsProvider, Language, Voices } from '../../providers/settings/settings';
import { MediaCapture, MediaFile, CaptureError, ConfigurationData } from '@ionic-native/media-capture';
import { Media, MediaObject } from '@ionic-native/media';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  private language: string;
  private languages: Language[];
  private voice: string;
  private voices: Voices;

  constructor(
    public navCtrl: NavController,
    public settings: SettingsProvider,
    public medcap: MediaCapture,
    public alrtCtrl: AlertController,
    public media: Media
  ) {
    this.languages = settings.languages;
    this.voices = settings.voices;
  }

  ionViewDidLoad() {
    this.getLanguage();
    this.getVoice();
    let cd: ConfigurationData[] = this.medcap.supportedVideoModes;
    let text = 'Video Modes<br>';
    for (let i = 0; i < cd.length; i += 1 ) {
      text += `${cd[i].height} ${cd[i].width} ${cd[i].type}<br>`;
    }
    let alrt = this.alrtCtrl.create({
      title: 'Media File Info',
      subTitle: text,
      buttons: ['OK']
    });
    alrt.present();
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

  record() {
    let af: MediaObject = this.media.create('asound.mp3');

    af.startRecord();

    setTimeout(() => {
      af.stopRecord();
      af.seekTo(0);
      af.play();
    }, 3000);

    // this.medcap.captureAudio({limit: 1}).then(
    //   (files: MediaFile[]) => {
    //     let text = 'Audio File Data<br>' + JSON.stringify(files);
    //     // for (let i = 0; i < files.length; i += 1) {
    //     //   text += `File ${i + 1}: name(${files[i].name}), path(${files[i].fullPath}), type(${files[i].type}), size(${files[i].size})<br>`;
    //     // }
    //     let alert = this.alrtCtrl.create({
    //       title: 'Media Files Info',
    //       subTitle: text,
    //       buttons: ['OK']
    //     });
    //     alert.present();
    //     // console.log(files[0].type); 
    //   },
    //   (err: CaptureError) => {
    //      let alert = this.alrtCtrl.create({
    //       title: 'Media Error Info',
    //       subTitle: JSON.stringify(err),
    //       buttons: ['OK']
    //     });
    //     alert.present();
    //    // console.log(err);
    //   }
    // );
  }

}
