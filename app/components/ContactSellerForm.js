import React from "react";
import { Alert, Keyboard } from "react-native";
import * as Notifications from 'expo-notifications';
import * as Yup from "yup";

import { Form, FormField, SubmitButton } from "./forms";
import messagesApi from "../api/messages";

function ContactSellerForm({ listing }) {
  const handleSubmit = async ({ content }, { resetForm }) => {


    Keyboard.dismiss();

    const result = await messagesApi.send(content, listing.id)
    


    
    if (!result.ok) {
      console.log("Error:", result.data);
      
     Alert.alert("Error", "Could not send the message to the seller.");
     return;
    }else{

      Alert.alert("success", "Message has been sent successfully to the seller.");

    }

    resetForm();
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Awesome!",
        body: "Your message was sent to the seller.",
      },
      trigger: null, // null triggers it immediately as a local notification
    });
    
  };

  return (
    <Form
      initialValues={{ content: "" }}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      <FormField
        maxLength={255}
        multiline
        name="content"
        numberOfLines={3}
        placeholder="Message..."
      />
      <SubmitButton title="Contact Seller" />
    </Form>
  );
}

const validationSchema = Yup.object().shape({
  content: Yup.string().required().min(1).label("content"),
});

export default ContactSellerForm;
