import React, {Component} from 'react';
import {ScriptCache} from "./ScriptCache";
import SpotifyAuthWindow from "./SpotifyAuthWindow";
import {SpotifyAccess} from "./SpotifyAccess";
import {getSpotifyAccess, getSpotifyAccessToken} from "./LocalStorageData";
import {FaPause, FaPlay} from "react-icons/fa";

interface ISpotifyPlayerProps {
    playingRecordingId: string;
}

interface ISpotifyPlayerState {
    loadingState: string;
    spotifyAccessToken: string;
    spotifyAccess: SpotifyAccess;
    spotifyDeviceId: string;
    spotifySDKLoaded: boolean,
    spotifyAuthorizationGranted: boolean,
    spotifyPlayerConnected: boolean,
    spotifyPlayerReady: boolean,
    spotifyPlayer: Spotify.SpotifyPlayer | undefined,
    playbackOn: boolean,
    playbackPaused: boolean
}

class SpotifyPlayerContainer extends Component <ISpotifyPlayerProps, ISpotifyPlayerState> {

    public constructor(props: ISpotifyPlayerProps) {
        super(props);

        new ScriptCache([
            {
                name: "https://sdk.scdn.co/spotify-player.js",
                callback: this.spotifySDKCallback
            }]);

        window.addEventListener("storage", this.authorizeSpotifyFromStorage);

        this.state = {
            loadingState: "loading scripts",
            spotifyAccessToken: "",
            spotifyDeviceId: "",
            spotifyAuthorizationGranted: false,
            spotifyPlayerConnected: false,
            spotifyPlayerReady: false,
            spotifySDKLoaded: false,
            spotifyPlayer: undefined,
            spotifyAccess: SpotifyAccess.NOT_REQUESTED,
            playbackOn: false,
            playbackPaused: false
        };


    }

    private spotifySDKCallback = () => {
        window.onSpotifyWebPlaybackSDKReady = () => {

            if (this.state.spotifyAccess !== SpotifyAccess.DENIED) {
                const spotifyPlayer = new Spotify.Player({
                    name: 'React Spotify Player',
                    getOAuthToken: cb => {
                        cb(this.state.spotifyAccessToken);
                    }
                });


                // Error handling
                spotifyPlayer.addListener('initialization_error', ({message}) => {
                    console.error(message);
                });
                spotifyPlayer.addListener('authentication_error', ({message}) => {
                    console.error(message);
                });
                spotifyPlayer.addListener('account_error', ({message}) => {
                    console.error(message);
                });
                spotifyPlayer.addListener('playback_error', ({message}) => {
                    console.error(message);
                });

                // Playback status updates
                spotifyPlayer.addListener('player_state_changed', state => {
                    console.log(state);
                });

                // Ready
                spotifyPlayer.addListener('ready', ({device_id}) => {
                    console.log('Ready with Device ID', device_id);
                    this.setState({
                        loadingState: "spotify player ready",
                        spotifyDeviceId: device_id
                    });
                    this.playTrack(this.props.playingRecordingId);
                });

                // Not Ready
                spotifyPlayer.addListener('not_ready', ({device_id}) => {
                    console.log('Device ID has gone offline', device_id);
                });

                this.setState({
                    loadingState: "spotify scripts loaded",
                    spotifyPlayer
                });

            } else {
                this.setState({loadingState: "spotify authorization rejected"});
            }
        }

    }

    private authorizeSpotifyFromStorage = (e: any) => {
        console.log("storage change ");
        const spotifyAccessToken = getSpotifyAccessToken();
        const spotifyAccess = getSpotifyAccess();

        if (spotifyAccess === SpotifyAccess.DENIED) {
            this.setState({
                spotifyAccess: SpotifyAccess.DENIED,
                loadingState: "spotify access denied"
            });
        } else if (spotifyAccessToken !== null) {
            this.setState({
                spotifyAccessToken: spotifyAccessToken,
                spotifyAccess: SpotifyAccess.ALLOWED,
                loadingState: "spotify token retrieved"
            });

            fetch("https://api.spotify.com/v1/me", {
                method: "GET",
                headers: {
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            })
                .then(response => {
                    console.log("authorization granted ", response);

                    if (response.body) {
                        const reader = response.body.getReader();
                        reader.read().then(({done, value}) => {
                            if (done) {
                                return;
                            }
                        });
                    }

                    this.setState({
                        loadingState: "authorisation granted"
                    });
                    console.log("spotify player ", this.state.spotifyPlayer);
                    this.state.spotifyPlayer && this.state.spotifyPlayer.connect().then((ev: any) => {
                        this.setState({loadingState: "connected to player"});
                    });
                })
                .catch((error) => {
                    console.log("authorization fetch error", error);
                });
        }
    }

    private playTrack = (spotify_uri: string) => {
        fetch("https://api.spotify.com/v1/me/player/play?device_id=" + this.state.spotifyDeviceId, {
            method: 'PUT',
            body: JSON.stringify({uris: [spotify_uri]}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.state.spotifyAccessToken}`
            },
        }).then((ev) => {
            console.log(ev);
            if (ev.status === 403) {
                this.setState({
                    loadingState: "you need to upgrade to premium for playback",
                    spotifyAccess: SpotifyAccess.NO_PREMIUM
                });
            } else {
                this.setState({loadingState: "playback started",
                    playbackOn: true});
                console.log("Started playback", this.state);
            }
        }).catch((error) => {
            this.setState({loadingState: "playback error: " + error});
        })
    };

    render() {
        return (
            <div className="App">
                <h3>Spotify</h3>
                <SpotifyAuthWindow token={this.state.spotifyAccessToken}
                                   access={this.state.spotifyAccess}/>
                {this.state.spotifyPlayerReady && !this.state.playbackOn &&
                <div><FaPlay /></div>}
                {this.state.spotifyPlayerReady && !this.state.playbackPaused &&
                <div><FaPause /></div>}
                <p>{this.state.loadingState}</p>
            </div>
        );
    }
}

export default SpotifyPlayerContainer;