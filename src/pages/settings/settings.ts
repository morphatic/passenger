import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import { SettingsProvider, Language, Voices } from '../../providers/settings/settings';

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
    public events: Events,
    public settings: SettingsProvider
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
  }

  ionViewDidLoad() {
    this.getLanguage();
    this.getVoice();
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
}
