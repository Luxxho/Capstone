import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  SuccessBox,
} from "../../../components/ui";
import SelectField from "../../../components/SelectField";
import PlacesMap from "../../../components/PlacesMap";
import { AnimatedEmoji } from "../../../components/AnimatedEmoji";
import CartAddedToast from "../../../components/CartAddedToast";

import {
  getStorefrontProducts,
  getStorefrontStores,
} from "../../../services/api";

import {
  formatMoney,
} from "../../../utils/format";

const CART_KEY = "vetmap_mobile_cart";

export default function StoreDetail() {
  const { id } = useLocalSearchParams();
  const storeId = String(id || "");

  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [compareProduct, setCompareProduct] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [showStoreInfo, setShowStoreInfo] = useState(false);

  const [cartToast, setCartToast] = useState(null);
  const cartToastTimer = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

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
  }, [storeId]);

  useEffect(() => {
    return () => {
      if (cartToastTimer.current) {
        clearTimeout(
          cartToastTimer.current
        );
      }
    };
  }, []);

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
        product.category,
        product.format,
        product.animal_type,
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

  const cartCount = cart.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0
  );

  function cartQuantityFor(productId) {
    const item = cart.find(
      (cartItem) =>
        Number(cartItem.id) === Number(productId)
    );

    return item
      ? Number(item.quantity || 0)
      : 0;
  }

  function availableStock(product) {
    return Math.max(
      0,
      Number(product.stock || 0) -
        cartQuantityFor(product.id)
    );
  }

  async function persist(next) {
    setCart(next);
    await AsyncStorage.setItem(
      CART_KEY,
      JSON.stringify(next)
    );
  }

  async function add(product) {
    const index = cart.findIndex(
      (item) => item.id === product.id
    );

    const currentQuantity =
      index >= 0
        ? Number(cart[index].quantity || 0)
        : 0;

    if (
      currentQuantity >=
      Number(product.stock || 0)
    ) {
      setError(
        `No hay más stock disponible de ${product.name}.`
      );
      return;
    }

    const next = [...cart];

    if (index >= 0) {
      next[index] = {
        ...next[index],
        quantity:
          Number(next[index].quantity || 0) + 1,
      };
    } else {
      next.push({
        ...product,
        quantity: 1,
      });
    }

    await persist(next);
    setError("");
    setOk("");

    const nextQuantity =
      index >= 0
        ? Number(
            next[index].quantity || 1
          )
        : 1;

    setCartToast({
      productName: product.name,
      quantity: nextQuantity,
    });

    if (cartToastTimer.current) {
      clearTimeout(
        cartToastTimer.current
      );
    }

    cartToastTimer.current =
      setTimeout(() => {
        setCartToast(null);
      }, 2200);
  }

  const comparisons = useMemo(() => {
    if (!compareProduct?.comparison_key) {
      return [];
    }

    return products
      .filter(
        (product) =>
          String(product.comparison_key || "") ===
          String(compareProduct.comparison_key)
      )
      .sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      );
  }, [products, compareProduct]);

  function openComparison(product) {
    setCompareProduct(product);
    setCompareOpen(true);
  }

  if (loading && !store) {
    return (
      <Screen
        title="Tienda"
        back
        backTo="/owner/market"
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
        backTo="/owner/market"
      >
        <ErrorBox message="No se encontró la tienda seleccionada." />
      </Screen>
    );
  }

  return (
    <Screen
      title={store.name}
      subtitle="Catálogo de esta tienda"
      back
      backTo="/owner/market"
      onRefresh={load}
      refreshing={loading}
    >
      <ErrorBox message={error} />
      <SuccessBox message={ok} />

      <CartAddedToast
        visible={Boolean(cartToast)}
        productName={
          cartToast?.productName || ""
        }
        quantity={
          cartToast?.quantity || 1
        }
      />

      <View style={styles.storeNativeHero}>
        <View style={{ flex: 1 }}>
          <Text style={styles.storeNativeKicker}>TIENDA VETMAP</Text>
          <Text style={styles.storeNativeName}>{store.name}</Text>
          <Text style={styles.storeNativeSubtitle}>Todo para su bienestar</Text>
        </View>
        <AnimatedEmoji emoji="🐶" size={54} motion="bounce" />
      </View>

      <View style={styles.storeToolbar}>
        <View style={{ flex: 1 }}>
          <Input
            value={query}
            onChangeText={setQuery}
            placeholder="🔎  Buscar productos..."
          />
        </View>

        <TouchableOpacity
          style={styles.cartCircle}
          onPress={() => router.push("/owner/cart")}
        >
          <AnimatedEmoji emoji="🛒" size={22} motion="bounce" />
          {cartCount > 0 ? (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{Math.min(cartCount, 99)}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryStrip}
      >
        {[
          { value: "all", label: "Todos", icon: "🐾" },
          ...categories.map((item, index) => ({
            value: item,
            label: item,
            icon: ["🥣", "❤️", "💧", "🦴", "📦"][index % 5],
          })),
        ].map((item) => {
          const active = category === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              activeOpacity={0.82}
              style={[styles.categoryChip, active && styles.categoryChipActive]}
              onPress={() => setCategory(item.value)}
            >
              <Text style={styles.categoryIcon}>{item.icon}</Text>
              <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.nativeSectionHeader}>
        <View>
          <Text style={styles.nativeSectionTitle}>Productos</Text>
          <Text style={styles.nativeSectionSubtitle}>{filtered.length} disponibles en esta vista</Text>
        </View>
        <TouchableOpacity onPress={() => setShowStoreInfo((value) => !value)}>
          <Text style={styles.infoToggle}>{showStoreInfo ? "Ocultar info" : "Info tienda"}</Text>
        </TouchableOpacity>
      </View>

      {showStoreInfo ? (
        <>
          <Card style={styles.compactInfoCard}>
            <Row label="Dirección" value={store.address || "Dirección demostrativa"} />
            <Row label="Despacho" value={store.delivery_conditions || "Condiciones por confirmar"} />
            <Row label="Productos" value={storeProducts.length} />
          </Card>
          <PlacesMap
            title={`Ubicación de ${store.name}`}
            description="Ubicación demostrativa de la tienda."
            places={[store]}
            type="store"
            selectedId={storeId}
          />
        </>
      ) : null}

      {filtered.length === 0 ? (
        <Empty
          icon="🔎"
          title="No encontramos productos"
          text="Prueba con otra búsqueda o categoría."
        />
      ) : (
        <View style={styles.productGrid}>
          {filtered.map((product) => (
            <View key={product.id} style={styles.nativeProductCard}>
              <View style={styles.productImageWrap}>
                {product.image_data ? (
                  <Image
                    source={{ uri: product.image_data }}
                    style={styles.nativeProductImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.nativeProductFallback}>
                    <AnimatedEmoji emoji="📦" size={42} motion="float" />
                  </View>
                )}

                {cartQuantityFor(product.id) > 0 ? (
                  <View style={styles.inCartBadge}>
                    <Text style={styles.inCartBadgeText}>🛒 {cartQuantityFor(product.id)}</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.nativeProductName} numberOfLines={2}>{product.name}</Text>
              <Text style={styles.nativeProductMeta} numberOfLines={1}>
                {[product.brand, product.format].filter(Boolean).join(" · ") || product.category || "Producto"}
              </Text>

              <Text style={styles.nativeProductPrice}>{formatMoney(product.price)}</Text>
              <Text style={[styles.nativeStock, availableStock(product) <= 3 && styles.nativeStockLow]}>
                {availableStock(product) > 0
                  ? `${availableStock(product)} disponibles`
                  : "Agotado"}
              </Text>

              <View style={styles.productActions}>
                {product.comparison_key ? (
                  <TouchableOpacity
                    style={styles.compareMini}
                    onPress={() => openComparison(product)}
                  >
                    <Text style={styles.compareMiniText}>⚖️</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  activeOpacity={0.82}
                  disabled={availableStock(product) <= 0}
                  onPress={() => add(product)}
                  style={[styles.addToCartNative, availableStock(product) <= 0 && styles.addToCartDisabled]}
                >
                  <Text style={styles.addToCartNativeText}>
                    {availableStock(product) > 0 ? "🛒 Agregar" : "Agotado"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <Modal
        visible={compareOpen}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setCompareOpen(false)
        }
      >
        <View style={styles.overlay}>
          <View style={styles.compareModal}>
            <View style={styles.compareHeader}>
              <AnimatedEmoji
                emoji="⚖️"
                size={36}
                motion="pulse"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.compareTitle}>
                  Comparar precios
                </Text>
                <Text style={styles.compareSubtitle}>
                  {compareProduct?.name}
                </Text>
              </View>
            </View>

            <ScrollView
              style={styles.compareList}
              contentContainerStyle={{
                paddingBottom: 6,
              }}
            >
              {comparisons.map(
                (product, index) => (
                  <View
                    key={`compare-${product.id}`}
                    style={[
                      styles.compareCard,
                      index === 0
                        ? styles.bestPrice
                        : null,
                    ]}
                  >
                    {index === 0 ? (
                      <Text style={styles.bestLabel}>
                        ⭐ Mejor precio
                      </Text>
                    ) : null}

                    <Text style={styles.compareStore}>
                      {product.store_name}
                    </Text>
                    <Text style={styles.comparePrice}>
                      {formatMoney(product.price)}
                    </Text>
                    <Text style={styles.compareStock}>
                      {availableStock(product) > 0
                        ? `${availableStock(product)} disponibles`
                        : "Agotado"}
                    </Text>

                    <Button
                      label={
                        String(product.store_id) === storeId
                          ? "Agregar"
                          : "Ir a esta tienda"
                      }
                      variant={
                        String(product.store_id) === storeId
                          ? "secondary"
                          : "ghost"
                      }
                      disabled={
                        availableStock(product) <= 0
                      }
                      onPress={() => {
                        if (
                          String(product.store_id) ===
                          storeId
                        ) {
                          add(product);
                        } else {
                          setCompareOpen(false);
                          router.replace({
                            pathname:
                              "/owner/store/[id]",
                            params: {
                              id: String(
                                product.store_id
                              ),
                            },
                          });
                        }
                      }}
                    />
                  </View>
                )
              )}
            </ScrollView>

            <Button
              label="Cerrar"
              variant="ghost"
              onPress={() =>
                setCompareOpen(false)
              }
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  storeNativeHero: {
    minHeight: 112,
    borderRadius: 24,
    backgroundColor: "#DDF8F5",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    overflow: "hidden",
  },
  storeNativeKicker: { color: COLORS.mint700, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  storeNativeName: { color: COLORS.navy, fontSize: 25, fontWeight: "900", marginTop: 3 },
  storeNativeSubtitle: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  storeToolbar: { flexDirection: "row", alignItems: "center", gap: 8 },
  cartCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: "#F04F67",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "white",
  },
  cartBadgeText: { color: "white", fontSize: 9, fontWeight: "900" },
  categoryStrip: { gap: 7, paddingRight: 4 },
  categoryChip: {
    minWidth: 68,
    minHeight: 64,
    borderRadius: 17,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryChipActive: {
    backgroundColor: COLORS.brand,
    borderColor: COLORS.brand,
  },
  categoryIcon: { fontSize: 19 },
  categoryText: { color: COLORS.navy, fontSize: 9, fontWeight: "800", marginTop: 3, maxWidth: 70, textAlign: "center" },
  categoryTextActive: { color: "white" },
  nativeSectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  nativeSectionTitle: { color: COLORS.navy, fontSize: 19, fontWeight: "900" },
  nativeSectionSubtitle: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  infoToggle: { color: COLORS.mint700, fontSize: 11, fontWeight: "900" },
  compactInfoCard: { backgroundColor: COLORS.mint50 },
  productGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  nativeProductCard: {
    width: "48.4%",
    backgroundColor: "white",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 9,
    shadowColor: COLORS.text,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  productImageWrap: {
    height: 148,
    borderRadius: 15,
    backgroundColor: "#F1FBFA",
    position: "relative",
    overflow: "hidden",
  },
  nativeProductImage: { width: "100%", height: "100%" },
  nativeProductFallback: { flex: 1, alignItems: "center", justifyContent: "center" },
  inCartBadge: {
    position: "absolute",
    right: 6,
    top: 6,
    borderRadius: 999,
    backgroundColor: COLORS.brand,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  inCartBadgeText: { color: "white", fontSize: 9, fontWeight: "900" },
  nativeProductName: { color: COLORS.navy, fontSize: 13, lineHeight: 16, fontWeight: "900", marginTop: 8, minHeight: 32 },
  nativeProductMeta: { color: COLORS.muted, fontSize: 9, marginTop: 2 },
  nativeProductPrice: { color: COLORS.navy, fontSize: 16, fontWeight: "900", marginTop: 7 },
  nativeStock: { color: COLORS.mint700, fontSize: 9, fontWeight: "800", marginTop: 2 },
  nativeStockLow: { color: "#B36A13" },
  productActions: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  compareMini: { width: 35, height: 35, borderRadius: 12, backgroundColor: COLORS.mint100, alignItems: "center", justifyContent: "center" },
  compareMiniText: { fontSize: 16 },
  addToCartNative: {
    flex: 1,
    minHeight: 38,
    borderRadius: 13,
    backgroundColor: COLORS.brand,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    shadowColor: COLORS.brandDark,
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  addToCartDisabled: { backgroundColor: "#C9D5D2" },
  addToCartNativeText: { color: "white", fontSize: 9, fontWeight: "900" },
  hero: {
    backgroundColor: "#F4F8F7",
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 9,
  },
  storeName: {
    color: COLORS.navy,
    fontSize: 22,
    fontWeight: "900",
  },
  storeLocation: {
    color: COLORS.teal,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3,
  },
  resultCount: {
    color: COLORS.teal,
    fontWeight: "900",
    fontSize: 11,
  },
  productImage: {
    width: "100%",
    height: 180,
    borderRadius: 18,
    marginBottom: 10,
    backgroundColor: "#EEF5F3",
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
    fontSize: 11,
    marginTop: 3,
    marginBottom: 6,
  },
  description: {
    color: "#405D57",
    lineHeight: 18,
    marginTop: 7,
    marginBottom: 8,
  },
  inCartBox: {
    backgroundColor: "#E9F7F2",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 6,
    marginBottom: 4,
  },
  inCartText: {
    color: "#397261",
    fontSize: 11,
    fontWeight: "900",
  },
  overlay: {
    flex: 1,
    backgroundColor:
      "rgba(10,28,43,0.48)",
    justifyContent: "center",
    padding: 18,
  },
  compareModal: {
    maxHeight: "86%",
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
  },
  compareHeader: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  compareTitle: {
    color: COLORS.navy,
    fontSize: 20,
    fontWeight: "900",
  },
  compareSubtitle: {
    color: COLORS.muted,
    marginTop: 2,
  },
  compareList: {
    maxHeight: 430,
  },
  compareCard: {
    borderWidth: 1,
    borderColor: "#D8E7E3",
    borderRadius: 14,
    padding: 11,
    marginBottom: 8,
  },
  bestPrice: {
    backgroundColor: "#F2FBF7",
    borderColor: "#58A994",
    borderWidth: 2,
  },
  bestLabel: {
    color: "#397261",
    fontSize: 10,
    fontWeight: "900",
    marginBottom: 3,
  },
  compareStore: {
    color: COLORS.navy,
    fontWeight: "900",
  },
  comparePrice: {
    color: COLORS.teal,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 3,
  },
  compareStock: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 2,
    marginBottom: 5,
  },
});
