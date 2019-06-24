import React, {Component} from 'react';
import './App.css';
import SpotifyPlayerContainer from "./SpotifyPlayerContainer";


class App extends Component {

    render() {
        return (<SpotifyPlayerContainer
            playingRecordingId="spotify:track:4iV5W9uYEdYUVa79Axb7Rh"/>);
    }
}

export default App;
