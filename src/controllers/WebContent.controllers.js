import WebContent  from '../models/WebContent.model.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import uploadImage from '../utils/cloudinary.js';
import redisClient from '../db/Radis.db.js';

// Hero Content update data  controller
const updateHeroContent = asyncHandler(async (req, res, next) => {
  try {
    const { heroTitle, heroDescription, heroVideoUrl } = req.body;
    const heroImageFile = req.files?.heroImage?.[0]?.path || null;

    // Retrieve the existing WebContent
    const webContent = await WebContent.findById('674efd6a7d4788194ecd519a');
    if (!webContent) {
      return next(new ApiResponse(400, "WebContent not found", "WebContent not found"));
    }

    // Update hero content fields
    if (heroTitle) webContent.hero.heroTitle = heroTitle;
    if (heroDescription) webContent.hero.heroDescription = heroDescription;
    if (heroVideoUrl) webContent.hero.heroVideoUrl = heroVideoUrl;

    // If heroImageFile exists, upload and update the heroImage field
    if (heroImageFile) {
      const uploadedImageUrl = await uploadImage(heroImageFile);
      webContent.hero.heroImage = uploadedImageUrl;
    }

    // Save the updated WebContent to the database
    await webContent.save();

    // Send success response
    res.status(200).json(ApiResponse("success", webContent.hero, "Hero content updated successfully"));
  } catch (error) {
    // Handle unexpected errors
    next(error);
  }
});

// * BrandPartners Content update,add new data and delete controller

// const updateBrandPartnersContent = asyncHandler(async (req, res, next) => {
//   const brandImageFile = req.files?.image?.[0]?.path || null;
//   const { text, id, type } = req.body;
  
//   let result;
  
//   switch (type) {
//     case 'brandPevContentUpdate':
//       result = {
//         brandId: id,
//         brandName: text,
//         brandLogo: brandImageFile,
//         typeof: type,
//       };
//       break;
  
//     case 'NewbrandContentAdd':
//       result = {
//         brandName: text,
//         brandLogo: brandImageFile,
//         typeof: type,
//       };
//       break;
  
//     case 'brandContentDelete':
//       result = {
//         brandId: id,
//       };
//       break;
  
//     default:
//       result = null; // Handle invalid type
//       console.error('Invalid type provided:', type);
//       break;
//   }

//   // Retrieve the existing WebContent
//   const webContent = await WebContent.findById("674efd6a7d4788194ecd519a");

//   if (!webContent) {
//     return next(
//       new ApiResponse(400, "WebContent not found", "WebContent not found")
//     );
//   }

// // Update BrandPartners content fields
// if (brandPevContentUpdate && Array.isArray(brandPevContentUpdate)) {
//   brandPevContentUpdate.forEach ( async({ brandId, brandName }) => {

//     const brandLogo = req.files?.brandLogo
//     console.log(brandLogo);

//     if (brandId) {
//       const brandPartner = webContent.BrandPartners.id(brandId);

//       // Update fields only if they exist
//       if (brandPartner) {
//         if (brandName) brandPartner.brandName = brandName;

//         const uploadedImageUrl = await uploadImage(brandLogo);
//         // console.log(uploadedImageUrl);
//         if (uploadedImageUrl) brandPartner.brandLogo = uploadedImageUrl;
//       }
//     }
//   });
// }

// // If brandName and brandLogo exist, add a new BrandPartners object
// if (NewbrandContentAdd && Array.isArray(NewbrandContentAdd)) {
//   NewbrandContentAdd.forEach(({ brandName, brandLogo }) => {
//     // Add a new BrandPartners object only if both brandName and brandLogo exist
//     if (brandName && brandLogo) {
//       webContent.BrandPartners.push({ brandName, brandLogo });
//     }
//   });
// }

//   // If deleteobj exists, delete the BrandPartners object

//   if (Array.isArray(brandContentDelete) && brandContentDelete.length > 0) {
//     brandContentDelete.forEach((brandId) => {
//       webContent.BrandPartners.pull({ _id: brandId });
//     });
//   }

//   // Save the updated WebContent to the database
//   await webContent.save();

