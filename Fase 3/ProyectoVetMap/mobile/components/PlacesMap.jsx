import React, { useMemo, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Location from "expo-location";

import {
  Button,
  Card,
  COLORS,
} from "./ui";
import { AnimatedEmoji } from "./AnimatedEmoji";

const STORE_FALLBACKS = {
  "Mundo Mascota": {
    latitude: -33.4550,
    longitude: -70.6500,
  },
  "PetMarket Norte": {
    latitude: -33.3615,
    longitude: -70.7288,
  },
  "Animal Shop": {
    latitude: -33.4370,
    longitude: -70.6105,
  },
};

const CLINIC_FALLBACKS = {
  "Clínica Huellitas": {
    latitude: -33.4489,
    longitude: -70.6693,
  },
  "VetMap Urgencias": {
    latitude: -33.4315,
    longitude: -70.6095,
  },
  "Centro Animal Norte": {
    latitude: -33.3668,
    longitude: -70.7293,
  },
};

function normalizedPlace(place, type) {
  const latitude = Number(place?.latitude);
  const longitude = Number(place?.longitude);

  if (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  ) {
    return {
      ...place,
      latitude,
      longitude,
    };
  }

  const fallbacks =
    type === "clinic"
      ? CLINIC_FALLBACKS
      : STORE_FALLBACKS;

  const fallback =
    fallbacks[place?.name];

  if (!fallback) return null;

  return {
    ...place,
    ...fallback,
  };
}

function distanceKm(a, b) {
  if (!a || !b) return null;

  const R = 6371;
  const rad = (v) =>
    (Number(v) * Math.PI) / 180;

  const lat1 = rad(a.latitude);
  const lat2 = rad(b.latitude);
  const dLat = rad(
    b.latitude - a.latitude
  );
  const dLon = rad(
    b.longitude - a.longitude
  );

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) ** 2;

  return (
    R *
    2 *
    Math.atan2(
      Math.sqrt(h),
      Math.sqrt(1 - h)
    )
  );
}

function mapBounds(points) {
  const fallback = {
    minLat: -33.52,
    maxLat: -33.30,
    minLon: -70.80,
    maxLon: -70.52,
  };

  if (!points.length) return fallback;

  const lats = points.map(
    (item) => item.latitude
  );
  const lons = points.map(
    (item) => item.longitude
  );

  let minLat = Math.min(...lats);
  let maxLat = Math.max(...lats);
  let minLon = Math.min(...lons);
  let maxLon = Math.max(...lons);

  const latPad = Math.max(
    0.03,
    (maxLat - minLat) * 0.32
  );
  const lonPad = Math.max(
    0.04,
    (maxLon - minLon) * 0.32
  );

  minLat -= latPad;
  maxLat += latPad;
  minLon -= lonPad;
  maxLon += lonPad;

  return {
    minLat,
    maxLat,
    minLon,
    maxLon,
  };
}

