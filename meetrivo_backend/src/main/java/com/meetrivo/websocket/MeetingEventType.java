package com.meetrivo.websocket;

public enum MeetingEventType {
    USER_JOINED,
    USER_LEFT,
    HOST_JOINED,
    HOST_LEFT,
    MEETING_STARTED,
    MEETING_ENDED,
    PARTICIPANT_MUTED,
    PARTICIPANT_UNMUTED,
    SCREEN_SHARE_STARTED,
    SCREEN_SHARE_STOPPED,
    WAITING_ROOM_JOIN,
    WAITING_ROOM_LEAVE,
    // Media state events — align with frontend useWebSocket.ts handler
    MIC_ON,
    MIC_OFF,
    VIDEO_ON,
    VIDEO_OFF,
    HAND_RAISED,
    HAND_LOWERED,
    CONNECTION_STATE_CHANGED
}
