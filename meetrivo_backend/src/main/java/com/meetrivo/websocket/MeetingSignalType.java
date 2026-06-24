package com.meetrivo.websocket;

public enum MeetingSignalType {
    OFFER,
    ANSWER,
    ICE_CANDIDATE,
    JOIN_REQUEST,
    JOIN_ACCEPTED,
    LEAVE,
    VIDEO_STATE,
    AUDIO_STATE,
    SCREEN_SHARE_STATE
}
