import React from "react";
import { useFormikContext } from "formik";

import Picker from "../Picker";
import ErrorMessage from "./ErrorMessage";

function AppFormPicker({
  items,
  name,
  numberOfColumns,
  PickerItemComponent,
  placeholder,
  width,
}) {
  const { errors, setFieldValue, touched, values } = useFormikContext();


//   console.log("Form Values:", values); // Check the form values
// console.log("Value for name:", values[name]); // Check the specific value for the field
// console.log("Items:", items); 
  // Find the selected item by its ID to display the name
  const selectedItem = items.find((item) => item.id === values[name]);
  // console.log("Selected Item:", selectedItem.id); // Debug log
  

  return (
    <>
      <Picker
        items={items}
        numberOfColumns={numberOfColumns}
        onSelectItem={(item) => {
          setFieldValue(name, item.id); // Send the ID to the form
        }}
        PickerItemComponent={PickerItemComponent}
        placeholder={placeholder}
        selectedItem={selectedItem? selectedItem.name: null} // Pass the selected item to display its name
        width={width}
      />
      <ErrorMessage error={errors[name]} visible={touched[name]} />
    </>
  );
}

export default AppFormPicker;
