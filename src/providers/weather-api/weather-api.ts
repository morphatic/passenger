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
  adminDistrictCode?: string;
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

  // private messages = {
  //   flood: `Turn around. Don't drown. Over half of all flood-related drownings occur when a
  //           vehicle is driving into hazardous flood water. People underestimate the power
  //           of water. A mere twelve inches of rushing water is enough to carry away a small
  //           car. It is never safe to drive or walk into flood waters.`
  // };

  private mock: WeatherHeadlines = {
      "metadata": {
        "next": null
      },
      "alerts": [
        {
            "detailKey": "50d57e56-3dbe-3afc-b5c3-7c8fb697895e",
            "messageTypeCode": 1,
            "messageType": "New",
            "productIdentifier": "FFA",
            "phenomena": "FF",
            "significance": "A",
            "eventTrackingNumber": "0001",
            "officeCode": "KPQR",
            "officeName": "Portland",
            "officeAdminDistrict": "Oregon",
            "officeAdminDistrictCode": "OR",
            "officeCountryCode": "US",
            "eventDescription": "Flash Flood Warning",
            "severityCode": 3,
            "severity": "Moderate",
            "categories": [
                {
                    "category": "Met",
                    "categoryCode": 2
                }
            ],
            "responseTypes": [
                {
                    "responseType": "Avoid",
                    "responseTypeCode": 5
                }
            ],
            "urgency": "Unknown",
            "urgencyCode": 5,
            "certainty": "Unknown",
            "certaintyCode": 5,
            "effectiveTimeLocal": "2017-09-17T16:00:00-07:00",
            "effectiveTimeLocalTimeZone": "PDT",
            "expireTimeLocal": "2017-09-18T02:00:00-07:00",
            "expireTimeLocalTimeZone": "PDT",
            "expireTimeUTC": 1505725200,
            "onsetTimeLocal": "2017-09-17T16:00:00-07:00",
            "onsetTimeLocalTimeZone": "PDT",
            "flood": {
                "floodLocationId": "00000",
                "floodLocationName": "N/A",
                "floodSeverityCode": "0",
                "floodSeverity": "N/A",
                "floodImmediateCauseCode": "ER",
                "floodImmediateCause": "Excessive Rainfall",
                "floodRecordStatusCode": "OO",
                "floodRecordStatus": "N/A",
                "floodStartTimeLocal": null,
                "floodStartTimeLocalTimeZone": null,
                "floodCrestTimeLocal": null,
                "floodCrestTimeLocalTimeZone": null,
                "floodEndTimeLocal": null,
                "floodEndTimeLocalTimeZone": null
            },
            "areaTypeCode": "Z",
            "latitude": 45.63,
            "longitude": -122.07,
            "areaId": "WAZ045",
            "areaName": "Western Columbia River Gorge",
            "ianaTimeZone": "America/Los_Angeles",
            "adminDistrictCode": "WA",
            "adminDistrict": "Washington",
            "countryCode": "US",
            "countryName": "UNITED STATES OF AMERICA",
            "headlineText": "Flash Flood Warning from SUN 4:00 PM PDT until MON 2:00 AM PDT",
            "source": "National Weather Service",
            "disclaimer": null,
            "issueTimeLocal": "2017-09-17T03:49:00-07:00",
            "issueTimeLocalTimeZone": "PDT",
            "identifier": "962089e581e645207b2a491b6cf02d03",
            "processTimeUTC": 1505645355
        },
        {
          "detailKey": "ff3cdf1b-27cf-3fa8-8958-8a714f7ace4a",
          "messageTypeCode": 2,
          "messageType": "Update",
          "productIdentifier": "RFW",
          "phenomena": "FW",
          "significance": "W",
          "eventTrackingNumber": "0008",
          "officeCode": "KMTR",
          "officeName": "San Francisco/Monterey",
          "officeAdminDistrict": "California",
          "officeAdminDistrictCode": "CA",
          "officeCountryCode": "US",
          "eventDescription": "Red Flag Warning",
          "severityCode": 2,
          "severity": "Severe",
          "categories": [
              {
                  "category": "Met",
                  "categoryCode": 2
              }
          ],
          "responseTypes": [
              {
                  "responseType": "Prepare",
                  "responseTypeCode": 3
              }
          ],
          "urgency": "Expected",
          "urgencyCode": 2,
          "certainty": "Likely",
          "certaintyCode": 2,
          "effectiveTimeLocal": null,
          "effectiveTimeLocalTimeZone": null,
          "expireTimeLocal": "2017-10-15T08:00:00-07:00",
          "expireTimeLocalTimeZone": "PDT",
          "expireTimeUTC": 1508079600,
          "onsetTimeLocal": null,
          "onsetTimeLocalTimeZone": null,
          "flood": null,
          "areaTypeCode": "Z",
          "latitude": 38.62,
          "longitude": -122.3,
          "areaId": "CAZ507",
          "areaName": "North Bay Mountains",
          "ianaTimeZone": "America/Los_Angeles",
          "adminDistrictCode": "CA",
          "adminDistrict": "California",
          "countryCode": "US",
          "countryName": "UNITED STATES OF AMERICA",
          "headlineText": "Red Flag Warning until SUN 8:00 AM PDT",
          "source": "National Weather Service",
          "disclaimer": null,
          "issueTimeLocal": "2017-10-14T17:07:00-07:00",
          "issueTimeLocalTimeZone": "PDT",
          "identifier": "95d5cf4df73b2ef022db72328e7a44b2",
          "processTimeUTC": 1508026058
        },
        {
          "detailKey": "65782c9e-fa5a-3804-8172-c481b860dba7",
          "messageTypeCode": 2,
          "messageType": "Update",
          "productIdentifier": "RFW",
          "phenomena": "FW",
          "significance": "W",
          "eventTrackingNumber": "0003",
          "officeCode": "KSGX",
          "officeName": "San Diego",
          "officeAdminDistrict": "California",
          "officeAdminDistrictCode": "CA",
          "officeCountryCode": "US",
          "eventDescription": "Red Flag Warning",
          "severityCode": 2,
          "severity": "Severe",
          "categories": [
              {
                  "category": "Met",
                  "categoryCode": 2
              }
          ],
          "responseTypes": [
              {
                  "responseType": "Prepare",
                  "responseTypeCode": 3
              }
          ],
          "urgency": "Expected",
          "urgencyCode": 2,
          "certainty": "Likely",
          "certaintyCode": 2,
          "effectiveTimeLocal": null,
          "effectiveTimeLocalTimeZone": null,
          "expireTimeLocal": "2017-10-15T12:00:00-07:00",
          "expireTimeLocalTimeZone": "PDT",
          "expireTimeUTC": 1508094000,
          "onsetTimeLocal": null,
          "onsetTimeLocalTimeZone": null,
          "flood": null,
          "areaTypeCode": "Z",
          "latitude": 34.21,
          "longitude": -117.06,
          "areaId": "CAZ255",
          "areaName": "San Bernardino County Mountains-Including The Mountain Top And Front Country Ranger Districts Of The San Bernardino National Forest",
          "ianaTimeZone": "America/Los_Angeles",
          "adminDistrictCode": "CA",
          "adminDistrict": "California",
          "countryCode": "US",
          "countryName": "UNITED STATES OF AMERICA",
          "headlineText": "Red Flag Warning until SUN 12:00 PM PDT",
          "source": "National Weather Service",
          "disclaimer": null,
          "issueTimeLocal": "2017-10-14T14:34:00-07:00",
          "issueTimeLocalTimeZone": "PDT",
          "identifier": "93de91c083ca4904430a058441543b87",
          "processTimeUTC": 1508016873
        }
      ]
  };

  constructor(public http: Http) {}

  getAlerts(lat: string|number, lon: string|number): Observable<AlertDetail[]> {
    let query = new URLSearchParams();
    query.set('geocode', `${lat},${lon}`);
    query.set('format', 'json');
    query.set('language', 'en-US');
    query.set('apiKey', ENV.weather.api_key);
    return this.http.get(ENV.weather.alert_headline, {search: query})
                    // if 204 is res.status, return empty WeatherHeadlines object
                    .map((res: Response): AlertDetail[] => {
                      if(204 === res.status) {
                        let alerts: AlertDetail[] = []
                        return alerts;
                      } else {
                        return res.json().alerts.filter((alert: AlertDetail) => this.is_interesting(alert.eventDescription))
                      }
                    })
                    .catch((error: any) => Observable.throw(error.json().error || 'Error getting headlines'));
  }

  getMockAlerts() {
    return Observable.of(this.mock.alerts);
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
      'Fire Warning',
      'Red Flag Warning'
      // 'Special Weather Statement'
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
