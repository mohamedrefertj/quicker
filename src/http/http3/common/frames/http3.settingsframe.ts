import { Http3BaseFrame, Http3FrameType } from "./http3.baseframe";
import { Bignum } from "../../../../types/bignum";
import { VLIE, VLIEOffset } from "../../../../types/vlie";

interface Http3Setting {
    // RESERVED: "0x1f * N + 0x21", Endpoints SHOULD include at least one such setting in their SETTINGS frame
    identifier: Bignum,
    value: Bignum,
}

export class Http3SettingsFrame extends Http3BaseFrame {
    private settingsParameters: Http3Setting[];

    public constructor(settingsParameters: Http3Setting[]) {
        super();
        this.settingsParameters = settingsParameters;
    }
    
    public static fromPayload(buffer: Buffer, offset: number = 0): Http3SettingsFrame {
        const [params, bufferOffset] = Http3SettingsFrame.parseParameters(buffer, offset);
        return new Http3SettingsFrame(params);
    }

    public toBuffer(): Buffer {
        let encodedLength: Buffer = VLIE.encode(this.getPayloadLength());
        let buffer: Buffer = Buffer.alloc(encodedLength.byteLength + 1 + this.getPayloadLength());

        encodedLength.copy(buffer);
        buffer.writeUInt8(this.getFrameType(), encodedLength.byteLength);
        this.payloadtoBuffer().copy(buffer, encodedLength.byteLength + 1);

        return buffer;
    }

    public getPayloadLength(): number {
        let length: number = 0;

        for (let param of this.settingsParameters) {
            length += VLIE.getEncodedByteLength(param.identifier);
            length += VLIE.getEncodedByteLength(param.value);
        }

        return length;
    }

    public getFrameType(): Http3FrameType {
        return Http3FrameType.SETTINGS;
    }

    private static parseParameters(buffer: Buffer, offset: number): [Http3Setting[], number] {
        let param: Http3Setting | undefined;
        const params: Http3Setting[] = [];
        while (offset < buffer.byteLength) {
            [param, offset] = this.parseParameter(buffer, offset);
            params.push(param); 
        }
        return [params, offset];
    }

    private static parseParameter(buffer: Buffer, offset: number): [Http3Setting, number] {
        let vlieOffset: VLIEOffset = VLIE.decode(buffer, offset);
        const identifier: Bignum = vlieOffset.value;
        offset = vlieOffset.offset;
        vlieOffset = VLIE.decode(buffer, offset);
        const value = vlieOffset.value;
        offset = vlieOffset.offset;
        return [{identifier, value}, offset];
    }

    private payloadtoBuffer(): Buffer {
        let buffer: Buffer = new Buffer(0);

        for (let param of this.settingsParameters) {
            buffer = Buffer.concat([buffer, this.settingsParameterToBuffer(param)]);
        }

        return buffer;
    }

    private settingsParameterToBuffer(param: Http3Setting): Buffer {
        return Buffer.concat([VLIE.encode(param.identifier), VLIE.encode(param.value)]);
    }
}
