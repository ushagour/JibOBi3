import React from "react";
import { useFormikContext } from "formik";

import ErrorMessage from "./ErrorMessage";
import ImageInputList from "../ImageInputList";

function FormImagePicker({ name }) {
  const { errors, setFieldValue, touched, values } = useFormikContext();
  const imageUris = values[name];  // Ensure it's an array
// console.log("imageUris", name);


  const handleAdd = (uri) => {


    // console.log("Adding URI: ", uri);

    // Properly update the imageUris array by spreading the current array
    setFieldValue(name, [...imageUris, uri]);
  
    // console.log("Updated imageUris: ", [...imageUris, uri]); 

    // console.log("images uris", values);  // Debugging: see the updated array
    
  };

  const handleRemove = (uri) => {
    setFieldValue(
      name,
      imageUris.filter((imageUri) => imageUri !== uri)
    );
  };

  return (
    <>
      <ImageInputList
        imageUris={imageUris}
        onAddImage={handleAdd}
        onRemoveImage={handleRemove}
      />
      <ErrorMessage error={errors[name]} visible={touched[name]} />
    </>
  );
}export default FormImagePicker;
