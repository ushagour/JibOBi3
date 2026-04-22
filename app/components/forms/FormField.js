import React from "react";
import { useFormikContext } from "formik";

import TextInput from "../TextInput";
import ErrorMessage from "./ErrorMessage";

function AppFormField({ name, width, showErrorOnSubmitOnly = false, ...otherProps }) {
  const { setFieldTouched, setFieldValue, errors, touched, values, submitCount } = useFormikContext();
  const isErrorVisible = showErrorOnSubmitOnly
    ? submitCount > 0
    : touched[name];

  return (
    <>
      <TextInput
        onBlur={() => setFieldTouched(name)}
        onChangeText={(text) => setFieldValue(name, text)}

        value={values[name]}
        width={width}
        {...otherProps}
      />
      <ErrorMessage error={errors[name]} visible={isErrorVisible} />
    </>
  );
}

export default AppFormField;
