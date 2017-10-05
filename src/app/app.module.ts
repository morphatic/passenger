import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar    } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Geolocation  } from '@ionic-native/geolocation';
import { File         } from '@ionic-native/file';
import { FileTransfer } from '@ionic-native/file-transfer';
import { Media        } from '@ionic-native/media';

import { ENV } from '@app/env'; console.log(ENV.mode);
import { WeatherApiProvider } from '../providers/weather-api/weather-api';
import { WatsonApiProvider } from '../providers/watson-api/watson-api';

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    HomePage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    HomePage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    WeatherApiProvider,
    Geolocation,
    WatsonApiProvider,
    File,
    FileTransfer,
    Media
  ]
})
export class AppModule {}