//   // Send success response
//   res
//     .status(200)
//     .json(
//       ApiResponse(
//         200,
//         webContent.BrandPartners,
//         "BrandPartners content updated successfully",
//         true
//       )
//     );

// });

const updateBrandPartnersContent = asyncHandler(async (req, res, next) => {
  const brandImageFile = req.files?.brandLogo?.[0]?.path || null;
  const { text, id, type } = req.body;

  let operationData;

  switch (type) {
    case 'brandPevContentUpdate':
      operationData = {
        updates: [{ brandId: id, brandName: text, brandLogo: brandImageFile }],
      };
      break;

    case 'NewbrandContentAdd':
      operationData = {
        additions: [{ brandName: text, brandLogo: brandImageFile }],
      };
      break;

    case 'brandContentDelete':
      operationData = { deletions: [id] };
      break;

    default:
      return next(
        new ApiResponse(400, "Invalid operation type", "Invalid type provided")
      );
  }
  // Retrieve the existing WebContent



  const webContent = await WebContent.findById("674efd6a7d4788194ecd519a");

  if (!webContent) {
    return next(new ApiResponse(404, "WebContent not found", "WebContent not found"));
  }

  // Handle updates
  if (operationData?.updates) {
    await Promise.all(
      operationData.updates.map(async ({ brandId, brandName, brandLogo }) => {
        const brandPartner = webContent.BrandPartners.id(brandId);

        if (brandPartner) {
          if (brandName) brandPartner.brandName = brandName;
          if (brandLogo) { 
            const uploadedImageUrl = await uploadImage(brandLogo);
            if (uploadedImageUrl) brandPartner.brandLogo = uploadedImageUrl;
          }
        }
      })
    );
  }


  // *Handle additions
  if (operationData?.additions) {
    const additionPromises = operationData.additions
      .filter(({ brandName, brandLogo }) => brandName && brandLogo) // Filter invalid entries
      .map(async ({ brandName, brandLogo }) => {
        const uploadedImageUrl = await uploadImage(brandLogo);
        console.log(uploadedImageUrl);
        return { brandName, brandLogo: uploadedImageUrl };
      });
  
    const newBrandPartners = await Promise.all(additionPromises);
  
    // Add all new BrandPartners to the array in a single operation
    webContent.BrandPartners.push(...newBrandPartners);
  }

  // Handle deletions
  if (operationData?.deletions) {
    operationData.deletions.forEach((brandId) => {
      webContent.BrandPartners.pull({ _id: brandId });
    });
  }


  // Save the updated WebContent
  await webContent.save();

  res.status(200).json(
    ApiResponse(
      200,
      webContent.BrandPartners,
      "BrandPartners content updated successfully",
      true
    )
  );
});


// services Content update,add new data and delete controller

const updateServicesContent = asyncHandler(async (req, res, next) => {
  const { servicesContentUpdate, NewServicesContentAdd, servicesContentDelete } = req.body;

  console.log(servicesContentUpdate,"*******", NewServicesContentAdd,"*******", servicesContentDelete);

  // Retrieve the existing WebContent
  const webContent = await WebContent.findById("674efd6a7d4788194ecd519a");

  if (!webContent) {
    return next(
      new ApiResponse(400, "WebContent not found", "WebContent not found")
    );
  }

// Update Services content fields
if (servicesContentUpdate && Array.isArray(servicesContentUpdate)) {
  servicesContentUpdate.forEach(({ serviceId, serviceName, serviceDescription }) => {
    if (serviceId) {
      const service = webContent.Services.id(serviceId);

      // Update fields only if they exist
      if (service) {
        if (serviceName) service.serviceName = serviceName;
        if (serviceDescription) service.serviceDescription = serviceDescription;
      }
    }
  });
}

// If serviceName and serviceDescription exist, add a new Services object

if (NewServicesContentAdd && Array.isArray(NewServicesContentAdd)) {
  NewServicesContentAdd.forEach(({ serviceName, serviceDescription }) => {
    // Add a new Services object only if both serviceName and serviceDescription exist
    if (serviceName && serviceDescription) {
      webContent.Services.push({ serviceName, serviceDescription });
    }
  });
}

// If deleteobj exists, delete the Services object 

if (Array.isArray(servicesContentDelete) && servicesContentDelete.length > 0) {
  servicesContentDelete.forEach((serviceId) => {
    webContent.Services.pull({ _id: serviceId });
  });
}


  // Save the updated WebContent to the database

  await webContent.save();

  // Send success response
  res.status(200).json(ApiResponse(200,webContent.Services,"Services content updated successfully",true));


});

