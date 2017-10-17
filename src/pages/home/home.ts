import { Component, NgZone } from '@angular/core';
import { NavController, Platform, Events, AlertController } from 'ionic-angular';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { WeatherApiProvider, AlertDetail } from '../../providers/weather-api/weather-api';
import { WatsonApiProvider, Translation } from '../../providers/watson-api/watson-api';
import { SettingsProvider } from '../../providers/settings/settings';
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
  private target: string;
  private voice: string;
  private isDisabled: boolean = false;
  private recogPermitted: boolean = false;
  private geoEnabled: boolean = false;

  constructor(
    public navCtrl: NavController,
    public weather: WeatherApiProvider,
    public geo: Geolocation,
    public watson: WatsonApiProvider,
    public platform: Platform,
    public settings: SettingsProvider,
    public events: Events,
    public alerts: AlertController,
    public zone: NgZone,
    public sr: SpeechRecognition,
    public perms: AndroidPermissions
  ) {
    this.onResume = platform.resume.subscribe(() => {
      // this.checkWeather();
    });
    settings.getLanguage().then((lang: string) => {
      this.target = lang;
    });
    settings.getVoice().then((v: string) => {
      if (null !== v) {
        this.voice = v;
      }
    });
    // monitor the language for changes
    events.subscribe('language:changed', (lang: string) => {
      this.target = lang;
    });
    events.subscribe('voice:changed', (v: string) => {
      this.voice = v;
    });
    events.subscribe('utteranceStarted', () => {
      this.isDisabled = true;
    });
    events.subscribe('utteranceEnded', () => {
      // force change detection in the view
      this.zone.run(() => {
        this.isDisabled = false;
      });
    });
    events.subscribe('recordingOK', (isPermitted: boolean) => {
      this.zone.run(() => {
        this.recogPermitted = isPermitted;
      });
    });
  }

  ionViewDidLoad() {
    // check and request Android permissions if necessary
    this.sr.isRecognitionAvailable().then(
      (isAvailable: boolean) => {
        if(isAvailable) {
          this.sr.requestPermission().then(
            () => {
              this.events.publish('recordingOK', true);
              this.geo.getCurrentPosition().then(
                (geo: Geoposition) => {
                  this.geoEnabled = true;
                  this.checkWeather();
                },
                (err: any) => {
                  this.geoEnabled = true;
                  this.checkWeather();
                }
              );
            },
            () => {
              this.events.publish('recordingOK', false);
            }
          );
        }
      }
    );
  }

  checkWeather() {
    if (this.geoEnabled) {
      this.geo.getCurrentPosition().then(
        (pos: Geoposition) => {
          this.events.subscribe('utteranceEnded', this.rateDanger );
          // if speed < 45 mph (20.1168 mps)
          if ( null === pos.coords.speed || pos.coords.speed < 20.1168 ) {
            // moving slowly (or not at all) so get local nowcast
            this.weather.getAlerts(pos.coords.latitude, pos.coords.longitude).subscribe(
              (alerts: AlertDetail[]) => {
                let msg = '';
                if (alerts.length > 0) {
                  let add_s = alerts.length > 1 ? 'alerts' : 'alert',
                      is_or_are = alerts.length > 1 ? 'are' : 'is';
                  msg = `There ${is_or_are} ${alerts.length} ${add_s} near you. `;
                  // loop through the list of alerts
                  for (let i = 0; i < alerts.length; i += 1) {
                    msg += this.toText(alerts[i], 0);
                  }
                } else {
                  // all clear; no alerts
                  msg = "There does not appear to be any dangerous weather near you right now.";
                }
                this.synthesize(msg);
              },
              (err: any) => {
                // handle error getting alerts
              }
            );
          } else {
            // we are moving; get alerts for 15 minutes out
            let position = this.getTargetPoint(pos, 15 );
            // get alerts for all three positions
            this.weather.getAlerts(position.lat, position.lon).subscribe(
              (alerts: AlertDetail[]) => {
                let msg = '';
                if (alerts.length > 0) {
                  let add_s = alerts.length > 1 ? 'alerts' : 'alert',
                      is_or_are = alerts.length > 1 ? 'are' : 'is';
                  msg = `There ${is_or_are} ${alerts.length} ${add_s} ahead of you. `;
                  // loop through the list of alerts
                  for (let i = 0; i < alerts.length; i += 1) {
                    msg += this.toText(alerts[i], 15);
                  }
                } else {
                  // all clear; no alerts
                  msg = "You do not appear to be approaching any dangerous weather right now.";
                }
                this.synthesize(msg);
              },
              (err: any) => {
                // handle error getting alerts
              }
            );
          }
        }
      ).catch(
        err => {
        }
      );
    }
  }

  ionViewDidEnter() {
    this.checkWeather();
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
            situation. Please drive carefully. `;
  }

  private rateDanger = () => {
    this.events.unsubscribe('utteranceEnded', this.rateDanger );
    if (this.recogPermitted) {
      let question = "On a scale from 1 to 10, with 10 being most dangerous, how dangerous does the weather look to you right now?";
      this.events.subscribe('utteranceEnded', this.getResponse );
      this.synthesize(question);
    }
  }

  private getResponse = () => {
    this.events.unsubscribe('utteranceEnded', this.getResponse);
    this.sr.startListening({language: this.target, showPopup: false}).subscribe(
      (matches: string[]) => {
        let rating = matches[0].match(/\d+/);
        if (null !== rating) {
          let response = `You rated the danger of this weather as a ${rating}. `;
          if (+rating <= 5) {
            response += `You know, most people rate the danger of this weather as a 6 or 7. You might want to drive a bit more carefully`;
          } else {
            response += `That is about the same as other people rate it. Drive carefully.`;
          }
          this.synthesize(response);
        } else {
          this.synthesize("Sorry, I didn't understand your rating. Please try again.");
          this.getResponse();
        }
      },
      (err: any) => {
          this.synthesize("Sorry, I had a problem hearing what you said.");
      }
    );
  }

  private synthesize(text: string, source: string = 'en', target: string = this.target) {
    if (source !== target) {
      this.watson.translate(text, source, target).subscribe((t: Translation) => {
        this.watson.synthesize(t.translations[0].translation, this.voice);
      });
    } else {
      this.watson.synthesize(text, this.voice);
    }
  }

  /**
   * Mock responses below. Remove after demo.
   */

  swipeleft(e) {
    this.getMockAlerts(15);
  }
  swiperight(e) {
    this.getMockAlerts(0);
  }

  checkMockWeather() {
    this.preventSimpleClick = true;
    clearTimeout(this.timer);
  }

  getMockAlerts(distance: number) {
    this.weather.getMockAlerts().subscribe(
      (alerts: AlertDetail[]) => {
        let msg = '';
        if (alerts.length > 0) {
          let add_s = alerts.length > 1 ? 'alerts' : 'alert',
              is_or_are = alerts.length > 1 ? 'are' : 'is';
          msg = `There ${is_or_are} ${alerts.length} ${add_s} near you. `;
          // loop through the list of alerts
          for (let i = 0; i < alerts.length; i += 1) {
            msg += this.toText(alerts[i], distance);
          }
        } else {
          // all clear; no alerts
          msg = "There does not appear to be any dangerous weather near you right now.";
        }
        this.synthesize(msg);
      },
      (err: any) => {
        // handle error getting alerts
      }
    );
  }
}
