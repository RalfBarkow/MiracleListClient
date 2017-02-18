import { Title } from '@angular/platform-browser';
import { Component, OnInit, NgZone } from '@angular/core';
// Dienste
import { MiracleListProxy } from '../Services/MiracleListProxy';
import { CommunicationService } from '../Services/CommunicationService'
// für Modalfenster
import { ViewContainerRef } from '@angular/core';
import { Overlay } from 'angular2-modal';
import { Modal } from 'angular2-modal/plugins/bootstrap';

// MomentJS
import * as moment from 'moment';

// Importe für Elektron

// import { remote, ipcRenderer }  from "electron"; // geht nicht. FEHLER: fs.existsSync is not a function vgl. http://stackoverflow.com/questions/41785295/fs-module-fails-when-integrating-electron-into-angular-project
declare var electron: any;
declare var Notification: any;
// Versionsnummer auslesen
var pckg = require('../../package.json');

@Component({
    selector: 'Start',
    templateUrl: './Start.component.html'
})


export class StartComponent implements OnInit {

    constructor(private miracleListProxy: MiracleListProxy, private communicationService: CommunicationService, overlay: Overlay, vcr: ViewContainerRef, public modal: Modal, private titleService: Title, private zone: NgZone) {
        overlay.defaultViewContainer = vcr;
        console.log("StartComponent:ctor", typeof electron, this.getElectronVersion());

    }

    ngOnInit() {
        console.log("======= LoginComponent:ngOnInit");
        console.log("Anwendung: " + pckg.name);
        console.log("Version: " + pckg.version + " vom " + pckg.date);
        console.log("Sprache: " + (<any>moment().localeData())._abbr);
        console.log("StartComponent:ngOnInit", typeof electron, this.getElectronVersion());

        // Electron-IPC-Events behandeln
        if (typeof electron != "undefined") {
            console.log("!!!! Registriere mehrere electron-Event-Handler...");
            electron.ipcRenderer.on('about', (event, data) => {
                this.zone.run(() => {  // für Electron: siehe http://stackoverflow.com/questions/41254904/angular-2-change-detection-breaks-down-with-electron
                    console.log("!!! Nachricht von MAIN-Prozess geht ein", this);
                    this.about();
                });

            });
            electron.ipcRenderer.on('logout', (event, data) => {
                this.zone.run(() => { // für Electron: siehe http://stackoverflow.com/questions/41254904/angular-2-change-detection-breaks-down-with-electron
                    console.log("!!! Nachricht von MAIN-Prozess geht ein", this);
                    this.logout();
                });
            });
        }
    }



    get isLoggedIn(): boolean {
        return (this.communicationService.username != null && this.communicationService.username != "")
    }

    about() {
        console.log(this.modal);
        this.modal.alert()
            .size('lg')
            .showClose(true)
            .title('Über die Anwendung MiracleList')
            .body(`
            <h4>Dies ist eine Beispielanwendung für eine Cross-Platform-Anwendung auf Basis einer Single-Page-Webapplication (SPA). MiracleList dient der Aufgabenverwaltung.</h4>
            <div>Autor: Dr. Holger Schwichtenberg, <a href="http://www.IT-Visions.de">www.IT-Visions.de</a></div>
            <div>Version: ${pckg.version} vom ${pckg.date}</div>
     
            <h5>Webadressen:</h5>
            <ul>
              <li>Backend: <a href="https://miraclelistbackend.azurewebsites.net">https://miraclelistbackend.azurewebsites.net</a></li>
                <li>Web-Frontend: <a href="http://www.miraclelist.net">http://www.miraclelist.net</a></li>
                <li>Windows-Client: <a href="https://Miraclelist.azurewebsites.net/download/MiracleListElectron-win32-x64.rar">https://Miraclelist.azurewebsites.net/download/MiracleListElectron-win32-x64.rar</a></li>
                <li>MacOS-Client: <a href="https://Miraclelist.azurewebsites.net/download/MiracleListElectron-darwin-x64.rar">https://Miraclelist.azurewebsites.net/download/MiracleListElectron-darwin-x64.rar</a></li>
                <li>Linux-Client: <a href="https://Miraclelist.azurewebsites.net/download/MiracleListElectron-linux-x64.rar">https://Miraclelist.azurewebsites.net/download/MiracleListElectron-linux-x64.rar</a></li>
                <li>Quellcode Frontend: <a href="https://github.com/HSchwichtenberg/MiracleListClient">https://github.com/HSchwichtenberg/MiracleListClient</a></li>
        
            </ul>
            <h5>Eingesetzte Techniken:</h5>
            <ul>
                <li>Backend: .NET Core, C#, ASP.NET Core WebAPI, Entity Framework Core, SQL Azure, Azure Web App, Swagger</li>
                <li>Frontend: HTML, CSS, TypeScript, Angular, Bootstrap, MomentJS, angular2-moment, angular2-contextmenu, angular2-modal, Electron, Cordova</li>
            </ul></h5>
            <h5>Versionsgeschichte:</h5>
            <ul>
                <li>0.1: Basisversion mit Aufgaben anlegen und bearbeiten</li>
                <li>0.2: Benutzerverwaltung, Kategorien verwalten</li>
                <li>0.3: Suchfunktion, fällige Aufgaben</li>
                <li>0.4: Aufwand zu einer Aufgabe erfassbar</li>
                <li>0.5: Electron-Client</li>
            </ul>
            <h5>Systeminfo:</h5>
            <ul>
                <li>Angemelderter Benutzer: ${this.isLoggedIn ? this.communicationService.username + " (Token:" + this.communicationService.token + ")" : ""}</li>
                <li>Browser: ${navigator.userAgent}</li>
                <li>Electron-Version: ${this.getElectronVersion()}</li>
                <li>Spracheinstellungen: Anwendung: ${(<any>moment().localeData())._abbr + " / Browser: " + window.navigator.language}</li>
            </ul>`
            )
            .open();
        // this.appRef.tick(); // das wird für Electron gebraucht, weil Angular sich sonst nicht richtig aktualisiert!
    }

    getElectronVersion(): string {
        if (typeof electron == "undefined") return "n/a";



        return (<any>electron.remote.getCurrentWindow()).version;
    }

    logout() {
        console.log("logout");
        this.miracleListProxy.logoff(this.communicationService.token).subscribe(x => {
            console.log("logoff: OK!")
            this.communicationService.token = "";
            this.communicationService.username = "";
            this.titleService.setTitle("MiracleListClient");
            this.communicationService.navigate(""); // Ansicht aufrufen
            // this.appRef.tick(); // das wird für Electron gebraucht, weil Angular sich sonst nicht richtig aktualisiert!
            // HTML5 Notification API
            let myNotification = new Notification('MiracleList', {
                body: 'Sie wurden abgemeldet!'
            })
        });

    }
}