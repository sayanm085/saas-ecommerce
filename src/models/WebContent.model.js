import mongoose from "mongoose";
import redisClient from "../db/Radis.db.js";
const webContentSchema = new mongoose.Schema(
  {
    hero: {
      heroTitle: {
        type: String,
      },
      heroDescription: {
        type: String,
      },
      heroImage: {
        default:null,
        type: String,
      },
      heroVideoUrl: {
        type: String,
      },
    },

    
    BrandPartners: [
      {
        brandName: String,
        brandLogo: String,
      },
    ],

    Services: [
      {
        serviceName: String,
        serviceDescription: String,
      },
    ],

    WhyChooseUs: [
      {
        logo: String,
        title: String,
        reason: String,
      },
    ],

    comparison: {
        Shotlin: [
          {
            description:String,
           
          },
        ],
  
        OtherAgencies: [
          {
            description: String,
          },
        ],
    },


    callbooking: {
      type: String,
    },

    FAQs: [
      {
        FAQsQuestion: String,
        FAQsAnswer: String,
      },
    ],

  },
  { timestamps: true }
);

// 🔥 Auto-remove Redis cache when WebContent is updated
webContentSchema.pre("save", async function (next) {
  const cacheKey = `webcontent:${this._id}`;
  await redisClient.del(cacheKey);
  console.log(`✅ Redis cache cleared for updated WebContent: ${this._id}`);
  next();
});

// 🔥 Auto-remove Redis cache when WebContent is deleted
webContentSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const cacheKey = `webcontent:${doc._id}`;
    await redisClient.del(cacheKey);
    console.log(`❌ Redis cache cleared for deleted WebContent: ${doc._id}`);
  }
});

const WebContent = mongoose.model("WebContent", webContentSchema);
export default WebContent;

