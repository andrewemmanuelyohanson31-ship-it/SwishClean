// Photo capture/pick used by Ulasan, Chat, mitra KTP/wajah and SKCK.
// shortcut: returns local URIs only; upload to private storage (never a public bucket) once a backend exists.
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";
import { showToast } from "./store";

type Opts = { camera?: boolean; front?: boolean; limit?: number };

/** Returns picked image URIs, or [] if cancelled/denied (the user is told why). */
export async function pickImages({ camera, front, limit = 1 }: Opts = {}): Promise<string[]> {
  try {
    if (camera && Platform.OS !== "web") {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        showToast("Izin kamera ditolak. Aktifkan di Pengaturan HP.");
        return [];
      }
    }
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      quality: 0.7,
      allowsMultipleSelection: !camera && limit > 1,
      selectionLimit: limit,
      cameraType: front ? ImagePicker.CameraType.front : ImagePicker.CameraType.back,
    };
    const res = camera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
    if (res.canceled) return [];
    return res.assets.slice(0, limit).map((a) => a.uri);
  } catch {
    showToast("Tidak bisa membuka kamera/galeri di perangkat ini.");
    return [];
  }
}
