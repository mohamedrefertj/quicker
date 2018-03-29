
export enum ConnectionErrorCodes {
    NO_ERROR = 0x0,
    INTERNAL_ERROR = 0x1,
    FLOW_CONTROL_ERROR = 0x3,
    STREAM_ID_ERROR = 0x4,
    STREAM_STATE_ERROR = 0x5,
    FINAL_OFFSET_ERROR = 0x6,
    FRAME_FORMAT_ERROR = 0x7,
    TRANSPORT_PARAMETER_ERROR = 0x8,
    VERSION_NEGOTIATION_ERROR = 0x9,
    PROTOCOL_VIOLATION = 0xa,
    UNSOLICITED_PONG = 0xb,
    FRAME_ERROR = 0x100
}

export enum TlsErrorCodes {
    TLS_HANDSHAKE_FAILED = 0x201,
    TLS_FATAL_ALERT_GENERATED = 0x202,
    TLS_FATAL_ALERT_RECEIVED = 0x203
}

export type QuicErrorCode = (ConnectionErrorCodes | TlsErrorCodes);