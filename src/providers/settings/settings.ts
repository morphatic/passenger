import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';

export interface Language {
  name: string;
  code: string;
  lang: string;
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
      code: 'en',
      lang: 'en-US'
    },
    {
      name: 'French',
      code: 'fr',
      lang: 'fr-FR'
    },
    {
      name: 'German',
      code: 'de',
      lang: 'de-DE'
    },
    {
      name: 'Italian',
      code: 'it',
      lang: 'it-IT'
    },
    {
      name: '日本語',
      code: 'ja',
      lang: 'ja-JP'
    },
    {
      name: 'Portuguese',
      code: 'pt',
      lang: 'pt-BR'
    },
    {
      name: 'Spanish',
      code: 'es',
      lang: 'es-US'
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
    this.isFirstLoad().then((isFirst: boolean) => {
      if (null === isFirst) {
        this.storage.set('isFirstLoad', true);
      } else if(isFirst) {
        this.storage.set('isFirstLoad', false);
      }
    });
    this.getVoice().then((voice: any) => {
      if (null === voice) {
        this.setVoice(this.defaultVoice);
      }
    });
    this.getSpeechRecognitionAvailability().then((avail: any) => {
      if (null === avail) {
        this.setSpeechRecognitionAvailability(false);
      }
    });
    this.getSpeechRecognitionPermission().then((perm: any) => {
      if (null === perm) {
        this.setSpeechRecognitionPermission(false);
      }
    });
  }

  isFirstLoad(): Promise<boolean> {
    return this.storage.get('isFirstLoad').then((isFirst: boolean) => isFirst);
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

  setSpeechRecognitionAvailability(avail: boolean): void {
    this.storage.set('isRecognitionAvailable', avail);
    this.events.publish('availability:changed', avail);
  }

  getSpeechRecognitionAvailability(): Promise<boolean> {
    return this.storage.get('isRecognitionAvailable').then((avail: boolean): boolean => avail);
  }

  setSpeechRecognitionPermission(perm: boolean): void {
    this.storage.set('isRecognitionPermitted', perm);
    this.events.publish('permission:changed', perm);
  }

  getSpeechRecognitionPermission(): Promise<boolean> {
    return this.storage.get('isRecognitionPermitted').then((perm: boolean): boolean => perm);
  }

}
