import { StyleSheet, Text, View } from "react-native";

import {
  Button,
  Card,
  ChoiceRow,
  Input,
} from "./ui";
import ImageField from "./ImageField";
import PresetField from "./PresetField";
import SelectField from "./SelectField";

import {
  PRODUCT_CATEGORIES,
  productFormatsForCategory,
  productTemplatesForCategory,
} from "../utils/productCatalog";

export default function ProductForm({
  form,
  setForm,
  stores = [],
  requireStore = false,
  editing = false,
  stockFocus = false,
  saving = false,
  onSave,
  onCancel,
  onError,
}) {
  const set = (key, value) =>
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

  const templates =
    productTemplatesForCategory(
      form.category
    );

  function applyTemplate(name) {
    const template =
      templates.find(
        (item) =>
          item.name === name
      );

    if (!template) return;

    setForm((current) => ({
      ...current,
      name: template.name,
      brand: template.brand,
      animal_type:
        template.animal_type,
      format: template.format,
      description:
        template.description,
    }));
  }

  return (
    <Card>
      <Text
        style={{
          color: "#162850",
          fontSize: 18,
          fontWeight: "900",
          marginBottom: 8,
        }}
      >
        {editing
          ? "Modificar producto"
          : "Agregar producto"}
      </Text>

      {requireStore ? (
        <SelectField
          label="Tienda"
          placeholder="Selecciona una tienda"
          options={stores.map(
            (store) => ({
              value: String(
                store.id
              ),
              label: `${store.name} · ${
                store.commune || ""
              }`,
            })
          )}
          value={String(
            form.store_id || ""
          )}
          onChange={(value) =>
            set("store_id", value)
          }
        />
      ) : null}

      <SelectField
        label="Categoría"
        options={PRODUCT_CATEGORIES.map(
          (category) => ({
            value: category,
            label: category,
          })
        )}
        value={form.category}
        onChange={(value) =>
          setForm((current) => ({
            ...current,
            category: value,
            format: "",
          }))
        }
      />

      <SelectField
        label="Producto sugerido"
        placeholder={`Elegir producto de ${form.category}`}
        options={templates.map(
          (item) => ({
            value: item.name,
            label: item.name,
          })
        )}
        value=""
        onChange={applyTemplate}
      />

      <Text
        style={{
          color: "#526A63",
          fontSize: 11,
          marginTop: -7,
          marginBottom: 10,
        }}
      >
        Opcional. VetMap completa varios campos y luego puedes modificarlos.
      </Text>

      <Input
        label="Nombre"
        value={form.name}
        onChangeText={(value) =>
          set("name", value)
        }
        placeholder="Nombre del producto"
      />

      <Input
        label="Marca"
        value={form.brand}
        onChangeText={(value) =>
          set("brand", value)
        }
        placeholder="Marca"
      />

      <PresetField
        label="Mascota"
        options={[
          "Perros",
          "Gatos",
          "Perros y gatos",
          "Conejos",
          "Hámsteres",
          "Cobayos",
          "Hurones",
          "Aves",
          "Canarios",
          "Periquitos",
          "Loros",
          "Peces",
          "Tortugas",
          "Iguanas",
          "Geckos",
          "Erizos",
          "Chinchillas",
          "Ratones",
          "Ratas domésticas",
          "Cerdos miniatura",
          "Multi-especie",
        ]}
        value={form.animal_type}
        onChange={(value) =>
          set(
            "animal_type",
            value
          )
        }
        customLabel="+ Otra especie"
      />

      <PresetField
        label="Formato"
        options={productFormatsForCategory(
          form.category
        )}
        value={form.format}
        onChange={(value) =>
          set("format", value)
        }
        customLabel="+ Otro formato"
        placeholder="Ej.: 15 kg"
      />

      <Input
        label="Precio CLP"
        keyboardType="numeric"
        value={String(
          form.price ?? ""
        )}
        onChangeText={(value) =>
          set("price", value)
        }
        placeholder="Ej.: 12990"
      />

      <Text
        style={{
          color: "#526A63",
          fontSize: 11,
          marginTop: -7,
          marginBottom: 10,
        }}
      >
        Mínimo $1.000 · Máximo $1.000.000 CLP.
      </Text>

      {stockFocus ? (
        <View style={styles.stockFocusBox}>
          <Text style={styles.stockFocusTitle}>
            ⚠️ Producto con stock bajo
          </Text>
          <Text style={styles.stockFocusText}>
            Ajusta la cantidad disponible y guarda los cambios.
          </Text>
        </View>
      ) : null}

      <Input
        label="Stock"
        keyboardType="numeric"
        autoFocus={stockFocus}
        value={String(
          form.stock ?? ""
        )}
        onChangeText={(value) =>
          set("stock", value)
        }
        placeholder="Ej.: 20"
        style={
          stockFocus
            ? styles.stockFocusedInput
            : null
        }
      />

      <Input
        label="Descripción"
        multiline
        value={form.description}
        onChangeText={(value) =>
          set(
            "description",
            value
          )
        }
        placeholder="Describe brevemente el producto"
      />

      <ImageField
        label="Imagen del producto"
        value={form.image_data}
        onChange={(value) =>
          set(
            "image_data",
            value
          )
        }
        onError={onError}
      />

      <ChoiceRow
        label="Estado del producto"
        options={[
          {
            value: true,
            label: "Activo",
          },
          {
            value: false,
            label: "Inactivo",
          },
        ]}
        value={form.active}
        onChange={(value) =>
          set("active", value)
        }
      />

      <Button
        label={
          saving
            ? "Guardando..."
            : editing
            ? "✓ Guardar cambios"
            : "＋ Agregar producto"
        }
        disabled={saving}
        onPress={onSave}
      />

      {onCancel ? (
        <Button
          label="Volver sin guardar"
          variant="ghost"
          disabled={saving}
          onPress={onCancel}
        />
      ) : null}
    </Card>
  );
}


const styles = StyleSheet.create({
  stockFocusBox: {
    backgroundColor: "#FFF8DF",
    borderWidth: 1,
    borderColor: "#EED58C",
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  stockFocusTitle: {
    color: "#7A5A08",
    fontWeight: "900",
    fontSize: 13,
  },
  stockFocusText: {
    color: "#806820",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  stockFocusedInput: {
    borderColor: "#D59A1C",
    borderWidth: 2,
    backgroundColor: "#FFFDF5",
  },
});
