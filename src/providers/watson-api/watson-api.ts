import { Injectable } from '@angular/core';
import { ENV } from '@app/env';
import { File, FileEntry } from '@ionic-native/file';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { Media, MediaObject } from '@ionic-native/media';


@Injectable()
export class WatsonApiProvider {

  constructor(public file: File, public txfr: FileTransfer, public audio: Media) {} 

  public synthesize(text: string) {
    let ft: FileTransferObject = this.txfr.create();
    let fn = this.file.dataDirectory + 'report_' + Date.now() + '.ogg';
    let auth = "Basic " + btoa(ENV.watson.username + ':' + ENV.watson.password);
    text = encodeURIComponent(text); // make text URL safe
    ft.download(
      ENV.watson.url + '/v1/synthesize?voice=en-US_LisaVoice&text=' + text,
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

}
