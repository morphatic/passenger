import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Events } from 'ionic-angular';
import { ENV } from '@app/env';
import { File, FileEntry } from '@ionic-native/file';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { Media, MediaObject } from '@ionic-native/media';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

export interface Translation {
  translations: {translation: string}[];
  word_count: number;
  character_count: number;
}

export interface Transcription {
  results: {
    alternatives: {
      confidence: number;
      transcript: string;
    }[];
    final: boolean;
  }[];
  result_index: number;
}

@Injectable()
export class WatsonApiProvider {

  private isCurrentlySpeaking: boolean = false;
  private utteranceQueue: MediaObject[] = [];

  constructor(
    public file: File,
    public txfr: FileTransfer,
    public audio: Media,
    public http: HttpClient,
    public events: Events
  ) {
    events.subscribe('utteranceAddedToQueue', () => {
      if (!this.isCurrentlySpeaking) {
        this.playNextUtterance();
      }
    });
    events.subscribe('utteranceStarted', () => {
      this.isCurrentlySpeaking = true;
    });
    events.subscribe('utteranceEnded', () => {
      if (this.utteranceQueue.length > 0) {
        this.playNextUtterance();
      } else {
        this.isCurrentlySpeaking = false;
      }
    });
  } 

  public synthesize(text: string, voice: string) {
    let ft: FileTransferObject = this.txfr.create();
    let fn = this.file.dataDirectory + 'report_' + Date.now() + '.ogg';
    let auth = "Basic " + btoa(ENV.watson.tts.username + ':' + ENV.watson.tts.password);
    text = encodeURIComponent(text); // make text URL safe
    ft.download(
      ENV.watson.tts.url + '/v1/synthesize?voice=' + voice + '&text=' + text,
      fn,
      false,
      {
        headers: {
          "Accept": "audio/ogg;codecs=opus",
          "Authorization": auth
        }
      }        
    ).then(
      (fe: FileEntry) => {
        let report: MediaObject = this.audio.create(fe.nativeURL);
        this.addUtteranceToQueue(report);
      },
      err => {
        console.log(JSON.stringify(err));
      }
    );
  }

  public translate(text: string, source: string, target: string): Observable<Translation> {
    let url = ENV.watson.translation.url + '/v2/translate';
    let body = { text: text, source: source, target: target };
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': "Basic " + btoa(ENV.watson.translation.username + ':' + ENV.watson.translation.password)
    });
    return this.http.post<Translation>(url, body, {headers: headers, responseType: 'json'});
  }

  public transcribe(file: string, model: string = 'en-US_BroadbandModel'): Observable<Transcription>{
    let url = ENV.watson.stt.url + '/v1/recognize?model=' + model;
    let headers = new HttpHeaders({
      'Content-Type': 'audio/mpeg',
      'Accept': 'application/json',
      'Transfer-Encoding': 'chunked',
      'Authorization': "Basic " + btoa(ENV.watson.stt.username + ':' + ENV.watson.stt.password)
    });
    return this.http.post<Transcription>(url, file, {headers: headers, responseType: 'json'});
  }

  private addUtteranceToQueue(utterance: MediaObject): void {
    this.utteranceQueue.push(utterance);
    this.events.publish('utteranceAddedToQueue');
  }

  private playNextUtterance(): void {
    // get the utterance and its duration
    let utterance = this.utteranceQueue[0];
    let duration  = utterance.getDuration() * 1000; // convert to ms
    // let everyone know we're currently speaking
    this.events.publish('utteranceStarted');
    // say what you gotta say
    utterance.play();
    // take the utterance out of the queue, and
    // let people know we're done speaking
    setTimeout(() => {
      this.utteranceQueue.shift();
      this.events.publish('utteranceEnded');
    }, duration);
  }
}
