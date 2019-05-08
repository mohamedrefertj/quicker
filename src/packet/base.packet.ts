import {Connection} from '../quicker/connection';
import {BaseHeader} from './header/base.header';
import { LongHeader } from "./header/long.header";



export abstract class BasePacket {

    private header: BaseHeader;
    private packetType: PacketType;

    protected serializedSizeInBytes: number;
    protected serialized?:Buffer;

    protected retransmittable: boolean;
    protected ackOnly: boolean;
    protected paddingOnly: boolean;
    protected containsCrypto : boolean;
    //counts towards bytes in flight of congestioncontrol
    // for ack only frames this will be false
    protected inFlight : boolean;

    public constructor(packetType: PacketType, header: BaseHeader) {
        this.packetType = packetType;
        this.header = header;
        this.retransmittable = false;
        this.ackOnly = true;
        this.paddingOnly = true;
        this.containsCrypto = false;
        this.inFlight = false;

        this.serializedSizeInBytes = -1;
    }


    public getHeader(): BaseHeader {
        return this.header;
    }

    /*
    public setHeader(header: BaseHeader) {
        this.header = header;
    }
    */

    public getPacketType(): PacketType {
        return this.packetType;
    }

    public isHandshake(): boolean {
        return (this.packetType === PacketType.Initial || this.packetType === PacketType.Handshake);
    }

    public containsCryptoFrames() : boolean{
        return this.containsCrypto;
    }

    public getSerializedSizeInBytes(){
        if( this.serializedSizeInBytes > -1 ){
            return this.serializedSizeInBytes;
        }
        else{
            console.error("BasePacket:getSerializedSizeInBytes : not cached yet! call buffer() before this!");
            return 0;
        }
    }

    /**
     * @remark new term for this in the rfc is "ack-eliciting"
     */
    public isRetransmittable(): boolean {
        return this.retransmittable;
    }

    public countsTowardsInFlight() : boolean{
        return this.inFlight;
    }

    public isAckOnly(): boolean {
        return this.ackOnly;
    }

    public isPaddingOnly():boolean {
        return this.paddingOnly;
    }

    abstract getSize(): number;
    abstract toBuffer(connection: Connection): Buffer;
}

export enum PacketType {
    Initial,
    Retry,
    Handshake,
    VersionNegotiation,
    Protected0RTT,
    Protected1RTT
}