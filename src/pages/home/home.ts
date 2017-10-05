import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { WeatherApiProvider, AlertDetail } from '../../providers/weather-api/weather-api';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { WatsonApiProvider } from '../../providers/watson-api/watson-api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public messages: string = '';
  private timer: any;
  private preventSimpleClick: boolean;
  private onResume: Subscription;

  constructor(
    public navCtrl: NavController,
    public weather: WeatherApiProvider,
    public geo: Geolocation,
    public watson: WatsonApiProvider,
    public platform: Platform
  ) {
    this.onResume = platform.resume.subscribe(() => {
      this.ionViewDidEnter();
    });
  }

  swipeleft(e) {
    this.weather.getMockAlerts().subscribe(
      (alerts: AlertDetail[]) => {
        let msg = '';
        if (alerts.length > 0) {
          let add_s = alerts.length > 1 ? 'alerts' : 'alert',
              is_or_are = alerts.length > 1 ? 'are' : 'is';
          msg = `There ${is_or_are} ${alerts.length} ${add_s} in your area. `;
          // loop through the list of alerts
          for (let i = 0; i < alerts.length; i += 1) {
            msg += this.toText(alerts[i], 15);
          }
        } else {
          // all clear; no alerts
          msg = "There does not appear to be any dangerous weather in your area right now.";
        }
        // this.messages += msg + ' ';
        this.watson.synthesize(msg);
      },
      (err: any) => {
        // handle error getting alerts
      }
    );
  }
  swiperight(e) {
    this.weather.getMockAlerts().subscribe(
      (alerts: AlertDetail[]) => {
        let msg = '';
        if (alerts.length > 0) {
          let add_s = alerts.length > 1 ? 'alerts' : 'alert',
              is_or_are = alerts.length > 1 ? 'are' : 'is';
          msg = `There ${is_or_are} ${alerts.length} ${add_s} in your area. `;
          // loop through the list of alerts
          for (let i = 0; i < alerts.length; i += 1) {
            msg += this.toText(alerts[i], 0);
          }
        } else {
          // all clear; no alerts
          msg = "There does not appear to be any dangerous weather in your area right now.";
        }
        // this.messages += msg + ' ';
        this.watson.synthesize(msg);
      },
      (err: any) => {
        // handle error getting alerts
      }
    );
  }

  checkWeather() {
    this.ionViewDidEnter();
  }

  checkMockWeather() {
    this.preventSimpleClick = true;
    clearTimeout(this.timer);
  }

  ionViewDidEnter() {
    this.geo.getCurrentPosition().then(
      (pos: Geoposition) => {
        // if speed < 45 mph (20.1168 mps)
        if ( null === pos.coords.speed || pos.coords.speed < 20.1168 ) {
          // moving slowly (or not at all) so get local nowcast
          this.weather.getAlerts(45.58, -122.05).subscribe(
            // this.weather.getAlerts(pos.coords.latitude, pos.coords.longitude).subscribe(
            (alerts: AlertDetail[]) => {
              let msg = '';
              if (alerts.length > 0) {
                let add_s = alerts.length > 1 ? 'alerts' : 'alert',
                    is_or_are = alerts.length > 1 ? 'are' : 'is';
                msg = `There ${is_or_are} ${alerts.length} ${add_s} in your area. `;
                // loop through the list of alerts
                for (let i = 0; i < alerts.length; i += 1) {
                  msg += this.toText(alerts[i], 0);
                }
              } else {
                // all clear; no alerts
                msg = "There does not appear to be any dangerous weather in your area right now.";
              }
              // this.messages += msg + ' ';
              this.watson.synthesize(msg);
            },
            (err: any) => {
              // handle error getting alerts
            }
          );
        } else {
          // we are moving; get alerts for 5, 10, and 15 minutes out
          let positions = [];
          for (let i = 1; i <= 3; i += 1) {
            positions.push(this.getTargetPoint(pos, i * 5 ) );
          }
          // get alerts for all three positions
          // this.weather.getAlerts(pos.coords.latitude, pos.coords.longitude).subscribe(
          this.weather.getAlerts(pos.coords.latitude, pos.coords.longitude).subscribe(
            (alerts: AlertDetail[]) => {
              // this.messages += '<br>We got back from getAlerts()';
              // if (alert) {
              //   let report = alert.alertDetail.texts[0].description.replace( '\n', ' ');
              //   this.watson.synthesize(report);
              // } else {
              //   this.watson.synthesize("There doesn't appear to be any serious weather in your area right now.");
              // }
            },
            err => {
              // this.messages += '<br>' + 'wtf?';
              // this.messages += '<br>' + err;
              // this.messages += '<br>' + JSON.stringify(err);
            }
          );
        }
      }
    ).catch(
      err => {
        // this.messages = "<br>geolocation didn't work";
        console.log(err);
        console.log(JSON.stringify(err));
      }
    );
  }

  private toRadians = (deg: number) => deg * Math.PI / 180;
  private toDegrees = (rad: number) => rad * 180 / Math.PI;

  /**
   * Calculates approximately where the driver might be in 15 minutes, given
   * constant speed and bearing.
   * From https://github.com/chrisveness/geodesy/blob/master/latlon-vincenty.js
   * @param {Geoposition} pos The position from the phone's Geolocation
   * @param {when} pos The number of minutes out to project
   */
  private getTargetPoint(pos: Geoposition, when: number) {
    // constant ellipsoid parameters using WGS84
    const a = 6378137,
          b = 6356752.314245,
          f = 1/298.257223563;

    let φ1 = this.toRadians(pos.coords.latitude), 
        λ1 = this.toRadians(pos.coords.longitude),
        α1 = this.toRadians(pos.coords.heading),
        s  = pos.coords.speed * 60 * when; // distance to be traveled in 'when' minutes

    let sinα1 = Math.sin(α1);
    let cosα1 = Math.cos(α1);

    let tanU1 = (1-f) * Math.tan(φ1), cosU1 = 1 / Math.sqrt((1 + tanU1*tanU1)), sinU1 = tanU1 * cosU1;
    let σ1 = Math.atan2(tanU1, cosα1);
    let sinα = cosU1 * sinα1;
    let cosSqα = 1 - sinα*sinα;
    let uSq = cosSqα * (a*a - b*b) / (b*b);
    let A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq)));
    let B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq)));

    let cos2σM, sinσ, cosσ, Δσ;

    let σ = s / (b*A), σʹ, iterations = 0;
    do {
        cos2σM = Math.cos(2*σ1 + σ);
        sinσ = Math.sin(σ);
        cosσ = Math.cos(σ);
        Δσ = B*sinσ*(cos2σM+B/4*(cosσ*(-1+2*cos2σM*cos2σM)-
            B/6*cos2σM*(-3+4*sinσ*sinσ)*(-3+4*cos2σM*cos2σM)));
        σʹ = σ;
        σ = s / (b*A) + Δσ;
    } while (Math.abs(σ-σʹ) > 1e-12 && ++iterations<100);
    if (iterations >= 100) throw new Error('Formula failed to converge'); // not possible!

    let x = sinU1*sinσ - cosU1*cosσ*cosα1;
    let φ2 = Math.atan2(sinU1*cosσ + cosU1*sinσ*cosα1, (1-f)*Math.sqrt(sinα*sinα + x*x));
    let λ = Math.atan2(sinσ*sinα1, cosU1*cosσ - sinU1*sinσ*cosα1);
    let C = f/16*cosSqα*(4+f*(4-3*cosSqα));
    let L = λ - (1-C) * f * sinα *
        (σ + C*sinσ*(cos2σM+C*cosσ*(-1+2*cos2σM*cos2σM)));
    let λ2 = (λ1+L+3*Math.PI)%(2*Math.PI) - Math.PI;  // normalise to -180..+180

    let α2 = Math.atan2(sinα, -x);
    α2 = (α2 + 2*Math.PI) % (2*Math.PI); // normalise to 0..360

    return {
      lat: this.toDegrees(φ2),
      lon: this.toDegrees(λ2)
    }
  }

  private toText(alert: AlertDetail, min: number|string): string {
    let description  = alert.eventDescription,
        issuedDate   = new Date(alert.issueTimeLocal),
        expiresDate  = new Date(alert.expireTimeLocal),
        issuedAt     = issuedDate.toLocaleTimeString().replace(/:\d{2} /, ' '),
        expiresAt    = expiresDate.toLocaleTimeString().replace(/:\d{2} /, ' '),
        aOrAn        = null !== description.match(/^[aeiou].*/) ? 'An' : 'A',
        in_your_area = 0 === min ? 'in your immediate area ' : '',
        time_to_area = 0 === min ? '' : `You will reach the affected area in
            approximately ${min} minutes. `;
    return `${aOrAn} ${description} was issued at ${issuedAt} that will be in
            effect ${in_your_area}until ${expiresAt}. ${time_to_area}This is a potentially dangerous
            situation. Please drive carefully.`;
  } 

}