// WhyChooseUs Content update,add new data and delete controller

const updateWhyChooseUsContent = asyncHandler(async (req, res, next) => {
  const WhyChooseUsContentImageFile = req.files?.WhyChooseUsLogo?.[0]?.path || null;
  const { title,reason, id, type } = req.body;

  let operationData;

  switch (type) {
    case 'whyChooseUsContentUpdate':
      operationData = {
        updates: [{ whyChooseUsId: id, logo:WhyChooseUsContentImageFile, title, reason }],
      };
      break;

    case 'NewWhyChooseUsContentAdd':
      operationData = {
        additions: [{ logo:WhyChooseUsContentImageFile, title, reason }],
      };

      break;

    case 'WhyChooseUsContentDelete':
      operationData = { deletions: [id] };
      break;

    default:
      return next(
        new ApiResponse(400, "Invalid operation type", "Invalid type provided")
      );
  }

  // Retrieve the existing WebContent


  // Retrieve the existing WebContent
  const webContent = await WebContent.findById("674efd6a7d4788194ecd519a");

  if (!webContent) {
    return next(
      new ApiResponse(400, "WebContent not found", "WebContent not found")
    );
  }

// Update WhyChooseUs content fields 
if (operationData?.updates) {
  await Promise.all(
    operationData.updates.map(async ({ whyChooseUsId, title, reason, logo }) => {
      const whyChooseUs = webContent.WhyChooseUs.id(whyChooseUsId);

      if (whyChooseUs) {
        if (title) whyChooseUs.title = title;
        if (reason) whyChooseUs.reason = reason;
        if (logo) {
          const uploadedImageUrl = await uploadImage(logo);
          if (uploadedImageUrl) whyChooseUs.logo = uploadedImageUrl;
        }
      }
    })
  );
}

// Handle additions  

if (operationData?.additions) {
  const additionPromises = operationData.additions
    .filter(({ title, reason, logo }) => title && reason && logo) // Filter invalid entries
    .map(async ({ title, reason, logo }) => {
      const uploadedImageUrl = await uploadImage(logo);
      return { title, reason, logo: uploadedImageUrl };
    });

  const newWhyChooseUs = await Promise.all(additionPromises);

  // Add all new WhyChooseUs to the array in a single operation
  webContent.WhyChooseUs.push(...newWhyChooseUs);
}



// If deleteobj exists, delete the WhyChooseUs object

if (operationData?.deletions) {
  operationData.deletions.forEach((whyChooseUsId) => {
    webContent.WhyChooseUs.pull({ _id: whyChooseUsId });
  });

}
  // Save the updated WebContent to the database

  await webContent.save();

  // Send success response
  res.status(200).json(ApiResponse(200,"webContent.WhyChooseUs","WhyChooseUs content updated successfully",true));

});

// comparison Content update,add new data and delete controller

const updateComparisonContent = asyncHandler(async (req, res, next) => {
  const { comparison } = req.body;

  // Retrieve the existing WebContent
  const webContent = await WebContent.findById("674efd6a7d4788194ecd519a");

  if (!webContent) {
    return next(
      new ApiResponse(400, "WebContent not found", "WebContent not found")
    );
  }

});

//callbooking Content update data controller

 const updateCallBookingContent = asyncHandler(async (req, res, next) => {
  const { callbooking } = req.body;

  // Retrieve the existing WebContent
  const webContent = await WebContent.findById("674efd6a7d4788194ecd519a");

  if (!webContent) {
    return next(
      new ApiResponse(400, "WebContent not found", "WebContent not found")
    );
  }

  // Update callbooking content fields
  if (callbooking) webContent.callbooking = callbooking;

  // Save the updated WebContent to the database
  await webContent.save();

  // Send success response
  res.status(200).json(ApiResponse(200,webContent.callbooking,"Call booking content updated successfully",true));
});



// FAQs Content update,add new data and delete controller

