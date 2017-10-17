import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicStorageModule } from '@ionic/storage';
import { MyApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { HomePage } from '../pages/home/home';
import { SettingsPage } from '../pages/settings/settings';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar          } from '@ionic-native/status-bar';
import { SplashScreen       } from '@ionic-native/splash-screen';
import { Geolocation        } from '@ionic-native/geolocation';
import { Globalization      } from '@ionic-native/globalization';
import { File               } from '@ionic-native/file';
import { FileTransfer       } from '@ionic-native/file-transfer';
import { Media              } from '@ionic-native/media';
import { SpeechRecognition  } from '@ionic-native/speech-recognition';
import { AndroidPermissions } from '@ionic-native/android-permissions';

import { WeatherApiProvider } from '../providers/weather-api/weather-api';
import { WatsonApiProvider } from '../providers/watson-api/watson-api';
import { SettingsProvider } from '../providers/settings/settings';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    HomePage,
    SettingsPage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    HomePage,
    SettingsPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    WeatherApiProvider,
    Geolocation,
    Globalization,
    WatsonApiProvider,
    File,
    FileTransfer,
    Media,
    SettingsProvider,
    SpeechRecognition,
    AndroidPermissions
  ]
})
export class AppModule {}
