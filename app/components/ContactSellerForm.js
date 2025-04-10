import React from "react";
import { Alert, Keyboard } from "react-native";
import * as Notifications from 'expo-notifications';
import * as Yup from "yup";

import { Form, FormField, SubmitButton } from "./forms";
import messagesApi from "../api/messages";

function ContactSellerForm({ listing }) {
  const handleSubmit = async ({ content }, { resetForm }) => {


    Keyboard.dismiss();

    
    const  target_user = listing.owner.id;
    const result = await messagesApi.send(content,target_user, listing.id);
    


    
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
      data: { customData: 'anything you want' },
      sound: 'default', // or custom sound
      priority: 'high', // or 'default', 'low'
      badge: 1, // iOS badge count
      color: '#FF0000', // Android only - notification color
    },
    trigger: null, // send immediately
  }
  
  );
    
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
