import {
  useEffect,
  useState,
} from "react";
import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  ErrorBox,
  Loading,
  Screen,
  SuccessBox,
} from "../../../components/ui";
import ProductForm from "../../../components/ProductForm";
import { useAuth } from "../../../context/AuthContext";
import {
  getAdminStoreProducts,
  getStorefrontStores,
  updateAdminStoreProduct,
} from "../../../services/api";
import {
  validateProductPrice,
} from "../../../utils/productCatalog";

const EMPTY = {
  store_id: "",
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

export default function AdminProductEdit() {
  const { token } = useAuth();
  const {
    id,
    stock_focus,
  } = useLocalSearchParams();

  const productId = Number(id);

  const [stores, setStores] =
    useState([]);
  const [form, setForm] =
    useState(EMPTY);
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [error, setError] =
    useState("");
  const [ok, setOk] =
    useState("");

  async function load() {
    setLoading(true);

    try {
      const [products, storeRows] =
        await Promise.all([
          getAdminStoreProducts(
            token
          ),
          getStorefrontStores(),
        ]);

      setStores(storeRows || []);

      const product =
        (products || []).find(
          (item) =>
            Number(item.id) ===
            productId
        );

      if (!product) {
        setError(
          "No se encontró el producto."
        );
        return;
      }

      setForm({
        store_id: String(
          product.store_id || ""
        ),
        name: product.name || "",
        brand: product.brand || "",
        category:
          product.category ||
          "Alimentos",
        animal_type:
          product.animal_type ||
          "",
        format:
          product.format || "",
        description:
          product.description ||
          "",
        price: String(
          product.price ?? ""
        ),
        stock: String(
          product.stock ?? ""
        ),
        image_data:
          product.image_data ||
          null,
        active:
          product.active !==
          false,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [productId]);

  async function save() {
    setError("");
    setOk("");

    if (
      !form.store_id ||
      !form.name.trim()
    ) {
      setError(
        "Selecciona una tienda e ingresa el nombre del producto."
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
      await updateAdminStoreProduct(
        token,
        productId,
        {
          ...form,
          store_id: Number(
            form.store_id
          ),
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
        "Producto actualizado por el administrador."
      );

      setTimeout(() => {
        router.replace(
          "/admin/products"
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
      title="Editar producto"
      subtitle="Modifica producto y stock"
      back
      backTo="/admin/products"
      showBottomNav={false}
    >
      <ErrorBox message={error} />
      <SuccessBox message={ok} />

      {loading ? (
        <Loading />
      ) : (
        <ProductForm
          form={form}
          setForm={setForm}
          stores={stores}
          requireStore
          editing
          stockFocus={
            stock_focus === "1"
          }
          onSave={save}
          onCancel={() =>
            router.replace(
              "/admin/products"
            )
          }
          onError={setError}
          saving={saving}
        />
      )}
    </Screen>
  );
}
