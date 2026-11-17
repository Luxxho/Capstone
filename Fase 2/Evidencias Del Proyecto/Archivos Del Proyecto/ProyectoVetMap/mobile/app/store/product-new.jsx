import {
  useState,
} from "react";
import {
  router,
} from "expo-router";

import {
  ErrorBox,
  Screen,
  SuccessBox,
} from "../../components/ui";
import ProductForm from "../../components/ProductForm";
import { useAuth } from "../../context/AuthContext";
import {
  createStoreProduct,
} from "../../services/api";
import {
  validateProductPrice,
} from "../../utils/productCatalog";

const EMPTY = {
  name: "",
  brand: "",
  category: "Alimentos",
  animal_type: "Perros",
  format: "",
  description: "",
  price: "",
  stock: "",
  image_data: null,
  active: true,
};

export default function StoreProductNew() {
  const { token } = useAuth();

  const [form, setForm] =
    useState(EMPTY);
  const [saving, setSaving] =
    useState(false);
  const [error, setError] =
    useState("");
  const [ok, setOk] =
    useState("");

  async function save() {
    setError("");
    setOk("");

    if (!form.name.trim()) {
      setError(
        "Ingresa el nombre del producto."
      );
      return;
    }

    if (
      !validateProductPrice(
        form.price
      )
    ) {
      setError(
        "El precio debe estar entre $1.000 y $1.000.000 CLP."
      );
      return;
    }

    if (
      !Number.isFinite(
        Number(form.stock)
      ) ||
      Number(form.stock) < 0
    ) {
      setError(
        "El stock no puede ser negativo."
      );
      return;
    }

    setSaving(true);

    try {
      await createStoreProduct(
        token,
        {
          ...form,
          price: Number(
            form.price
          ),
          stock: Number(
            form.stock
          ),
          brand:
            form.brand || null,
          animal_type:
            form.animal_type ||
            null,
          format:
            form.format || null,
          description:
            form.description ||
            null,
          image_data:
            form.image_data ||
            null,
        }
      );

      setOk(
        "Producto agregado correctamente."
      );

      setTimeout(() => {
        router.replace(
          "/store/products"
        );
      }, 500);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen
      title="Nuevo producto"
      subtitle="Agrega un producto al catálogo"
      back
      backTo="/store/products"
      showBottomNav={false}
    >
      <ErrorBox message={error} />
      <SuccessBox message={ok} />

      <ProductForm
        form={form}
        setForm={setForm}
        editing={false}
        onSave={save}
        onCancel={() =>
          router.replace(
            "/store/products"
          )
        }
        onError={setError}
        saving={saving}
      />
    </Screen>
  );
}
