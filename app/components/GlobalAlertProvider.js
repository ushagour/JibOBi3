import React, { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import AwesomeAlert from "react-native-awesome-alerts";
import colors from "../config/colors";

function normalizeButtons(buttons) {
  if (!Array.isArray(buttons) || buttons.length === 0) {
    return {
      showCancel: false,
      cancelButton: null,
      confirmButton: { text: "OK" },
    };
  }

  const cancelButton = buttons.find((button) => button?.style === "cancel") || null;
  const nonCancelButtons = buttons.filter((button) => button?.style !== "cancel");
  const confirmButton = nonCancelButtons[0] || buttons[0] || { text: "OK" };

  return {
    showCancel: !!cancelButton,
    cancelButton,
    confirmButton,
  };
}

function GlobalAlertProvider() {
  const originalAlertRef = useRef(Alert.alert);
  const [alertState, setAlertState] = useState({
    show: false,
    title: "",
    message: "",
    showCancel: false,
    cancelText: "Cancel",
    confirmText: "OK",
    confirmStyle: "default",
    onCancel: null,
    onConfirm: null,
  });

  useEffect(() => {
    Alert.alert = (title, message, buttons, options) => {
      const { showCancel, cancelButton, confirmButton } = normalizeButtons(buttons);

      setAlertState({
        show: true,
        title: title || "Notice",
        message: message || "",
        showCancel,
        cancelText: cancelButton?.text || "Cancel",
        confirmText: confirmButton?.text || "OK",
        confirmStyle: confirmButton?.style || "default",
        onCancel: cancelButton?.onPress || null,
        onConfirm: confirmButton?.onPress || null,
        canDismiss: !!options?.cancelable,
      });
    };

    return () => {
      Alert.alert = originalAlertRef.current;
    };
  }, []);

  const closeAlert = () => {
    setAlertState((prev) => ({
      ...prev,
      show: false,
      onCancel: null,
      onConfirm: null,
    }));
  };

  const getConfirmColor = () => {
    if (alertState.confirmStyle === "destructive") return colors.danger;
    return colors.primary;
  };

  return (
    <AwesomeAlert
      show={alertState.show}
      showProgress={false}
      title={alertState.title}
      message={alertState.message}
      closeOnTouchOutside={!!alertState.canDismiss}
      closeOnHardwareBackPress={false}
      showCancelButton={alertState.showCancel}
      showConfirmButton={true}
      cancelText={alertState.cancelText}
      confirmText={alertState.confirmText}
      confirmButtonColor={getConfirmColor()}
      cancelButtonColor={colors.mediumGray}
      onCancelPressed={() => {
        closeAlert();
        if (alertState.onCancel) alertState.onCancel();
      }}
      onConfirmPressed={() => {
        closeAlert();
        if (alertState.onConfirm) alertState.onConfirm();
      }}
    />
  );
}

export default GlobalAlertProvider;
