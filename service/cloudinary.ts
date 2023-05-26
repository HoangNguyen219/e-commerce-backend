import cloudinary from 'cloudinary';

let cloudinaryV2Instance: typeof cloudinary.v2 | null = null;

const getCloudinaryV2Instance = () => {
  if (!cloudinaryV2Instance) {
    cloudinaryV2Instance = cloudinary.v2;
  }
  return cloudinaryV2Instance;
};

const cloudinaryV2 = getCloudinaryV2Instance();
export default cloudinaryV2;
