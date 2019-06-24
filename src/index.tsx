import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {setSpotifyAccess, setSpotifyAccessToken, setSpotifyTokenExpirationTime} from "./LocalStorageData";
import {SpotifyAccess} from "./SpotifyAccess";

const hashStr = window.location.hash; // everything in address after #, here spotify puts successfull auth tokens
const searchStr = window.location.search; // everything in address after ?, here spotify puts access denials
const hashParams = decodeHashParams(hashStr.slice(1, hashStr.length));
const searchParams = decodeHashParams(searchStr.slice(1, searchStr.length));

if (hashParams.access_token) {
    setSpotifyAccess(SpotifyAccess.ALLOWED);
    setSpotifyAccessToken(hashParams.access_token);
    setSpotifyTokenExpirationTime(hashParams.expires_in);
    window.close();
} else if (searchParams.error) {
    setSpotifyAccess(SpotifyAccess.DENIED);
    window.close();
} else {
    ReactDOM.render(<App />, document.getElementById('root'));
}

/**
 * decodes a parameter string (p1=v1&p2=v2&... syntax) into the object {p1: v1, p2: v2, ...}
 */
export function decodeHashParams(str: string): { [key: string]: string } {
    const hashParams: { [key: string]: string } = {};
    const a = /\+/g;  // Regex for replacing addition symbol with a space
    const r = /([^&;=]+)=?([^&;]*)/g;
    const d = (s: string) => decodeURIComponent(s.replace(a, " "));
    let e;

    while (e = r.exec(str)) {
        hashParams[d(e[1])] = d(e[2]);
    }
    return hashParams;
}
