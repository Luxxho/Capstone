import {
  useEffect,
  useState,
} from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

import { formatMoney } from "../../utils/format";

const CART_KEY = "vetmap_mobile_cart";

export default function Market() {
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMap, setShowMap] = useState(false);

  async function load() {
    setLoading(true);

    try {
      const [storeRows, productRows, savedCart] =
        await Promise.all([
          getStorefrontStores(),
          getStorefrontProducts(),
          AsyncStorage.getItem(CART_KEY),
        ]);

      setStores(storeRows || []);
      setProducts(productRows || []);
      setCart(savedCart ? JSON.parse(savedCart) : []);
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

  const cartCount = cart.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0
  );

  const cartTotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  function productCount(storeId) {
    return products.filter(
      (item) =>
        String(item.store_id) === String(storeId) &&
        item.active !== false
    ).length;
  }

  function enterStore(store) {
    router.push({
      pathname: "/owner/store/[id]",
      params: {
        id: String(store.id),
      },
    });
  }

  return (
    <Screen
      title="Tiendas"
      subtitle="Elige una tienda para entrar a su catálogo"
      onRefresh={load}
      refreshing={loading}
    >
      <ErrorBox message={error} />

      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.cartSummaryNative}
        onPress={() => router.push("/owner/cart")}
      >
        <View style={styles.cartIconNative}>
          <AnimatedEmoji emoji="🛒" size={29} motion="bounce" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cartTitle}>Tu carrito</Text>
          <Text style={styles.cartText}>
            {cartCount
              ? `${cartCount} producto${cartCount === 1 ? "" : "s"} · ${formatMoney(cartTotal)}`
              : "Aún no agregas productos"}
          </Text>
        </View>
        <Text style={styles.cartChevron}>›</Text>
      </TouchableOpacity>

      <View style={styles.marketIntro}>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>MARKETPLACE VETMAP</Text>
          <Text style={styles.pageTitle}>Elige una tienda</Text>
          <Text style={styles.pageDescription}>Cada tienda abre en su propia pantalla con catálogo, filtros y carrito.</Text>
        </View>
        <AnimatedEmoji emoji="🏪" size={44} motion="float" />
      </View>

      <View style={styles.marketActions}>
        <TouchableOpacity
          style={[styles.mapToggle, showMap && styles.mapToggleActive]}
          onPress={() => setShowMap((value) => !value)}
        >
          <Text style={[styles.mapToggleText, showMap && styles.mapToggleTextActive]}>
            {showMap ? "Ocultar mapa" : "🗺️ Ver mapa"}
          </Text>
        </TouchableOpacity>
      </View>

      {showMap ? (
        <PlacesMap
          title="Mapa de tiendas"
          description="Toca una tienda en el mapa para abrir su catálogo."
          places={stores}
          type="store"
          onSelect={enterStore}
        />
      ) : null}

      {loading ? (
        <Loading />
      ) : stores.length === 0 ? (
        <Empty icon="🏪" title="No hay tiendas disponibles" />
      ) : (
        stores.map((store) => (
          <TouchableOpacity
            key={store.id}
            activeOpacity={0.87}
            style={styles.nativeStoreCard}
            onPress={() => enterStore(store)}
          >
            <View style={styles.storeIcon}>
              <AnimatedEmoji emoji="🏪" size={31} motion="bounce" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.storeName}>{store.name}</Text>
              <Text style={styles.location}>📍 {store.commune || "Comuna ficticia"}</Text>
              <Text style={styles.nativeStoreMeta}>
                {productCount(store.id)} productos · {store.delivery_conditions || "Despacho por confirmar"}
              </Text>
            </View>

            <View style={styles.enterStoreButton}>
              <Text style={styles.enterStoreText}>›</Text>
            </View>
          </TouchableOpacity>
        ))
      )}

    </Screen>
  );
}

const styles = StyleSheet.create({
  cartSummaryNative: {
    minHeight: 76,
    backgroundColor: "white",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cartIconNative: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.mint100,
    alignItems: "center",
    justifyContent: "center",
  },
  cartChevron: { color: COLORS.mint600, fontSize: 28, fontWeight: "900" },
  marketIntro: {
    minHeight: 105,
    borderRadius: 22,
    backgroundColor: "#D7F5F1",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  marketActions: { flexDirection: "row", justifyContent: "flex-end" },
  mapToggle: {
    minHeight: 36,
    borderRadius: 12,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  mapToggleActive: { backgroundColor: COLORS.mint100 },
  mapToggleText: { color: COLORS.mint700, fontSize: 10, fontWeight: "900" },
  mapToggleTextActive: { color: COLORS.navy },
  nativeStoreCard: {
    minHeight: 90,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  nativeStoreMeta: {
    color: COLORS.muted,
    fontSize: 9,
    marginTop: 4,
  },
  enterStoreButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.mint100,
    alignItems: "center",
    justifyContent: "center",
  },
  enterStoreText: {
    color: COLORS.mint700,
    fontSize: 25,
    lineHeight: 27,
    fontWeight: "900",
  },
  cartSummary: {
    backgroundColor: "#F4F8F7",
  },
  cartTop: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  cartTitle: {
    color: COLORS.navy,
    fontSize: 17,
    fontWeight: "900",
  },
  cartText: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
  },
  kicker: {
    color: COLORS.teal,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  pageTitle: {
    color: COLORS.navy,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 3,
  },
  pageDescription: {
    color: COLORS.muted,
    lineHeight: 19,
    marginTop: 5,
  },
  storeHeader: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  storeIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#E9F7F2",
    alignItems: "center",
    justifyContent: "center",
  },
  storeName: {
    color: COLORS.navy,
    fontSize: 19,
    fontWeight: "900",
  },
  location: {
    color: COLORS.teal,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3,
  },
  demoBadge: {
    backgroundColor: "#FFF5D9",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  demoText: {
    color: "#866109",
    fontSize: 10,
    fontWeight: "900",
  },
  meta: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
  },
});