export default function PlacesMap({
  title,
  description,
  places = [],
  type = "store",
  selectedId = null,
  onSelect,
}) {
  const [userLocation, setUserLocation] =
    useState(null);
  const [locationMessage, setLocationMessage] =
    useState("");
  const [locating, setLocating] =
    useState(false);

  const validPlaces = useMemo(
    () =>
      places
        .map((item) =>
          normalizedPlace(item, type)
        )
        .filter(Boolean),
    [places, type]
  );

  const pointsForBounds = [
    ...validPlaces,
    ...(userLocation
      ? [userLocation]
      : []),
  ];

  const bounds = useMemo(
    () => mapBounds(pointsForBounds),
    [
      validPlaces
        .map(
          (x) =>
            `${x.latitude}:${x.longitude}`
        )
        .join("|"),
      userLocation?.latitude,
      userLocation?.longitude,
    ]
  );

  const width =
    bounds.maxLon - bounds.minLon;
  const height =
    bounds.maxLat - bounds.minLat;

  function pointStyle(latitude, longitude) {
    const left =
      ((longitude - bounds.minLon) /
        width) *
      100;

    const top =
      ((bounds.maxLat - latitude) /
        height) *
      100;

    return {
      left: `${Math.max(
        4,
        Math.min(94, left)
      )}%`,
      top: `${Math.max(
        5,
        Math.min(90, top)
      )}%`,
    };
  }

  const bbox = [
    bounds.minLon,
    bounds.minLat,
    bounds.maxLon,
    bounds.maxLat,
  ].join(",");

  const osmSrc =
    `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
      bbox
    )}&layer=mapnik`;

  async function locateMe() {
    setLocating(true);
    setLocationMessage("");

    try {
      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (
        permission.status !==
        "granted"
      ) {
        setLocationMessage(
          "No se otorgó permiso para usar tu ubicación."
        );
        return;
      }

      const current =
        await Location.getCurrentPositionAsync({
          accuracy:
            Location.Accuracy.Balanced,
        });

      setUserLocation({
        latitude:
          current.coords.latitude,
        longitude:
          current.coords.longitude,
      });

      setLocationMessage(
        "Ubicación detectada. Puedes comparar qué establecimiento está más cerca."
      );
    } catch {
      setLocationMessage(
        "No se pudo obtener tu ubicación en este momento."
      );
    } finally {
      setLocating(false);
    }
  }

  return (
    <Card>
      <View style={styles.heading}>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>
            {type === "clinic"
              ? "MAPA VETERINARIO"
              : "MAPA DE TIENDAS"}
          </Text>

          <Text style={styles.title}>
            {title}
          </Text>

          <Text style={styles.description}>
            {description}
          </Text>
        </View>
      </View>

      <Button
        label={
          locating
            ? "Buscando ubicación..."
            : "📍 Usar mi ubicación"
        }
        variant="ghost"
        onPress={locateMe}
        disabled={locating}
      />

      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          🧪 Datos demostrativos · Todos los establecimientos y direcciones son ficticios.
        </Text>
      </View>

      {locationMessage ? (
        <Text style={styles.locationMessage}>
          {locationMessage}
        </Text>
      ) : null}

      <View style={styles.map}>
        {Platform.OS === "web"
          ? React.createElement("iframe", {
              src: osmSrc,
              title,
              style: {
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                border: 0,
                borderRadius: "16px",
              },
            })
          : (
            <View
              style={styles.nativeMapFallback}
            >
              <Text
                style={
                  styles.nativeMapText
                }
              >
                Mapa VetMap
              </Text>
            </View>
          )}

        {validPlaces.map((place) => {
          const active =
            String(selectedId) ===
            String(place.id);

          const distance =
            userLocation
              ? distanceKm(
                  userLocation,
                  place
                )
              : null;

          return (
            <TouchableOpacity
              key={String(place.id)}
              activeOpacity={0.85}
              onPress={() =>
                onSelect?.(place)
              }
              style={[
                styles.pin,
                pointStyle(
                  place.latitude,
                  place.longitude
                ),
                active &&
                  styles.pinActive,
              ]}
            >
              <View style={styles.pinEmoji}>
                <AnimatedEmoji
                  emoji={
                    type === "clinic"
                      ? "🏥"
                      : "🏪"
                  }
                  size={22}
                  motion="bounce"
                />
              </View>

              <View
                style={
                  styles.pinBubble
                }
              >
                <Text
                  numberOfLines={1}
                  style={
                    styles.pinName
                  }
                >
                  {place.name}
                </Text>

                {distance != null ? (
                  <Text
                    style={
                      styles.pinDistance
                    }
                  >
                    {distance.toFixed(1)} km
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}

        {userLocation ? (
          <View
            pointerEvents="none"
            style={[
              styles.userPin,
              pointStyle(
                userLocation.latitude,
                userLocation.longitude
              ),
            ]}
          >
            <AnimatedEmoji emoji="📍" size={18} motion="pulse" />
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    gap: 10,
  },
  kicker: {
    color: COLORS.teal,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  title: {
    color: COLORS.navy,
    fontSize: 21,
    fontWeight: "900",
    marginTop: 4,
  },
  description: {
    color: COLORS.muted,
    lineHeight: 19,
    marginTop: 5,
    marginBottom: 8,
  },
  notice: {
    backgroundColor: "#FFF8DF",
    borderWidth: 1,
    borderColor: "#EED59B",
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  noticeText: {
    color: "#7A5A00",
    fontSize: 11,
    fontWeight: "700",
  },
  locationMessage: {
    color: COLORS.teal,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  map: {
    height: 310,
    backgroundColor: "#E9F2EF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    position: "relative",
  },
  nativeMapFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#DDECE7",
    alignItems: "center",
    justifyContent: "center",
  },
  nativeMapText: {
    color: COLORS.muted,
    fontWeight: "900",
    fontSize: 18,
  },
  pin: {
    position: "absolute",
    transform: [
      { translateX: -18 },
      { translateY: -18 },
    ],
    zIndex: 5,
    alignItems: "center",
  },
  pinActive: {
    zIndex: 8,
  },
  pinEmoji: {
    fontSize: 25,
    backgroundColor: "white",
    borderRadius: 18,
    width: 36,
    height: 36,
    textAlign: "center",
    lineHeight: 34,
    borderWidth: 2,
    borderColor: COLORS.teal,
  },
  pinBubble: {
    marginTop: 2,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    maxWidth: 132,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pinName: {
    color: COLORS.navy,
    fontSize: 10,
    fontWeight: "900",
  },
  pinDistance: {
    color: COLORS.teal,
    fontSize: 9,
    fontWeight: "800",
    marginTop: 1,
  },
  userPin: {
    position: "absolute",
    transform: [
      { translateX: -12 },
      { translateY: -12 },
    ],
    zIndex: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: COLORS.navy,
    alignItems: "center",
    justifyContent: "center",
  },
});
