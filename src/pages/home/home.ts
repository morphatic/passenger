import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { WeatherApiProvider, WeatherAlert } from '../../providers/weather-api/weather-api';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { WatsonApiProvider } from '../../providers/watson-api/watson-api';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public messages: string;

  constructor(
    public navCtrl: NavController,
    public weather: WeatherApiProvider,
    public geo: Geolocation,
    public watson: WatsonApiProvider
  ) {}

  ionViewDidEnter() {
    this.geo.getCurrentPosition().then(
      (pos: Geoposition) => {
        // this.messages = 'The coords are: &lt;' + pos.coords.latitude + ', ' + pos.coords.longitude + '> ' + pos.coords.speed + 'm/s';
        // if ( null === pos.coords.speed || pos.coords.speed === 0 ) {
        //   this.watson.synthesize("You don't appear to be going anywhere right now.");
        // } else {
          // this.weather.getAlert(pos.coords.latitude, pos.coords.longitude).subscribe(
          this.weather.getAlert(30.11, -93.9).subscribe(
            (alert: WeatherAlert) => {
              this.messages += '<br>We got back from getAlerts()';
              if (alert) {
                let report = alert.alertDetail.texts[0].description.replace( '\n', ' ');
                this.watson.synthesize(report);
              } else {
                this.watson.synthesize("There doesn't appear to be any serious weather in your area right now.");
              }
            },
            err => {
              this.messages += '<br>' + 'wtf?';
              this.messages += '<br>' + err;
              this.messages += '<br>' + JSON.stringify(err);
            }
          );
        // }
      }
    ).catch(
      err => {
        this.messages = "<br>geolocation didn't work";
        console.log(err);
        console.log(JSON.stringify(err));
      }
    );
  }

}
