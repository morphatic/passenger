import { Component } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Globalization } from '@ionic-native/globalization';
import { TranslateService } from '@ngx-translate/core';
import { SettingsProvider } from '../providers/settings/settings';

import { TabsPage } from '../pages/tabs/tabs';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage:any = TabsPage;

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    translation: TranslateService,
    global: Globalization,
    settings: SettingsProvider,
    events: Events
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      // set the default language for translations
      translation.setDefaultLang(settings.defaultLanguage);

      // check for previously set language
      settings.getLanguage().then((lang: any) => {
        // if lang is already in settings
        if (null !== lang) {
          translation.use(lang); // use it
        } else {
          // setting language for the first time
          // check to see if we're in browser or app
          if ((<any>window).cordova) {
            // it's an app, use Globalization to get preferred lang
            global.getPreferredLanguage().then((pl: any) => {
              pl = settings.getAvailable(pl.value);
              settings.setLanguage(pl);
              translation.use(pl);
            });
          } else {
            // it's a browser, get the browser's language
            let bl = translation.getBrowserLang() || settings.defaultLanguage;
            bl = settings.getAvailable(bl);
            settings.setLanguage(bl);
            translation.use(bl);
          }
        }
      });

      // monitor the language for changes
      events.subscribe('language:changed', (lang: string) => {
        translation.use(lang);
      });

      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}
