import { View } from "react-native";

import { Input } from "./ui";
import SelectField from "./SelectField";
import {
  CHILE_LOCATIONS,
  VETMAP_COUNTRIES,
} from "../utils/locations";

export default function LocationSelector({
  country,
  region,
  city,
  onChange,
}) {
  const chileRegions = Object.keys(
    CHILE_LOCATIONS
  );

  const communes =
    country === "Chile" && region
      ? CHILE_LOCATIONS[region] || []
      : [];

  const countryOptions = [
    ...(
      country &&
      !VETMAP_COUNTRIES.includes(country)
        ? [country]
        : []
    ),
    ...VETMAP_COUNTRIES,
  ];

  return (
    <View>
      <SelectField
        label="País"
        searchable
        searchPlaceholder="Buscar país..."
        placeholder="Selecciona un país"
        options={countryOptions.map(
          (item) => ({
            value: item,
            label: item,
          })
        )}
        value={country || ""}
        onChange={(nextCountry) =>
          onChange?.({
            country: nextCountry,
            region: "",
            city: "",
          })
        }
      />

      {country === "Chile" ? (
        <>
          <SelectField
            label="Región"
            searchable
            searchPlaceholder="Buscar región..."
            placeholder="Selecciona una región"
            options={chileRegions.map(
              (item) => ({
                value: item,
                label: item,
              })
            )}
            value={region || ""}
            onChange={(nextRegion) =>
              onChange?.({
                country,
                region: nextRegion,
                city: "",
              })
            }
          />

          <SelectField
            label="Ciudad / Comuna"
            searchable
            searchPlaceholder="Buscar comuna..."
            disabled={!region}
            placeholder={
              region
                ? "Selecciona una comuna"
                : "Primero selecciona una región"
            }
            options={communes.map(
              (item) => ({
                value: item,
                label: item,
              })
            )}
            value={city || ""}
            onChange={(nextCity) =>
              onChange?.({
                country,
                region,
                city: nextCity,
              })
            }
          />
        </>
      ) : (
        <>
          <Input
            label="Región / Estado"
            placeholder="Región o estado"
            value={region || ""}
            onChangeText={(nextRegion) =>
              onChange?.({
                country,
                region: nextRegion,
                city,
              })
            }
          />

          <Input
            label="Ciudad / Comuna"
            placeholder="Ciudad o comuna"
            value={city || ""}
            onChangeText={(nextCity) =>
              onChange?.({
                country,
                region,
                city: nextCity,
              })
            }
          />
        </>
      )}
    </View>
  );
}
