import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';

export interface Language {
  name: string;
  code: string;
}
export interface Voice {
  male?: string;
  female?: string;
}
export interface Voices {
  [country: string]: Voice;
}

@Injectable()
export class SettingsProvider {

  public defaultLanguage = 'en';

  public defaultVoice = 'en-US_LisaVoice';

  public languages: Language[] = [
    {
      name: 'English',
      code: 'en'
    },
    {
      name: 'German',
      code: 'de'
    },
    {
      name: '日本語',
      code: 'ja'
    },
    {
      name: 'Portuguese',
      code: 'pt'
    }
  ];

  public voices: Voices = {
    en: {
      male: 'en-US_MichaelVoice',
      female: 'en-US_LisaVoice'
    },
    ja: {
      female: 'ja-JP_EmiVoice'
    },
    pt: {
      female: 'pt-BR_IsabelaVoice'
    },
    fr: {
      female: 'fr-FR_ReneeVoice'
    },
    de: {
      male: 'de-DE_DieterVoice',
      female: 'de-DE_BirgitVoice'
    },
    it: {
      female: 'it-IT_FrancescaVoice'
    },
    es: {
      male: 'es-ES_EnriqueVoice',
      female: 'es-US_SofiaVoice'
    }
  };

  constructor(public storage: Storage, public events: Events) {
    this.getVoice().then((voice: any) => {
      if (null === voice) {
        this.setVoice(this.defaultVoice);
      }
    });
  }

  setLanguage(lang: string): void {
    this.storage.set('language', lang);
    this.events.publish('language:changed', lang);
  }

  getLanguage(): Promise<string> {
    return this.storage.get('language').then((lang: string): string => lang);
  }

  getAvailable(lang: string): string {
    lang = lang.substring(0, 2).toLowerCase(); // normalize
    return this.languages.find((l: Language) => l.code == lang).code || this.defaultLanguage;
  }

  setVoice(voice: string): void {
    this.storage.set('voice', voice);
    this.events.publish('voice:changed', voice);
  }

  getVoice(): Promise<string> {
    return this.storage.get('voice').then((voice: string): string => voice);
  }

}
