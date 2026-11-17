import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Image,
  StyleSheet,
  Text,
} from "react-native";
import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  Button,
  Card,
  confirm,
  Empty,
  ErrorBox,
  Input,
  Loading,
  Row,
  Screen,
  SuccessBox,
} from "../../components/ui";
import ProductForm from "../../components/ProductForm";
import SelectField from "../../components/SelectField";
import { useAuth } from "../../context/AuthContext";

import {
  createAdminStoreProduct,
  deleteAdminStoreProduct,
  getAdminStoreProducts,
  getStorefrontStores,
  updateAdminStoreProduct,
} from "../../services/api";

import {
  formatMoney,
} from "../../utils/format";

import {
  validateProductPrice,
} from "../../utils/productCatalog";

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

export default function AdminProducts() {
  const { token } = useAuth();
  const params = useLocalSearchParams();
  const [handledEditParam, setHandledEditParam] =
    useState("");

  const [items, setItems] =
    useState([]);
  const [stores, setStores] =
    useState([]);
  const [form, setForm] =
    useState(EMPTY);
  const [editing, setEditing] =
    useState(null);
  const [show, setShow] =
    useState(false);
  const [query, setQuery] =
    useState("");
  const [storeFilter, setStoreFilter] =
    useState("all");

  const [loading, setLoading] =
    useState(true);
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

      setItems(products || []);
      setStores(storeRows || []);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const requestedId =
      params?.edit_id
        ? String(params.edit_id)
        : "";

    if (!requestedId) {
      if (handledEditParam) {
        setHandledEditParam("");
      }
      return;
    }

    if (
      requestedId === handledEditParam ||
      !items.length
    ) {
      return;
    }

    const product = items.find(
      (item) =>
        String(item.id) === requestedId
    );

    if (product) {
      setHandledEditParam(requestedId);
      setStoreFilter(
        String(product.store_id)
      );
      edit(product);
    }
  }, [
    params?.edit_id,
    items.length,
    handledEditParam,
  ]);

  const filtered = useMemo(() => {
    const text = query
      .trim()
      .toLowerCase();

    return items.filter(
      (product) => {
        const matchesSearch =
          !text ||
          [
            product.name,
            product.brand,
            product.category,
            product.format,
            product.store_name,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(text);

        const matchesStore =
          storeFilter === "all" ||
          String(
            product.store_id
          ) === String(storeFilter);

        return (
          matchesSearch &&
          matchesStore
        );
      }
    );
  }, [
    items,
    query,
    storeFilter,
  ]);

  function reset() {
    setEditing(null);
    setShow(false);
    setForm(EMPTY);

    if (params?.edit_id) {
      router.replace("/admin/products");
    }
  }

  function edit(product) {
    router.push({
      pathname:
        "/admin/product-edit/[id]",
      params: {
        id: String(product.id),
      },
    });
  }

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

    try {
      const data = {
        ...form,
        store_id: Number(
          form.store_id
        ),
        price: Number(form.price),
        stock: Number(form.stock),
        brand:
          form.brand || null,
        animal_type:
          form.animal_type || null,
        format:
          form.format || null,
        description:
          form.description || null,
        image_data:
          form.image_data || null,
      };

      if (editing) {
        await updateAdminStoreProduct(
          token,
          editing,
          data
        );
      } else {
        await createAdminStoreProduct(
          token,
          data
        );
      }

      setOk(
        editing
          ? "Producto actualizado por el administrador."
          : "Producto agregado por el administrador."
      );

      reset();
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <Screen
      title="Productos globales"
      subtitle="Gestiona productos de cualquier tienda"
      back
      backTo="/admin"
      onRefresh={load}
      refreshing={loading}
    >
      <ErrorBox message={error} />
      <SuccessBox message={ok} />

      <Button
        label="＋ Agregar producto"
        onPress={() =>
          router.push(
            "/admin/product-new"
          )
        }
      />

      <Input
        label="Buscar"
        placeholder="Nombre, marca, categoría, formato o tienda..."
        value={query}
        onChangeText={setQuery}
      />

      <SelectField
        label="Filtrar por tienda"
        options={[
          {
            value: "all",
            label: "Todas las tiendas",
          },
          ...stores.map(
            (store) => ({
              value: String(
                store.id
              ),
              label: store.name,
            })
          ),
        ]}
        value={storeFilter}
        onChange={setStoreFilter}
      />

      <Text style={styles.count}>
        {filtered.length} productos visibles
      </Text>

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <Empty
          icon="📦"
          title="No hay productos para mostrar"
        />
      ) : (
        filtered.map((product) => (
          <Card key={product.id}>
            {product.image_data ? (
              <Image
                source={{
                  uri: product.image_data,
                }}
                style={
                  styles.productImage
                }
              />
            ) : null}

            <Text style={styles.name}>
              {product.name}
            </Text>

            <Row
              label="Tienda"
              value={
                product.store_name
              }
            />
            <Row
              label="Ubicación"
              value={
                product.store_commune ||
                "-"
              }
            />
            <Row
              label="Marca"
              value={
                product.brand ||
                "Sin marca"
              }
            />
            <Row
              label="Categoría"
              value={product.category}
            />
            <Row
              label="Formato"
              value={
                product.format || "-"
              }
            />
            <Row
              label="Precio"
              value={formatMoney(
                product.price
              )}
            />
            <Row
              label="Stock"
              value={product.stock}
            />

            <Button
              label="✏️ Modificar"
              variant="ghost"
              onPress={() =>
                edit(product)
              }
            />

            <Button
              label="🗑️ Eliminar"
              variant="danger"
              onPress={() =>
                confirm(
                  "Eliminar producto",
                  `¿Eliminar ${product.name}?`,
                  async () => {
                    try {
                      await deleteAdminStoreProduct(
                        token,
                        product.id
                      );
                      await load();
                    } catch (e) {
                      setError(
                        e.message
                      );
                    }
                  }
                )
              }
            />
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  count: {
    color: "#6AA896",
    fontWeight: "800",
  },
  name: {
    color: "#162850",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 5,
  },
  productImage: {
    width: "100%",
    height: 170,
    borderRadius: 18,
    marginBottom: 10,
    backgroundColor: "#EEF5F3",
  },
});
