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
import { useAuth } from "../../context/AuthContext";

import {
  createStoreProduct,
  deleteStoreProduct,
  getStoreProducts,
  updateStoreProduct,
} from "../../services/api";

import {
  formatMoney,
} from "../../utils/format";

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

export default function StoreProducts() {
  const { token } = useAuth();
  const params = useLocalSearchParams();
  const [handledEditParam, setHandledEditParam] =
    useState("");

  const [items, setItems] =
    useState([]);
  const [form, setForm] =
    useState(EMPTY);
  const [editing, setEditing] =
    useState(null);
  const [show, setShow] =
    useState(false);
  const [query, setQuery] =
    useState("");

  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [ok, setOk] =
    useState("");

  async function load() {
    setLoading(true);

    try {
      setItems(
        await getStoreProducts(token)
      );
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

    if (!text) return items;

    return items.filter(
      (item) =>
        [
          item.name,
          item.brand,
          item.category,
          item.format,
          item.animal_type,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(text)
    );
  }, [items, query]);

  function reset() {
    setEditing(null);
    setShow(false);
    setForm(EMPTY);

    if (params?.edit_id) {
      router.replace("/store/products");
    }
  }

  function edit(product) {
    router.push({
      pathname:
        "/store/product-edit/[id]",
      params: {
        id: String(product.id),
      },
    });
  }

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

    try {
      const data = {
        ...form,
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
        await updateStoreProduct(
          token,
          editing,
          data
        );
      } else {
        await createStoreProduct(
          token,
          data
        );
      }

      setOk(
        editing
          ? "Producto actualizado correctamente."
          : "Producto agregado correctamente."
      );

      reset();
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <Screen
      title="Productos"
      subtitle="Catálogo de tu tienda"
      back
      backTo="/store"
      onRefresh={load}
      refreshing={loading}
    >
      <ErrorBox message={error} />
      <SuccessBox message={ok} />

      <Button
        label="＋ Agregar producto"
        onPress={() =>
          router.push(
            "/store/product-new"
          )
        }
      />

      <Input
        label="Buscar producto"
        value={query}
        onChangeText={setQuery}
        placeholder="Nombre, marca, categoría..."
      />

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
              label="Mascota"
              value={
                product.animal_type ||
                "-"
              }
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
            <Row
              label="Estado"
              value={
                product.active === false
                  ? "Inactivo"
                  : "Activo"
              }
            />

            <Button
              label="✏️ Modificar"
              compact
              variant="ghost"
              onPress={() =>
                edit(product)
              }
            />

            <Button
              label="🗑️ Eliminar"
              compact
              variant="danger"
              onPress={() =>
                confirm(
                  "Eliminar producto",
                  "Se quitará del catálogo sin borrar pedidos antiguos.",
                  async () => {
                    try {
                      await deleteStoreProduct(
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
