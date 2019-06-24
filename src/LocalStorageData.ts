import {SpotifyAccess} from "./SpotifyAccess";

const INTRO_DONE = "intro-done";
const SPOTIFY_AUTH_TOKEN = "spotifyAuthToken";
const SPOTIFY_ACCESS = "spotifyAccess";
const SPOTIFY_TOKEN_EXPIRATION_TIME = "spotifyTokenExpirationTime";
const SOURCE_VISIBILITY = "_recordings_visible";

export function isIntroDone(): boolean {
    return localStorage.getItem(INTRO_DONE) === "1";
}

export function setIntroDone(done: boolean): void {
    if (done) {
        localStorage.setItem(INTRO_DONE, "1");
    } else {
        localStorage.removeItem(INTRO_DONE);
    }
}

export function getSpotifyAccess(): SpotifyAccess | null {
    if (localStorage.getItem(SPOTIFY_ACCESS) === null) {
        return null;
    } else {
        switch (localStorage.getItem(SPOTIFY_ACCESS)) {
            case ("not_requested"):
                return SpotifyAccess.NOT_REQUESTED;
            case ("denied"):
                return SpotifyAccess.DENIED;
            case("allowed"):
                return SpotifyAccess.ALLOWED;
            case("no_premium"):
                return SpotifyAccess.NO_PREMIUM;
            default:
                return null;
        }
    }
}

export function setSpotifyAccess(access: SpotifyAccess) {
    localStorage.setItem(SPOTIFY_ACCESS, access);
}

export function getSpotifyAccessToken(): string | null {
    return localStorage.getItem(SPOTIFY_AUTH_TOKEN);
}

export function setSpotifyAccessToken(token: string) {
    localStorage.setItem(SPOTIFY_AUTH_TOKEN, token);
}

export function setSpotifyTokenExpirationTime(time: string) {
    const now = new Date();
    const expirationTime = now.getTime() + Number(time) * 1000;
    localStorage.setItem(SPOTIFY_TOKEN_EXPIRATION_TIME, expirationTime + "");
}

export function getSpotifyTokenExpirationTime(): number {
    return Number(localStorage.getItem(SPOTIFY_TOKEN_EXPIRATION_TIME));
}

export function setRecordingSourceVisible(sourceType: string, visible: boolean) {
    localStorage.setItem(sourceType + SOURCE_VISIBILITY, String(visible));
}

export function isRecordingSourceVisible(sourceType: string): boolean | undefined {
    if (!localStorage.getItem(sourceType + SOURCE_VISIBILITY)) {
        return;
    }
    return localStorage.getItem(sourceType + SOURCE_VISIBILITY) !== "false";
}