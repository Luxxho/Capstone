import { Image, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";

import {
  Button,
  COLORS,
} from "./ui";

const MAX_BYTES = 2 * 1024 * 1024;

function approximateBase64Bytes(base64) {
  if (!base64) return 0;
  return Math.ceil(
    String(base64).length * 3 / 4
  );
}

export default function ImageField({
  label = "Fotografía",
  value,
  onChange,
  onError,
  helper = "Imagen JPG/PNG de máximo 2 MB.",
}) {
  async function pickImage() {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        onError?.(
          "Debes permitir acceso a tus fotos para seleccionar una imagen."
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.72,
          base64: true,
        });

      if (result.canceled) return;

      const asset = result.assets?.[0];

      if (!asset) return;

      const bytes =
        Number(asset.fileSize || 0) ||
        approximateBase64Bytes(
          asset.base64
        );

      if (bytes > MAX_BYTES) {
        onError?.(
          "La imagen no debe superar 2 MB."
        );
        return;
      }

      if (!asset.base64) {
        onError?.(
          "No se pudo procesar la imagen seleccionada."
        );
        return;
      }

      const mime =
        asset.mimeType || "image/jpeg";

      onChange(
        `data:${mime};base64,${asset.base64}`
      );
    } catch (error) {
      onError?.(
        error?.message ||
          "No se pudo cargar la imagen."
      );
    }
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>
        {label}
      </Text>

      {value ? (
        <Image
          source={{ uri: value }}
          style={styles.preview}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>
            📷
          </Text>
          <Text style={styles.emptyText}>
            Sin imagen
          </Text>
        </View>
      )}

      <Button
        label={
          value
            ? "Cambiar imagen"
            : "Seleccionar imagen"
        }
        variant="secondary"
        onPress={pickImage}
      />

      {value ? (
        <Button
          label="Quitar imagen"
          variant="ghost"
          onPress={() => onChange(null)}
        />
      ) : null}

      <Text style={styles.helper}>
        {helper}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    color: "#49655D",
    fontWeight: "800",
    marginBottom: 7,
    fontSize: 13,
  },
  preview: {
    width: 130,
    height: 130,
    borderRadius: 22,
    alignSelf: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  empty: {
    width: 130,
    height: 130,
    borderRadius: 22,
    alignSelf: "center",
    marginBottom: 8,
    backgroundColor: COLORS.mint,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyEmoji: {
    fontSize: 38,
  },
  emptyText: {
    color: COLORS.muted,
    fontWeight: "700",
    marginTop: 4,
  },
  helper: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
  },
});
