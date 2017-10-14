import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams, HttpHeaders } from '@angular/common/http';
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


@Injectable()
export class WatsonApiProvider {

  constructor(public file: File, public txfr: FileTransfer, public audio: Media, public http: HttpClient) {} 

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
        report.play();
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

}
