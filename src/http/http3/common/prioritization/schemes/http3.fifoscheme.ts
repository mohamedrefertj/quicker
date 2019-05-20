import { Http3PriorityScheme } from "./http3.priorityscheme";
import { QuicStream } from "../../../../../quicker/quic.stream";
import { Bignum } from "../../../../../types/bignum";
import { Http3NodeEvent } from "../http3.nodeevent";
import { Http3PrioritisedElementNode } from "../http3.prioritisedelementnode";
import { Http3RequestNode } from "../http3.requestnode";
import { Http3PriorityFrame, PrioritizedElementType, ElementDependencyType } from "../../frames";
import { QlogWrapper } from "../../../../../utilities/logging/qlog.wrapper";

export class Http3FIFOScheme extends Http3PriorityScheme {
    private tailStreamID?: Bignum;

    public constructor(logger?: QlogWrapper) {
        super(logger);

        // Make sure tailStreamID always points to the last element of the chain
        this.dependencyTree.on(Http3NodeEvent.REMOVING_NODE, (node: Http3PrioritisedElementNode) => {
            if (node instanceof Http3RequestNode) {
                if (node.getStreamID() === this.tailStreamID) {
                    const parent: Http3PrioritisedElementNode | null = node.getParent();
                    if (parent !== null && parent instanceof Http3RequestNode) {
                        this.tailStreamID = parent.getStreamID();
                    } else {
                        this.tailStreamID = undefined;
                    }
                }
            } else {
                // TODO Implement appropriate error
                throw new Error("A non request node was removed from HTTP/3 dependency tree while it should contain only request streams!");
            }
        });
    }

    public applyScheme(streamID: Bignum, fileExtension: string): Http3PriorityFrame | null {
        let priorityFrame;
        if (this.tailStreamID === undefined) {
            this.dependencyTree.moveStreamToRoot(streamID);
            priorityFrame = new Http3PriorityFrame(PrioritizedElementType.REQUEST_STREAM, ElementDependencyType.ROOT, streamID);
        } else {
            this.dependencyTree.moveStreamToStream(streamID, this.tailStreamID);
            priorityFrame = new Http3PriorityFrame(PrioritizedElementType.REQUEST_STREAM, ElementDependencyType.REQUEST_STREAM, streamID, this.tailStreamID);
        }
        this.tailStreamID = streamID;
        return priorityFrame;
    }

    public handlePriorityFrame(priorityFrame: Http3PriorityFrame, currentStreamID: Bignum): void {}
}