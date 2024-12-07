import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from "dayjs";

const prefix = "cache";
const expiryInMinutes = 5;

const store = async (key, value) => {
  try {
    const item = {
      value,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(prefix + key, JSON.stringify(item));
  } catch (error) {
    console.log(error);
  }
};

// Remplacer moment par dayjs
const isExpired = (item) => {
  const now = dayjs(); // Utiliser dayjs pour l'heure actuelle
  const storedTime = dayjs(item.timestamp); // Utiliser dayjs pour la timestamp stockée
  return now.diff(storedTime, "minute") > 5; // Différence en minutes
};

const get = async (key) => {
  try {
    const value = await AsyncStorage.getItem(prefix + key);
    const item = JSON.parse(value);

    if (!item) return null;

    if (isExpired(item)) {
      // Command Query Separation (CQS)
      await AsyncStorage.removeItem(prefix + key);
      return null;
    }

    return item.value;
  } catch (error) {
    console.log(error);
  }
};

export default {
  store,
  get,
};
