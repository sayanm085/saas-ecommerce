import mongoose from "mongoose";

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

const WebContent = mongoose.model("WebContent", webContentSchema);
export default WebContent;

