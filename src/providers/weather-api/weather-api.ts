import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import { ENV } from '@app/env';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

export interface AlertDetail {
  detailKey: string;
  messageTypeCode: number;
  messageType: string;
  productIdentifier: string;
  phenomena: string;
  significance: string;
  eventTrackingNumber: string;
  officeCode: string;
  officeName?: string;
  officeAdminDistrict?: string;
  officeAdminDistrictCode?: string;
  officeCountryCode?: string;
  eventDescription: string;
  severityCode: number;
  severity: string;
  categories: {
    category: string;     // geo, met, safety, security, rescue, fire, health, env, transport, infra, CBRNE, other
    categoryCode: number; // values: 1-12
  }[];
  responseTypes: {
    responseType: string;     // shelter, evacuate, prepare, execute, avoid, monitor, assess, allclear, none
    responseTypeCode: number; // values: 1-9
  }[];
  urgency: string;
  urgencyCode: number;
  certainty: string;
  certaintyCode: number;
  effectiveTimeLocal?: string;
  effectiveTimeLocalTimeZone?: string;
  expireTimeLocal: string; // yyyy-mm-ddThh:mm:ss-hh:mm (DateTimeString)
  expireTimeLocalTimeZone: string; // e.g. "EDT"
  expireTimeUTC: number; // timestamp
  onsetTimeLocal?: string;
  onsetTimeLocalTimeZone?: string;
  flood?: {
    floodCrestTimeLocal?: string;
    floodCrestTimeLocalTimeZone?: string;
    floodEndTimeLocal?: string;
    floodEndTimeLocalTimeZone?: string;
    floodImmediateCause?: string;
    floodImmediateCauseCode?: string;
    floodLocationId?: string;
    floodLocationName?: string;
    floodRecordStatus?: string;
    floodRecordStatusCode?: string;
    floodSeverity?: string;
    floodSeverityCode?: string;
    floodStartTimeLocal?: string;
    floodStartTimeLocalTimeZone?: string;
  };
  areaTypeCode: string;
  latitude?: number;
  longitude?: number;
  areaId: string;
  areaName: string;
  ianaTimeZone: string;
  adminDistrictcode?: string;
  adminDistrict?: string;
  countryCode: string;
  countryName: string;
  headlineText: string;
  source: string;
  disclaimer?: string;
  issueTimeLocal: string;
  issueTimeLocalTimeZone: string;
  identifier: string;
  processTimeUTC: number;
  texts?: {
    languageCode?: string;
    description?: string;
    instruction?: string;
    overview?: string;
  }[];
  polygon?: {
    lat: number;
    lon: number;
  }[];
  synopsis?: string;
}

export interface WeatherAlert {
  alertDetail: AlertDetail;
}

export interface WeatherHeadlines {
  metadata: {
    next?: number;
  };
  alerts: AlertDetail[];
}

@Injectable()
export class WeatherApiProvider {

  private messages = {
    flood: `Turn around. Don't drown. Over half of all flood-related drownings occur when a
            vehicle is driving into hazardous flood water. People underestimate the power
            of water. A mere twelve inches of rushing water is enough to carry away a small
            car. It is never safe to drive or walk into flood waters.`
  };

  constructor(public http: Http) {}

  public getAlert(lat: string|number, lon: string|number): Observable<WeatherAlert> {
    return this.getHeadlines(lat, lon).flatMap((hl: WeatherHeadlines) => {
      if (hl) {
        let query = new URLSearchParams();
        query.set('apiKey', ENV.weather.api_key);
        query.set('format', 'json');
        query.set('language', 'en-US');
        for ( let i = 0; i < hl.alerts.length; i += 1 ) {
          if ( this.is_interesting( hl.alerts[i].eventDescription ) ) {
            query.set('alertId', hl.alerts[i].detailKey);
            return this.http.get(ENV.weather.alert_detail, {search: query})
                            .map((res: Response): WeatherAlert => res.json())
                            .catch((error: any) => Observable.throw(error.json().error || 'Error getting alert detail'))
          }
        }
      }
      return Observable.empty<WeatherAlert>();
    });
  }

  private getHeadlines(lat: string|number, lon: string|number): Observable<WeatherHeadlines> {
    let query = new URLSearchParams();
    query.set('geocode', `${lat},${lon}`);
    query.set('format', 'json');
    query.set('language', 'en-US');
    query.set('apiKey', ENV.weather.api_key);
    return this.http.get(ENV.weather.alert_headline, {search: query})
                    .map((res: Response): WeatherHeadlines => res.json())
                    .catch((error: any) => Observable.throw(error.json().error || 'Error getting headlines'));
  }

  private is_interesting = (event: string): boolean => {
    const INTERESTING_EVENTS = [     // more stars == more important
      'Coastal Flood Warning',
      'Lakeshore Flood Warning',
      'Storm Surge Warning',
      'Flash Flood Warning',         // ***
      'Shelter In Place Warning',    // **
      'Severe Thunderstorm Warning', // ***
      'Severe Weather Warning',      // not sure what this is...
      'Flood Warning',
      'River Flood Warning',
      'Hurricane Warning',           // *
      'Tropical Storm Warning',      // *
      'Tornado Warning',             // ***
      'Winter Storm Warning',        // *
      'Blizzard Warning',            // *
      'Ice Storm Warning',
      'Lake Effect Snow Warning',
      'Special Weather Statement'
    ];
    let result = false;
    for ( let i = 0; i < INTERESTING_EVENTS.length; i+= 1 ) {
      if (event.toLowerCase() === INTERESTING_EVENTS[i].toLowerCase() ) {
        result = true;
        break;
      }
    }

    return result;
  }

}
