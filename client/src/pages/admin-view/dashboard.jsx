import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import { addFeatureImage, getFeatureImages, deleteFeatureImage } from "@/store/common-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function AdminDashboard() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const dispatch = useDispatch();
  const { featureImageList } = useSelector((state) => state.commonFeature);

  function handleUploadFeatureImage() {
    dispatch(addFeatureImage(uploadedImageUrl)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setImageFile(null);
        setUploadedImageUrl("");
      }
    });
  }

  function handleDeleteFeatureImage(imageId) {
    if(!imageId){
      console.error("Error in Image Id from Mongodb");
      return;
    }
    dispatch(deleteFeatureImage(imageId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages()); // Refresh the image list after deletion
      }
    });
  }

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div>
      <ProductImageUpload
        imageFile={imageFile}
        setImageFile={setImageFile}
        uploadedImageUrl={uploadedImageUrl}
        setUploadedImageUrl={setUploadedImageUrl}
        setImageLoadingState={setImageLoadingState}
        imageLoadingState={imageLoadingState}
        isCustomStyling={true}
      />
      <Button onClick={handleUploadFeatureImage} className="mt-5 w-full">
        Upload
      </Button>
      <div className="flex flex-col gap-4 mt-5">
        {featureImageList && featureImageList.length > 0
          ? featureImageList.map((featureImgItem) => (
              <div key={featureImgItem.id} className="relative border p-2 rounded-lg">
                <img
                  src={featureImgItem.image}
                  className="w-full h-[300px] object-cover rounded-lg"
                />
                <Button 
                  onClick={() => {
                    console.log("Deleting image with ID:", featureImgItem.id);  // Debugging
                    handleDeleteFeatureImage(featureImgItem._id);
                }}
                >
                  Delete
                </Button>
              </div>
            ))
          : <p>No images uploaded</p>}
      </div>
    </div>
  );
}

export default AdminDashboard;