const updateFAQsContent = asyncHandler(async (req, res, next) => {
  const { FAQsContentUpdate, NewFAQsContentAdd, FAQsContentDelete } = req.body;

  // Retrieve the existing WebContent
  const webContent = await WebContent.findById("674efd6a7d4788194ecd519a");

  if (!webContent) {
    return next(
      new ApiResponse(400, "WebContent not found", "WebContent not found")
    );
  }

// Update FAQs content fields
if (FAQsContentUpdate && Array.isArray(FAQsContentUpdate)) {
  FAQsContentUpdate.forEach(({ FAQsId, FAQsQuestion, FAQsAnswer }) => {
    if (FAQsId) {
      const FAQs = webContent.FAQs.id(FAQsId);

      // Update fields only if they exist
      if (FAQs) {
        if (FAQsQuestion) FAQs.FAQsQuestion = FAQsQuestion;
        if (FAQsAnswer) FAQs.FAQsAnswer = FAQsAnswer;
      }
    }
  });
}

// If FAQsQuestion and FAQsAnswer exist, add a new FAQs object
if (NewFAQsContentAdd && Array.isArray(NewFAQsContentAdd)) {
  NewFAQsContentAdd.forEach(({ FAQsQuestion, FAQsAnswer }) => {
    // Add a new FAQs object only if both FAQsQuestion and FAQsAnswer exist
    if (FAQsQuestion && FAQsAnswer) {
      webContent.FAQs.push({ FAQsQuestion, FAQsAnswer });
    }
  });
}

// If deleteobj exists, delete the FAQs object

if (Array.isArray(FAQsContentDelete) && FAQsContentDelete.length > 0) {
  FAQsContentDelete.forEach((FAQsId) => {
    webContent.FAQs.pull({ _id: FAQsId });
  });
}

  // Save the updated WebContent to the database

  await webContent.save();

  // Send success response
  res.status(200).json(ApiResponse(200,webContent.FAQs,"FAQs content updated successfully",true));
});


const WebContentcreate = asyncHandler(async(req, res) => {
  // Create a WebContent
  let data = await WebContent.create(req.body);

  //send the response to the user
  res.status(201).json({
    status: "success",
    data: data,
    message: "WebContent created successfully",
  });

});



// Retrieve and return all WebContent from the database.

const WebContentget = asyncHandler(async (req, res) => {
  const cacheKey = "webcontent:674efd6a7d4788194ecd519a";

  try {
    // 🔥 Check if data is in Redis cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        status: "success",
        data: JSON.parse(cachedData),
        message: "WebContent retrieved successfully (cached)",
      });
    }

    // 🔥 Fetch from database if not in cache
    const data = await WebContent.findById("674efd6a7d4788194ecd519a").lean();

    if (!data) {
      return res.status(404).json({
        status: "error",
        message: "WebContent not found",
      });
    }

    // 🔥 Store result in Redis (auto-remove after 1 months)
    await redisClient.setEx(cacheKey, 2592000, JSON.stringify(data));

    res.status(200).json({
      status: "success",
      data: data,
      message: "WebContent retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching WebContent:", error.message);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
});


// Create and Save a new WebContent

let uploadImages = async (req, res) => {
  const brandImageFile = req.files?.image?.[0]?.path || null;
  const { text, id, type } = req.body;
  
  let result;
  
  switch (type) {
    case 'brandPevContentUpdate':
      result = {
        brandId: id,
        brandName: text,
        brandLogo: brandImageFile,
        typeof: type,
      };
      break;
  
    case 'NewbrandContentAdd':
      result = {
        brandName: text,
        brandLogo: brandImageFile,
        typeof: type,
      };
      break;
  
    case 'brandContentDelete':
      result = {
        brandId: id,
      };
      break;
  
    default:
      result = null; // Handle invalid type
      console.error('Invalid type provided:', type);
      break;
  }
  
  console.log(result);
  



  res.status(200).json({ message: "Images uploaded successfully" });

}







export {
  updateHeroContent,
  updateBrandPartnersContent,
  updateServicesContent,
  updateWhyChooseUsContent,
  updateFAQsContent,
  updateCallBookingContent,
  WebContentcreate,
  WebContentget,
  uploadImages,
};