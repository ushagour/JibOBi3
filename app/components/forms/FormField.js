import React from "react";
import { useFormikContext } from "formik";

import TextInput from "../TextInput";
import ErrorMessage from "./ErrorMessage";

function AppFormField({ name, width, ...otherProps }) {
  const { setFieldTouched,setFieldValue ,handleChange, errors, touched ,values} = useFormikContext();

  return (
    <>
      <TextInput
        onFocus={() => setFieldTouched(name)}  // Trigger touched when clicked
        onBlur={() => setFieldTouched(name)}
        onChangeText={(text) => setFieldValue(name, text)}

        value={values[name]}
        width={width}
        {...otherProps}
      />
      <ErrorMessage error={errors[name]} visible={touched[name]} />
    </>
  );
}

export default AppFormField;
