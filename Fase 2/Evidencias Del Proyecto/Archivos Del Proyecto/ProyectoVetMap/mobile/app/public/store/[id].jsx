import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  Button,
  Card,
  COLORS,
  Empty,
  ErrorBox,
  Input,
  Loading,
  Row,
  Screen,
  SectionTitle,
} from "../../../components/ui";
import SelectField from "../../../components/SelectField";
import PlacesMap from "../../../components/PlacesMap";
import { AnimatedEmoji } from "../../../components/AnimatedEmoji";

import {
  getStorefrontProducts,
  getStorefrontStores,
} from "../../../services/api";

import {
  formatMoney,
} from "../../../utils/format";

export default function PublicStoreDetail() {
  const { id } = useLocalSearchParams();
  const storeId = String(id || "");

  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);

    try {
      const [storeRows, productRows] =
        await Promise.all([
          getStorefrontStores(),
          getStorefrontProducts(),
        ]);

      setStores(storeRows || []);
      setProducts(productRows || []);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [storeId]);

  const store = useMemo(
    () =>
      stores.find(
        (item) =>
          String(item.id) === storeId
      ) || null,
    [stores, storeId]
  );

  const storeProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          String(product.store_id) === storeId &&
          product.active !== false
      ),
    [products, storeId]
  );

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          storeProducts
            .map((item) => item.category)
            .filter(Boolean)
        )
      ).sort(),
    [storeProducts]
  );

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();

    return storeProducts.filter((product) => {
      const haystack = [
        product.name,
        product.brand,
        product.format,
        product.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!text || haystack.includes(text)) &&
        (category === "all" ||
          String(product.category) === String(category))
      );
    });
  }, [storeProducts, query, category]);

  if (loading && !store) {
    return (
      <Screen
        title="Tienda"
        back
        backTo="/public/market"
        showAccountActions={false}
      >
        <Loading />
      </Screen>
    );
  }

  if (!store) {
    return (
      <Screen
        title="Tienda"
        back
        backTo="/public/market"
        showAccountActions={false}
      >
        <ErrorBox message="No se encontró la tienda seleccionada." />
      </Screen>
    );
  }

  return (
    <Screen
      title={store.name}
      subtitle="Catálogo público"
      back
      backTo="/public/market"
      showAccountActions={false}
      onRefresh={load}
      refreshing={loading}
    >
      <Card style={styles.hero}>
        <View style={styles.heroTop}>
          <AnimatedEmoji
            emoji="🏪"
            size={45}
            motion="bounce"
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>
              {store.name}
            </Text>
            <Text style={styles.location}>
              📍 {store.commune || "Comuna ficticia"}
            </Text>
          </View>
        </View>

        <Row
          label="Dirección"
          value={store.address || "Dirección ficticia"}
        />
        <Row
          label="Despacho"
          value={
            store.delivery_conditions ||
            "Despacho por confirmar"
          }
        />
      </Card>

      <PlacesMap
        title="Ubicación de la tienda"
        description="Ubicación demostrativa."
        places={[store]}
        type="store"
        selectedId={storeId}
      />

      <SectionTitle>
        Productos
      </SectionTitle>

      <Input
        label="Buscar en esta tienda"
        value={query}
        onChangeText={setQuery}
        placeholder="Producto, marca o formato..."
      />

      <SelectField
        label="Categoría"
        value={category}
        onChange={setCategory}
        options={[
          {
            value: "all",
            label: "Todas las categorías",
          },
          ...categories.map((item) => ({
            value: item,
            label: item,
          })),
        ]}
      />

      {filtered.length === 0 ? (
        <Empty
          icon="🔎"
          title="No encontramos productos"
        />
      ) : (
        filtered.map((product) => (
          <Card key={product.id}>
            {product.image_data ? (
              <Image
                source={{
                  uri: product.image_data,
                }}
                style={styles.productImage}
              />
            ) : (
              <View style={styles.productEmoji}>
                <AnimatedEmoji
                  emoji="📦"
                  size={40}
                  motion="float"
                />
              </View>
            )}

            <Text style={styles.productName}>
              {product.name}
            </Text>
            <Text style={styles.productMeta}>
              {[product.brand, product.format]
                .filter(Boolean)
                .join(" · ") || "Sin detalles adicionales"}
            </Text>

            <Row
              label="Precio"
              value={formatMoney(product.price)}
            />
            <Row
              label="Stock"
              value={
                Number(product.stock || 0) > 0
                  ? `${product.stock} disponibles`
                  : "Agotado"
              }
            />

            <Button
              label={
                Number(product.stock || 0) > 0
                  ? "Iniciar sesión para comprar"
                  : "Agotado"
              }
              disabled={
                Number(product.stock || 0) <= 0
              }
              onPress={() =>
                router.push("/login")
              }
            />
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: "#F4F8F7",
  },
  heroTop: {
    flexDirection: "row",
    gap: 11,
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    color: COLORS.navy,
    fontSize: 22,
    fontWeight: "900",
  },
  location: {
    color: COLORS.teal,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3,
  },
  productImage: {
    width: "100%",
    height: 180,
    borderRadius: 18,
    marginBottom: 10,
  },
  productEmoji: {
    height: 120,
    borderRadius: 18,
    marginBottom: 10,
    backgroundColor: "#EEF5F3",
    alignItems: "center",
    justifyContent: "center",
  },
  productName: {
    color: COLORS.navy,
    fontSize: 18,
    fontWeight: "900",
  },
  productMeta: {
    color: COLORS.muted,
    marginTop: 3,
    marginBottom: 6,
  },
});
