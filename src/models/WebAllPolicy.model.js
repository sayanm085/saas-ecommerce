import mongoose from "mongoose";

const WebAllPolicySchema = new mongoose.Schema({
    about: {
        type: String,
    },
    privacy: {
        type: String,
    },
    terms: {
        type: String,
    },
    refund: {
        type: String,
    },
    status: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const WebAllPolicy = mongoose.model('WebAllPolicy', WebAllPolicySchema);

export default WebAllPolicy;