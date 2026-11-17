import {
  useEffect,
  useState,
} from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import {
  Button,
  Card,
  COLORS,
  Empty,
  ErrorBox,
  Loading,
  Row,
  Screen,
} from "../../components/ui";
import PlacesMap from "../../components/PlacesMap";
import { AnimatedEmoji } from "../../components/AnimatedEmoji";

import {
  getStorefrontProducts,
  getStorefrontStores,
} from "../../services/api";

export default function PublicMarket() {
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
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
  }, []);

  function productCount(storeId) {
    return products.filter(
      (product) =>
        String(product.store_id) ===
          String(storeId) &&
        product.active !== false
    ).length;
  }

  function openStore(store) {
    router.push({
      pathname: "/public/store/[id]",
      params: {
        id: String(store.id),
      },
    });
  }

  return (
    <Screen
      title="Tiendas VetMap"
      subtitle="Explora cada tienda antes de iniciar sesión"
      back
      backTo="/"
      showAccountActions={false}
      onRefresh={load}
      refreshing={loading}
    >
      <ErrorBox message={error} />

      <View>
        <Text style={styles.kicker}>
          TIENDAS DISPONIBLES
        </Text>
        <Text style={styles.title}>
          Entra a una tienda
        </Text>
        <Text style={styles.description}>
          Cada tienda tiene su propia pantalla con ubicación, condiciones de despacho y productos.
        </Text>
      </View>

      {loading ? (
        <Loading />
      ) : stores.length === 0 ? (
        <Empty
          icon="🏪"
          title="Sin tiendas"
        />
      ) : (
        stores.map((store) => (
          <Card key={store.id}>
            <View style={styles.storeTop}>
              <AnimatedEmoji
                emoji="🏪"
                size={36}
                motion="bounce"
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.storeName}>
                  {store.name}
                </Text>
                <Text style={styles.meta}>
                  📍 {store.commune || "Comuna ficticia"}
                </Text>
              </View>
            </View>

            <Text style={styles.meta}>
              🏠 {store.address || "Dirección ficticia"}
            </Text>
            <Row
              label="Productos publicados"
              value={productCount(store.id)}
            />

            <Button
              label="Entrar a la tienda →"
              onPress={() =>
                openStore(store)
              }
            />
          </Card>
        ))
      )}

      <PlacesMap
        title="Mapa de tiendas"
        description="Toca una tienda para abrir su catálogo."
        places={stores}
        type="store"
        onSelect={openStore}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: COLORS.teal,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  title: {
    color: COLORS.navy,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 3,
  },
  description: {
    color: COLORS.muted,
    lineHeight: 19,
    marginTop: 5,
  },
  storeTop: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  storeName: {
    color: COLORS.navy,
    fontSize: 19,
    fontWeight: "900",
  },
  meta: {
    color: COLORS.muted,
    marginTop: 5,
  },
});
