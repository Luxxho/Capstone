import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { API_URL } from "./api";

async function errorText(response, fallback) {
  try {
    const data = await response.json();
    return data.detail || fallback;
  } catch {
    return fallback;
  }
}

export async function downloadProtectedPdf(token, path, filename) {
  const url = `${API_URL}${path}`;

  if (Platform.OS === "web") {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error(await errorText(response, "No se pudo descargar el PDF"));
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
    return;
  }

  const destination = `${FileSystem.cacheDirectory}${filename}`;
  const result = await FileSystem.downloadAsync(url, destination, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (result.status < 200 || result.status >= 300) {
    throw new Error(`No se pudo descargar el PDF (HTTP ${result.status})`);
  }
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) throw new Error("El dispositivo no permite compartir archivos.");
  await Sharing.shareAsync(result.uri, { mimeType: "application/pdf", dialogTitle: "VetMap PDF" });
}

export function downloadAppointmentReport(token, appointmentId) {
  return downloadProtectedPdf(token, `/api/reports/appointments/${appointmentId}/pdf`, `VetMap_Atencion_${appointmentId}.pdf`);
}

export function downloadOrderReceipt(token, orderId) {
  return downloadProtectedPdf(token, `/api/storefront/orders/${orderId}/receipt.pdf`, `VetMap_Pedido_${orderId}.pdf`);
}
