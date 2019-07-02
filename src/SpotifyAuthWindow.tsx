import React, {Component} from 'react';
import ReactDOM from "react-dom";
import {SpotifyAccess} from "./SpotifyAccess";

interface ISpotifyAuthWindowProps {
    token: string;
    access: SpotifyAccess;
}

export default class SpotifyAuthWindow extends Component <ISpotifyAuthWindowProps> {

    private externalWindow: Window|null;
    private containerEl: HTMLDivElement;

    constructor(props: any) {
        super(props);
        this.containerEl = document.createElement('div');
        this.externalWindow = null;
    }

    public componentDidMount(): void {

        if (this.props.access===SpotifyAccess.NOT_REQUESTED) {
            this.externalWindow = window.open("https://accounts.spotify.com/authorize?" +
                "client_id=" +
                "&response_type=token" +
                "&redirect_uri=http://localhost:3000" +
                "&show_dialog=true"+
                "&scope=streaming user-read-birthdate user-read-email user-read-private", '', "width=600, height=500");

            this.externalWindow&&this.externalWindow.addEventListener("beforeunload", ()=>{
                localStorage.setItem("spotifyAccess", SpotifyAccess.DENIED);
                console.log("closed external window");
            });
            //this.externalWindow && this.externalWindow.document.body.appendChild(this.containerEl);
        } else {
            console.log("mounting auth window with props ", this.props);
            if (this.props.access === SpotifyAccess.DENIED) {
                console.log("changin storage");
                localStorage.setItem("spotifyAccess", SpotifyAccess.DENIED);
            } else if (this.props.token!=="") {
                localStorage.setItem("spotifyAuthToken", this.props.token);
                localStorage.setItem("spotifyAccess", SpotifyAccess.ALLOWED);
            }

            window.close();
        }
    }


    public render () {

        return ReactDOM.createPortal(this.props.children, this.containerEl);
    }
}
