import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router, usePathname } from "expo-router";
import { statusLabel } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import {
  getAdminStoreProducts,
  getClinicAppointments,
  getNotifications,
  getStoreProducts,
} from "../services/api";
import { AnimatedEmoji } from "./AnimatedEmoji";
import FloatingChatWindow from "./FloatingChatWindow";

export const COLORS = {
  bg: "#F4F8F7",
  card: "#FFFFFF",

  // Paleta VetMap Web
  mint50: "#F4FBF8",
  mint100: "#E9F7F2",
  mint200: "#D7F0E7",
  mint300: "#B9DDD2",
  mint400: "#98CFBF",
  mint500: "#6AA896",
  mint600: "#4F8F7D",
  mint700: "#397261",

  // Acento visual del mockup aprobado
  brand: "#13B9B2",
  brandDark: "#078F8A",
  brandSoft: "#DFF8F5",
  aqua: "#48C8C4",
  skySoft: "#EAFBFA",

  navy: "#102A56",
  teal: "#13B9B2",
  mint: "#E9F7F2",

  text: "#102033",
  muted: "#526A63",
  border: "#D8E7E3",

  danger: "#E85B5B",
  dangerBg: "#FFF0F0",

  warning: "#8A6A12",
  warningBg: "#FFF8DF",
  yellow: "#F2C94C",
};

const ROLE_MENU = {
  owner: { icon: "🐾", label: "Dueño de mascota" },
  vet: { icon: "🩺", label: "Veterinaria" },
  store: { icon: "🏪", label: "Tienda" },
  admin: { icon: "🛡️", label: "Administrador" },
};

const OWNER_TABS = [
  { key: "home", icon: "🏠", label: "Inicio", route: "/owner" },
  { key: "pets", icon: "🐾", label: "Mascotas", route: "/owner/pets" },
  { key: "reservations", icon: "📅", label: "Reservas", route: "/owner/reservations" },
  { key: "market", icon: "🛍️", label: "Tienda", route: "/owner/market" },
  { key: "orders", icon: "📦", label: "Pedidos", route: "/owner/orders" },
];

const VET_TABS = [
  { key: "home", icon: "🏠", label: "Inicio", route: "/vet" },
  { key: "agenda", icon: "📅", label: "Agenda", route: "/vet/agenda" },
  { key: "patients", icon: "🐾", label: "Pacientes", route: "/vet/patients" },
  { key: "prescriptions", icon: "📄", label: "Recetas", route: "/vet/prescriptions" },
];

const STORE_TABS = [
  { key: "home", icon: "🏠", label: "Inicio", route: "/store" },
  { key: "products", icon: "📦", label: "Productos", route: "/store/products" },
  { key: "orders", icon: "🛒", label: "Pedidos", route: "/store/orders" },
];

const ADMIN_TABS = [
  { key: "home", icon: "🏠", label: "Inicio", route: "/admin" },
  { key: "users", icon: "👥", label: "Usuarios", route: "/admin/users" },
  { key: "pets", icon: "🐾", label: "Mascotas", route: "/admin/pets" },
  { key: "reservations", icon: "📅", label: "Reservas", route: "/admin/reservations" },
  { key: "products", icon: "📦", label: "Productos", route: "/admin/products" },
];

function tabsForRole(role) {
  if (role === "owner") return OWNER_TABS;
  if (role === "vet") return VET_TABS;
  if (role === "store") return STORE_TABS;
  if (role === "admin") return ADMIN_TABS;
  return [];
}

function activeTabForRole(role, pathname) {
  const path = pathname || "/";

  if (role === "owner") {
    if (path === "/owner") return "home";
    if (path.startsWith("/owner/pet")) return "pets";
    if (path.startsWith("/owner/pets")) return "pets";
    if (path.startsWith("/owner/reservations")) return "reservations";
    if (
      path.startsWith("/owner/market") ||
      path.startsWith("/owner/store") ||
      path.startsWith("/owner/cart")
    ) {
      return "market";
    }
    if (path.startsWith("/owner/orders")) return "orders";
    return "home";
  }

  if (role === "vet") {
    if (path.startsWith("/vet/agenda")) return "agenda";
    if (path.startsWith("/vet/patient")) return "patients";
    if (path.startsWith("/vet/patients")) return "patients";
    if (path.startsWith("/vet/prescription")) return "prescriptions";
    if (path.startsWith("/vet/templates")) return "prescriptions";
    return "home";
  }

  if (role === "store") {
    if (path.startsWith("/store/products")) return "products";
    if (path.startsWith("/store/orders")) return "orders";
    return "home";
  }

  if (role === "admin") {
    if (path.startsWith("/admin/users")) return "users";
    if (path.startsWith("/admin/pet")) return "pets";
    if (path.startsWith("/admin/pets")) return "pets";
    if (path.startsWith("/admin/reservations")) return "reservations";
    if (path.startsWith("/admin/products")) return "products";
    return "home";
  }

  return "home";
}

function RoleBottomNav({
  pathname,
  role,
}) {
  const tabs = tabsForRole(role);
  const active =
    activeTabForRole(
      role,
      pathname
    );

  return (
    <View style={styles.ownerBottomNav}>
      {tabs.map((tab) => {
        const selected =
          active === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.78}
            style={styles.ownerBottomItem}
            onPress={() => {
              if (!selected) {
                router.replace(tab.route);
              }
            }}
          >
            <View
              style={[
                styles.ownerBottomIconWrap,
                selected &&
                  styles.ownerBottomIconWrapActive,
              ]}
            >
              <Text
                style={[
                  styles.ownerBottomIcon,
                  selected &&
                    styles.ownerBottomIconActive,
                ]}
              >
                {tab.icon}
              </Text>
            </View>

            <Text
              style={[
                styles.ownerBottomLabel,
                selected &&
                  styles.ownerBottomLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function FloatingChatIcon() {
  return (
    <View style={styles.floatingChatIcon} pointerEvents="none" accessible={false}>
      <View style={styles.floatingChatBubble}>
        <View style={styles.floatingChatLineLong} />
        <View style={styles.floatingChatLineShort} />
      </View>
      <View style={styles.floatingChatTail} />
    </View>
  );
}

export function Screen({ children, title, subtitle, back = false, backTo = null, refreshing = false, onRefresh, showAccountActions = true, showBottomNav = true }) {
  const { user, token, signOut } = useAuth();
  const pathname = usePathname();
  const showFloatingChat = showAccountActions && !!user &&
    ["owner", "vet", "store", "driver"].includes(user.role) &&
    pathname !== "/common/chat";
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  useEffect(() => { setChatOpen(false); }, [pathname, user?.id]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [lowStockOpen, setLowStockOpen] = useState(false);
  const [loadingLowStock, setLoadingLowStock] = useState(false);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [pendingAppointmentsOpen, setPendingAppointmentsOpen] = useState(false);
  const [loadingPendingAppointments, setLoadingPendingAppointments] = useState(false);
  const roleInfo = ROLE_MENU[user?.role] || { icon: "🐾", label: "VetMap" };

  useEffect(() => {
    let active = true;

    async function loadUnread() {
      if (!token) {
        if (active) setUnreadNotifications(0);
        return;
      }

      try {
        const items = await getNotifications(token);
        if (active) {
          setUnreadNotifications(
            items.filter((item) => !item.is_read).length
          );
        }
      } catch {
        if (active) setUnreadNotifications(0);
      }
    }

    loadUnread();

    return () => {
      active = false;
    };
  }, [token]);

  async function loadLowStock() {
    if (
      !token ||
      !["admin", "store"].includes(user?.role)
    ) {
      setLowStockProducts([]);
      return;
    }

    setLoadingLowStock(true);

    try {
      const rows =
        user.role === "admin"
          ? await getAdminStoreProducts(token)
          : await getStoreProducts(token);

      const products = Array.isArray(rows)
        ? rows
        : rows?.items || [];

      setLowStockProducts(
        products
          .filter(
            (item) =>
              item.active !== false &&
              Number(item.stock ?? 0) <= 3
          )
          .sort(
            (a, b) =>
              Number(a.stock ?? 0) -
              Number(b.stock ?? 0)
          )
      );
    } catch {
      setLowStockProducts([]);
    } finally {
      setLoadingLowStock(false);
    }
  }

  useEffect(() => {
    loadLowStock();
  }, [token, user?.role]);

  async function loadPendingAppointments() {
    if (!token || user?.role !== "vet") {
      setPendingAppointments([]);
      return;
    }

    setLoadingPendingAppointments(true);

    try {
      const rows = await getClinicAppointments(token);
      const items = Array.isArray(rows) ? rows : rows?.items || [];

      setPendingAppointments(
        items
          .filter((item) => item.status === "pending")
          .sort((a, b) =>
            `${a.appointment_date || ""}T${String(a.appointment_time || "")}`.localeCompare(
              `${b.appointment_date || ""}T${String(b.appointment_time || "")}`
            )
          )
      );
    } catch {
      setPendingAppointments([]);
    } finally {
      setLoadingPendingAppointments(false);
    }
  }

  useEffect(() => {
    loadPendingAppointments();
  }, [token, user?.role]);

  async function handleLogout() {
    setRoleMenuOpen(false);
    await signOut();
    router.replace("/login");
  }

  return (
    <SafeAreaView style={styles.safe}>
      {user?.role === "owner" ? (
        <View
          pointerEvents="none"
          style={styles.ownerBackdrop}
        >
          <View style={styles.ownerBackdropOrbLarge} />
          <View style={styles.ownerBackdropOrbSmall} />
          <Text style={styles.ownerBackdropPaw}>🐾</Text>
        </View>
      ) : null}

      <View style={styles.screenBody}>
      <ScrollView
        style={styles.screenScroll}
        contentContainerStyle={[
          styles.screen,
          user && showBottomNav
            ? styles.screenWithBottomNav
            : null,
          showFloatingChat ? styles.screenWithFloatingChat : null,
        ]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.mint600}
              colors={[COLORS.mint600]}
            />
          ) : undefined
        }
      >
        <View
          style={[
            styles.topbar,
            user?.role === "owner"
              ? styles.ownerTopbar
              : null,
          ]}
        >
          <View style={{ flex: 1 }}>
            {user?.role === "owner" && !back ? (
              <View style={styles.ownerBrandRow}>
                <View style={styles.ownerBrandIcon}>
                  <Text style={styles.ownerBrandPaw}>🐾</Text>
                </View>
                <Text style={styles.ownerBrandText}>
                  Vet<Text style={styles.ownerBrandAccent}>Map</Text>
                </Text>
              </View>
            ) : null}

            {back && (
              <TouchableOpacity
                onPress={() => {
                  try {
                    if (backTo) {
                      router.replace(backTo);
                    } else if (router.canGoBack?.()) {
                      router.back();
                    } else {
                      router.replace("/");
                    }
                  } catch {
                    router.replace(backTo || "/");
                  }
                }}
                style={styles.backBtn}
              >
                <Text
                  style={[
                    styles.backText,
                    user?.role === "owner"
                      ? styles.ownerBackText
                      : null,
                  ]}
                >
                  {user?.role === "owner"
                    ? "‹"
                    : "‹ Volver"}
                </Text>
              </TouchableOpacity>
            )}
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>

          {showAccountActions && user ? (
            <View style={styles.headerActions}>
              {/* V27.34: el acceso al chat está en el botón flotante inferior. */}
              {user.role === "owner" ? (
                <TouchableOpacity
                  activeOpacity={0.82}
                  onPress={() => {
                    setRoleMenuOpen(false);
                    router.push("/owner/cart");
                  }}
                  style={styles.notificationButton}
                  accessibilityLabel="Abrir carrito"
                >
                  <AnimatedEmoji emoji="🛒" size={22} motion="bounce" />
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                activeOpacity={0.82}
                onPress={() => {
                  setRoleMenuOpen(false);
                  router.push("/common/notifications");
                }}
                style={styles.notificationButton}
                accessibilityLabel="Abrir notificaciones"
              >
                <AnimatedEmoji emoji="🔔" size={22} motion="wiggle" />
                {unreadNotifications > 0 ? (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {Math.min(unreadNotifications, 99)}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>

              {["admin", "store"].includes(user.role) &&
              lowStockProducts.length > 0 ? (
                <TouchableOpacity
                  activeOpacity={0.82}
                  onPress={async () => {
                    setRoleMenuOpen(false);
                    await loadLowStock();
                    setLowStockOpen(true);
                  }}
                  style={[
                    styles.notificationButton,
                    styles.lowStockButton,
                  ]}
                  accessibilityLabel={`Hay ${lowStockProducts.length} productos con stock bajo`}
                >
                  <AnimatedEmoji
                    emoji="⚠️"
                    size={22}
                    motion="pulse"
                  />

                  <View style={styles.lowStockBadge}>
                    <Text style={styles.lowStockBadgeText}>
                      {Math.min(lowStockProducts.length, 99)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : null}

              {user.role === "vet" && pendingAppointments.length > 0 ? (
                <TouchableOpacity
                  activeOpacity={0.82}
                  onPress={async () => {
                    setRoleMenuOpen(false);
                    await loadPendingAppointments();
                    setPendingAppointmentsOpen(true);
                  }}
                  style={[
                    styles.notificationButton,
                    styles.appointmentAlertButton,
                  ]}
                  accessibilityLabel={`${pendingAppointments.length} reservas pendientes`}
                >
                  <AnimatedEmoji
                    emoji="📅"
                    size={22}
                    motion="pulse"
                  />

                  <View style={styles.appointmentAlertBadge}>
                    <Text style={styles.appointmentAlertBadgeText}>
                      {Math.min(pendingAppointments.length, 99)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                activeOpacity={0.82}
                onPress={() => setRoleMenuOpen(true)}
                style={styles.roleButton}
                accessibilityLabel={`Abrir menú de ${roleInfo.label}`}
              >
                <AnimatedEmoji emoji={roleInfo.icon} size={23} motion="float" />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {children}
      </ScrollView>

      {showFloatingChat ? (
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() => { setRoleMenuOpen(false); setChatOpen(true); }}
          style={styles.floatingChatButton}
          accessibilityRole="button"
          accessibilityLabel="Abrir mensajes"
          accessibilityHint="Abre una ventana de chat sobre esta pantalla"
          accessibilityState={{expanded: chatOpen}}
        >
          <FloatingChatIcon />
        </TouchableOpacity>
      ) : null}
      {showFloatingChat ? <FloatingChatWindow visible={chatOpen} onClose={() => setChatOpen(false)} /> : null}
      </View>

      {user &&
      showBottomNav &&
      tabsForRole(user.role).length ? (
        <RoleBottomNav
          pathname={pathname}
          role={user.role}
        />
      ) : null}

      <Modal
        visible={pendingAppointmentsOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPendingAppointmentsOpen(false)}
      >
        <View style={styles.stockOverlay}>
          <View style={styles.appointmentAlertModal}>
            <View style={styles.stockModalHeader}>
              <AnimatedEmoji
                emoji="📅"
                size={38}
                motion="pulse"
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.stockModalTitle}>
                  Reservas pendientes
                </Text>
                <Text style={styles.stockModalSubtitle}>
                  Horas que todavía necesitan confirmación o gestión
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setPendingAppointmentsOpen(false)}
                style={styles.stockCloseButton}
              >
                <Text style={styles.stockCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.appointmentSummary}>
              <Text style={styles.appointmentSummaryText}>
                {pendingAppointments.length === 1
                  ? "1 reserva pendiente"
                  : `${pendingAppointments.length} reservas pendientes`}
              </Text>
            </View>

            <ScrollView
              style={styles.stockList}
              contentContainerStyle={styles.stockListContent}
              showsVerticalScrollIndicator
            >
              {loadingPendingAppointments ? (
                <View style={styles.stockLoading}>
                  <ActivityIndicator color={COLORS.teal} />
                  <Text style={styles.stockLoadingText}>
                    Actualizando agenda...
                  </Text>
                </View>
              ) : pendingAppointments.length === 0 ? (
                <View style={styles.stockEmpty}>
                  <AnimatedEmoji emoji="✅" size={42} motion="pulse" />
                  <Text style={styles.stockEmptyTitle}>
                    Sin reservas pendientes
                  </Text>
                </View>
              ) : (
                pendingAppointments.map((item) => (
                  <View
                    key={`appointment-alert-${item.id}`}
                    style={styles.appointmentAlertCard}
                  >
                    <View style={styles.stockProductTop}>
                      <AnimatedEmoji
                        emoji="🐾"
                        size={27}
                        motion="float"
                      />

                      <View style={{ flex: 1 }}>
                        <Text style={styles.stockProductName}>
                          {item.pet_name}
                        </Text>
                        <Text style={styles.appointmentOwnerText}>
                          Dueño: {item.user_name}
                        </Text>
                        <Text style={styles.stockProductMeta}>
                          {item.service}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.appointmentDateText}>
                      📆 {item.appointment_date} · 🕐 {String(item.appointment_time || "").slice(0, 5)}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>

            <Button
              label="Actualizar agenda"
              variant="ghost"
              onPress={loadPendingAppointments}
              disabled={loadingPendingAppointments}
            />

            <Button
              label="Abrir agenda"
              onPress={() => {
                setPendingAppointmentsOpen(false);
                router.push("/vet/agenda");
              }}
            />

            <Button
              label="Cerrar"
              variant="secondary"
              onPress={() => setPendingAppointmentsOpen(false)}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={lowStockOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLowStockOpen(false)}
      >
        <View style={styles.stockOverlay}>
          <View style={styles.stockModal}>
            <View style={styles.stockModalHeader}>
              <AnimatedEmoji
                emoji="⚠️"
                size={38}
                motion="pulse"
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.stockModalTitle}>
                  Productos con stock bajo
                </Text>

                <Text style={styles.stockModalSubtitle}>
                  {user?.role === "admin"
                    ? "Productos críticos de todas las tiendas"
                    : "Productos críticos de tu tienda"}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setLowStockOpen(false)}
                style={styles.stockCloseButton}
              >
                <Text style={styles.stockCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.stockSummary}>
              <Text style={styles.stockSummaryText}>
                {lowStockProducts.length === 1
                  ? "1 producto necesita atención"
                  : `${lowStockProducts.length} productos necesitan atención`}
              </Text>
            </View>

            <ScrollView
              style={styles.stockList}
              contentContainerStyle={styles.stockListContent}
              showsVerticalScrollIndicator
            >
              {loadingLowStock ? (
                <View style={styles.stockLoading}>
                  <ActivityIndicator color={COLORS.teal} />
                  <Text style={styles.stockLoadingText}>
                    Actualizando stock...
                  </Text>
                </View>
              ) : lowStockProducts.length === 0 ? (
                <View style={styles.stockEmpty}>
                  <AnimatedEmoji
                    emoji="✅"
                    size={42}
                    motion="pulse"
                  />
                  <Text style={styles.stockEmptyTitle}>
                    Stock en buen estado
                  </Text>
                  <Text style={styles.stockEmptyText}>
                    No hay productos con 3 unidades o menos.
                  </Text>
                </View>
              ) : (
                lowStockProducts.map((product) => {
                  const stock = Number(product.stock ?? 0);

                  return (
                    <View
                      key={`stock-${product.id}`}
                      style={[
                        styles.stockProductCard,
                        stock <= 0
                          ? styles.stockProductCritical
                          : null,
                      ]}
                    >
                      <View style={styles.stockProductTop}>
                        <AnimatedEmoji
                          emoji={stock <= 0 ? "🚨" : "📦"}
                          size={28}
                          motion={stock <= 0 ? "wiggle" : "pulse"}
                        />

                        <View style={{ flex: 1 }}>
                          <Text style={styles.stockProductName}>
                            {product.name}
                          </Text>

                          {user?.role === "admin" ? (
                            <Text style={styles.stockStoreName}>
                              🏪 {product.store_name || "Tienda sin nombre"}
                            </Text>
                          ) : null}

                          <Text style={styles.stockProductMeta}>
                            {[product.brand, product.format]
                              .filter(Boolean)
                              .join(" · ") || product.category || "Producto"}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.stockCountPill,
                            stock <= 0
                              ? styles.stockCountCritical
                              : null,
                          ]}
                        >
                          <Text
                            style={[
                              styles.stockCountText,
                              stock <= 0
                                ? styles.stockCountCriticalText
                                : null,
                            ]}
                          >
                            {stock <= 0
                              ? "AGOTADO"
                              : `${stock} u.`}
                          </Text>
                        </View>
                      </View>

                      {stock === 1 ? (
                        <Text style={styles.stockWarningText}>
                          Queda solo 1 unidad disponible.
                        </Text>
                      ) : stock > 1 ? (
                        <Text style={styles.stockWarningText}>
                          Quedan {stock} unidades disponibles.
                        </Text>
                      ) : (
                        <Text style={styles.stockCriticalText}>
                          Este producto no tiene unidades disponibles.
                        </Text>
                      )}

                      <Button
                        label="✏️ Modificar stock"
                        compact
                        variant="secondary"
                        onPress={() => {
                          setLowStockOpen(false);

                          router.push({
                            pathname:
                              user?.role === "admin"
                                ? "/admin/product-edit/[id]"
                                : "/store/product-edit/[id]",
                            params: {
                              id: String(product.id),
                              stock_focus: "1",
                            },
                          });
                        }}
                      />
                    </View>
                  );
                })
              )}
            </ScrollView>

            <Button
              label="Actualizar stock"
              variant="ghost"
              onPress={loadLowStock}
              disabled={loadingLowStock}
            />

            <Button
              label="Gestionar productos"
              onPress={() => {
                setLowStockOpen(false);

                router.push(
                  user?.role === "admin"
                    ? "/admin/products"
                    : "/store/products"
                );
              }}
            />

            <Button
              label="Cerrar"
              variant="secondary"
              onPress={() => setLowStockOpen(false)}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAccountActions && !!user && roleMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRoleMenuOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.roleOverlay}
          onPress={() => setRoleMenuOpen(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.roleMenu} onPress={() => {}}>
            <View style={styles.roleMenuHeader}>
              <View style={styles.roleMenuIcon}>
                <AnimatedEmoji emoji={roleInfo.icon} size={25} motion="float" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.roleMenuName}>{user?.name || "Usuario"}</Text>
                <Text style={styles.roleMenuRole}>{roleInfo.label}</Text>
                {user?.email ? <Text style={styles.roleMenuEmail}>{user.email}</Text> : null}
              </View>
            </View>

            <TouchableOpacity
              style={styles.roleMenuOption}
              onPress={() => {
                setRoleMenuOpen(false);
                router.push("/common/profile");
              }}
            >
              <AnimatedEmoji emoji="👤" size={18} motion="float" />
              <Text style={styles.roleMenuOptionText}>Ver perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.roleMenuLogout} onPress={handleLogout}>
              <Text style={styles.roleMenuOptionIcon}>↪</Text>
              <Text style={styles.roleMenuLogoutText}>Cerrar sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.roleMenuCancel} onPress={() => setRoleMenuOpen(false)}>
              <Text style={styles.roleMenuCancelText}>Cerrar menú</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children }) {
  return <Text style={styles.section}>{children}</Text>;
}

export function Button({ label, onPress, variant = "primary", disabled = false, compact = false }) {
  const variants = {
    primary: styles.btnPrimary,
    secondary: styles.btnSecondary,
    ghost: styles.btnGhost,
    danger: styles.btnDanger,
  };
  const textVariants = {
    primary: styles.btnPrimaryText,
    secondary: styles.btnSecondaryText,
    ghost: styles.btnGhostText,
    danger: styles.btnDangerText,
  };
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.82}
      style={[styles.btn, variants[variant], compact && styles.btnCompact, disabled && { opacity: 0.55 }]}
    >
      <Text style={[styles.btnText, textVariants[variant]]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Input({ label, style, multiline = false, ...props }) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        {...props}
        multiline={multiline}
        style={[styles.input, multiline && { minHeight: 88, textAlignVertical: "top" }, style]}
        placeholderTextColor="#9AA9A5"
      />
    </View>
  );
}

export function ChoiceRow({ label, options, value, onChange }) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.choiceWrap}>
        {options.map((item) => {
          const obj = typeof item === "string" ? { value: item, label: item } : item;
          const active = String(value) === String(obj.value);
          return (
            <TouchableOpacity key={String(obj.value)} onPress={() => onChange(obj.value)} style={[styles.choice, active && styles.choiceActive]}>
              <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{obj.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function Loading({ label = "Cargando..." }) {
  return (
    <View style={styles.centerBox}>
      <ActivityIndicator color={COLORS.teal} size="large" />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

export function Empty({ icon = "🐾", title = "Sin datos", text = "Todavía no hay información para mostrar." }) {
  return (
    <Card style={{ alignItems: "center" }}>
      <AnimatedEmoji emoji={icon} size={32} motion="float" />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={[styles.muted, { textAlign: "center" }]}>{text}</Text>
    </Card>
  );
}

export function ErrorBox({ message }) {
  if (!message) return null;
  return <View style={styles.errorBox}><Text style={styles.errorText}>{message}</Text></View>;
}

export function SuccessBox({ message }) {
  if (!message) return null;
  return <View style={styles.successBox}><Text style={styles.successText}>{message}</Text></View>;
}

export function Badge({ status }) {
  const final = ["completed", "delivered"].includes(status);
  const bad = status === "cancelled";
  return (
    <View style={[styles.badge, bad && styles.badgeBad, final && styles.badgeGood]}>
      <Text style={[styles.badgeText, bad && { color: COLORS.danger }, final && { color: "#397261" }]}>{statusLabel(status)}</Text>
    </View>
  );
}

export function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value ?? "-"}</Text>
    </View>
  );
}

export function Stat({ value, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function MenuCard({ icon, title, text, onPress, badge }) {
  return (
    <TouchableOpacity activeOpacity={0.84} onPress={onPress} style={styles.menuCard}>
      <View style={styles.menuIcon}><AnimatedEmoji emoji={icon} size={22} motion="float" /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.menuTitle}>{title}</Text>
        {text ? <Text style={styles.menuDesc}>{text}</Text> : null}
      </View>
      {badge ? <View style={styles.count}><Text style={styles.countText}>{badge}</Text></View> : null}
      <Text style={styles.chev}>›</Text>
    </TouchableOpacity>
  );
}

export function confirm(title, message, onConfirm) {
  if (
    Platform.OS === "web" &&
    typeof window !== "undefined"
  ) {
    const accepted =
      window.confirm(
        `${title}\n\n${message}`
      );

    if (accepted) {
      Promise.resolve(
        onConfirm?.()
      ).catch(() => {});
    }

    return;
  }

  Alert.alert(
    title,
    message,
    [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Confirmar",
        style: "destructive",
        onPress: onConfirm,
      },
    ]
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F5FCFB",
    overflow: "hidden",
  },
  ownerBackdrop: {
    position: "absolute",
    top: -80,
    right: -95,
    width: 280,
    height: 260,
  },
  ownerBackdropOrbLarge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#DFF8F5",
    opacity: 0.85,
  },
  ownerBackdropOrbSmall: {
    position: "absolute",
    top: 126,
    left: 18,
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: "#C9F2EF",
    opacity: 0.7,
  },
  ownerBackdropPaw: {
    position: "absolute",
    top: 112,
    right: 52,
    fontSize: 44,
    opacity: 0.11,
  },
  screenBody: { flex: 1, position: "relative" },
  screenWithFloatingChat: { paddingBottom: 96 },
  floatingChatButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.brandDark,
    shadowColor: "#063C49",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 18,
    zIndex: 20,
  },
  floatingChatIcon: { width: 26, height: 26 },
  floatingChatBubble: {
    position: "absolute",
    left: 1,
    top: 2,
    width: 24,
    height: 19,
    borderWidth: 1.8,
    borderColor: "#FFFFFF",
    borderRadius: 7,
  },
  floatingChatLineLong: {
    position: "absolute", left: 5, top: 5, width: 11, height: 1.5,
    borderRadius: 1, backgroundColor: "#FFFFFF",
  },
  floatingChatLineShort: {
    position: "absolute", left: 5, top: 9, width: 7, height: 1.5,
    borderRadius: 1, backgroundColor: "#FFFFFF",
  },
  floatingChatTail: {
    position: "absolute", left: 5, top: 18, width: 6, height: 6,
    borderLeftWidth: 1.8, borderBottomWidth: 1.8,
    borderColor: "#FFFFFF", backgroundColor: COLORS.brandDark,
    transform: [{ rotate: "-15deg" }],
  },
  screenScroll: { flex: 1 },
  screen: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
    gap: 12,
  },
  screenWithBottomNav: { paddingBottom: 34 },
  ownerBottomNav: {
    minHeight: 76,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#DCECEA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 6,
    paddingTop: 7,
    paddingBottom: Platform.OS === "ios" ? 10 : 7,
    shadowColor: "#102A56",
    shadowOpacity: 0.09,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: -5 },
    elevation: 14,
  },
  ownerBottomItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minHeight: 56,
  },
  ownerBottomIconWrap: {
    minWidth: 34,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  ownerBottomIconWrapActive: {
    backgroundColor: COLORS.brandSoft,
  },
  ownerBottomIcon: {
    color: "#7A8B99",
    fontSize: 20,
    fontWeight: "900",
  },
  ownerBottomIconActive: {
    color: COLORS.brandDark,
  },
  ownerBottomLabel: { color: "#738785", fontSize: 9, fontWeight: "700" },
  ownerBottomLabelActive: {
    color: COLORS.brandDark,
    fontWeight: "900",
  },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
    backgroundColor: COLORS.mint300,
    borderWidth: 2,
    borderColor: "#9BCBBD",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 13,
    shadowColor: COLORS.text,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  ownerTopbar: {
    minHeight: 92,
    marginBottom: 2,
    paddingHorizontal: 4,
    paddingVertical: 6,
    backgroundColor: "transparent",
    borderWidth: 0,
    borderColor: "transparent",
    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
    alignItems: "flex-start",
  },
  ownerBrandRow: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 4,
  },
  ownerBrandIcon: {
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: COLORS.brand,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.brandDark,
    shadowOpacity: 0.14,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  ownerBrandPaw: {
    color: "white",
    fontSize: 17,
  },
  ownerBrandText: {
    color: COLORS.navy,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  ownerBrandAccent: {
    color: COLORS.brand,
  },
  ownerBackText: {
    width: 38,
    height: 38,
    borderRadius: 19,
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: 35,
    backgroundColor: "rgba(255,255,255,0.92)",
    color: COLORS.navy,
    fontSize: 29,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  backBtn: { alignSelf: "flex-start", paddingVertical: 3, marginBottom: 5 },
  backText: { color: COLORS.teal, fontWeight: "800", fontSize: 14 },
  brandDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.mint50,
    borderWidth: 1,
    borderColor: "#9BCBBD",
    alignItems: "center",
    justifyContent: "center",
  },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#9BCBBD",
    position: "relative",
  },
  notificationButtonIcon: { fontSize: 21 },
  notificationBadge: { position: "absolute", top: -3, right: -3, minWidth: 21, height: 21, borderRadius: 11, paddingHorizontal: 5, backgroundColor: COLORS.navy, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: COLORS.bg },
  notificationBadgeText: { color: "white", fontSize: 10, fontWeight: "900" },
  lowStockButton: {
    backgroundColor: "#FFF8DF",
    borderColor: "#EED58C",
  },
  lowStockBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 21,
    height: 21,
    borderRadius: 11,
    paddingHorizontal: 5,
    backgroundColor: "#D99010",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.bg,
  },
  lowStockBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "900",
  },
  stockOverlay: {
    flex: 1,
    backgroundColor: "rgba(13, 31, 48, 0.44)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  stockModal: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "88%",
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E9D7A1",
  },
  stockModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 10,
  },
  stockModalTitle: {
    color: COLORS.navy,
    fontSize: 20,
    fontWeight: "900",
  },
  stockModalSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
  },
  stockCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F7F6",
  },
  stockCloseText: {
    color: COLORS.navy,
    fontSize: 24,
    lineHeight: 25,
    fontWeight: "700",
  },
  stockSummary: {
    backgroundColor: "#FFF8DF",
    borderWidth: 1,
    borderColor: "#F0D994",
    borderRadius: 12,
    padding: 9,
    marginBottom: 9,
  },
  stockSummaryText: {
    color: "#76570B",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },
  stockList: {
    maxHeight: 390,
    marginBottom: 8,
  },
  stockListContent: {
    paddingBottom: 6,
    gap: 8,
  },
  stockProductCard: {
    borderWidth: 1,
    borderColor: "#E5D9B9",
    backgroundColor: "#FFFCF2",
    borderRadius: 15,
    padding: 11,
  },
  stockProductCritical: {
    backgroundColor: "#FFF1F1",
    borderColor: "#EDC2C2",
  },
  stockProductTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  stockProductName: {
    color: COLORS.navy,
    fontSize: 15,
    fontWeight: "900",
  },
  stockStoreName: {
    color: COLORS.teal,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },
  stockProductMeta: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 2,
  },
  stockCountPill: {
    minWidth: 54,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: "#FFF0C8",
    alignItems: "center",
  },
  stockCountCritical: {
    backgroundColor: "#F9D7D7",
  },
  stockCountText: {
    color: "#8B6200",
    fontSize: 10,
    fontWeight: "900",
  },
  stockCountCriticalText: {
    color: "#A12D2D",
  },
  stockWarningText: {
    color: "#80610D",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 7,
  },
  stockCriticalText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 7,
  },
  stockLoading: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  stockLoadingText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  stockEmpty: {
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },
  stockEmptyTitle: {
    color: COLORS.navy,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 7,
  },
  stockEmptyText: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  appointmentAlertButton: {
    backgroundColor: "#F4FBF8",
    borderColor: "#B9DDD2",
  },
  appointmentAlertBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 21,
    height: 21,
    borderRadius: 11,
    paddingHorizontal: 5,
    backgroundColor: "#397261",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.bg,
  },
  appointmentAlertBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "900",
  },
  appointmentAlertModal: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "88%",
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#B9DDD2",
  },
  appointmentSummary: {
    backgroundColor: "#F4FBF8",
    borderWidth: 1,
    borderColor: "#B9DDD2",
    borderRadius: 12,
    padding: 9,
    marginBottom: 9,
  },
  appointmentSummaryText: {
    color: "#397261",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },
  appointmentAlertCard: {
    borderWidth: 1,
    borderColor: "#D8E7E3",
    backgroundColor: "#F4FBF8",
    borderRadius: 15,
    padding: 11,
  },
  appointmentOwnerText: {
    color: COLORS.teal,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },
  appointmentDateText: {
    color: COLORS.navy,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 7,
  },
  roleButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#9BCBBD",
  },
  roleButtonIcon: { fontSize: 22 },
  roleOverlay: { flex: 1, backgroundColor: "rgba(13, 31, 48, 0.28)", justifyContent: "flex-start", alignItems: "flex-end", paddingTop: 68, paddingRight: 18, paddingLeft: 18 },
  roleMenu: { width: 310, maxWidth: "94%", backgroundColor: COLORS.card, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: COLORS.border, shadowColor: "#000", shadowOpacity: 0.16, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  roleMenuHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: 7, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#E9F7F2" },
  roleMenuIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: COLORS.mint, alignItems: "center", justifyContent: "center" },
  roleMenuName: { color: COLORS.navy, fontSize: 16, fontWeight: "900" },
  roleMenuRole: { color: COLORS.teal, fontSize: 12, fontWeight: "800", marginTop: 2 },
  roleMenuEmail: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  roleMenuOption: { minHeight: 46, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 10, marginTop: 8, borderRadius: 12, backgroundColor: "#F4FBF8" },
  roleMenuLogout: { minHeight: 46, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 10, marginTop: 7, borderRadius: 12, backgroundColor: COLORS.dangerBg, borderWidth: 1, borderColor: "#F2C4C2" },
  roleMenuOptionIcon: { width: 24, textAlign: "center", fontSize: 18 },
  roleMenuOptionText: { color: COLORS.navy, fontWeight: "800", fontSize: 14 },
  roleMenuLogoutText: { color: COLORS.danger, fontWeight: "900", fontSize: 14 },
  roleMenuCancel: { alignItems: "center", paddingVertical: 10, marginTop: 3 },
  roleMenuCancelText: { color: COLORS.muted, fontWeight: "700", fontSize: 12 },
  title: {
    fontSize: 27,
    fontWeight: "900",
    color: COLORS.navy,
    letterSpacing: -0.45,
  },
  subtitle: {
    color: "#29445F",
    marginTop: 4,
    lineHeight: 19,
    fontWeight: "600",
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 2,
    shadowColor: COLORS.text,
    shadowOpacity: 0.045,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  section: { fontSize: 18, fontWeight: "900", color: COLORS.navy, marginTop: 8, marginBottom: 2 },
  btn: { minHeight: 46, borderRadius: 13, alignItems: "center", justifyContent: "center", paddingHorizontal: 14, marginVertical: 3 },
  btnCompact: { minHeight: 38, paddingHorizontal: 11, alignSelf: "flex-start" },
  btnPrimary: {
    backgroundColor: COLORS.brand,
    borderWidth: 2,
    borderColor: COLORS.brand,
  },
  btnSecondary: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  btnGhost: {
    backgroundColor: COLORS.mint50,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnDanger: { backgroundColor: COLORS.dangerBg, borderWidth: 1, borderColor: "#F2C4C2" },
  btnText: { fontWeight: "800" },
  btnPrimaryText: { color: "white" },
  btnSecondaryText: { color: COLORS.navy },
  btnGhostText: { color: COLORS.mint700 },
  btnDangerText: { color: COLORS.danger },
  label: { color: "#49655D", fontWeight: "800", marginBottom: 6, fontSize: 13 },
  input: { backgroundColor: "#F4FBF8", borderWidth: 1, borderColor: "#D8E7E3", borderRadius: 12, paddingHorizontal: 13, paddingVertical: 12, color: COLORS.text, fontSize: 15 },
  choiceWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  choice: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 999, backgroundColor: "white", borderWidth: 1, borderColor: COLORS.border },
  choiceActive: {
    backgroundColor: COLORS.brand,
    borderColor: COLORS.brand,
  },
  choiceText: { color: COLORS.text, fontWeight: "700", fontSize: 12 },
  choiceTextActive: { color: "white" },
  centerBox: { paddingVertical: 38, alignItems: "center", gap: 12 },
  muted: { color: COLORS.muted, lineHeight: 19 },
  emptyTitle: { fontSize: 17, fontWeight: "900", color: COLORS.navy, marginVertical: 5 },
  errorBox: { backgroundColor: COLORS.dangerBg, borderRadius: 12, padding: 11, borderWidth: 1, borderColor: "#F2C4C2" },
  errorText: { color: COLORS.danger, fontWeight: "700" },
  successBox: { backgroundColor: COLORS.mint, borderRadius: 12, padding: 11, borderWidth: 1, borderColor: "#B9DDD2" },
  successText: { color: "#397261", fontWeight: "700" },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: COLORS.warningBg, alignSelf: "flex-start" },
  badgeBad: { backgroundColor: COLORS.dangerBg },
  badgeGood: { backgroundColor: COLORS.mint },
  badgeText: { fontSize: 11, color: COLORS.warning, fontWeight: "900" },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#E9F7F2" },
  rowLabel: { color: COLORS.muted, fontSize: 12, fontWeight: "700", flex: 1 },
  rowValue: { color: COLORS.text, fontSize: 13, fontWeight: "700", flex: 1.5, textAlign: "right" },
  stat: {
    flex: 1,
    minWidth: 95,
    backgroundColor: COLORS.mint50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 13,
  },
  statValue: { fontSize: 24, fontWeight: "900", color: COLORS.navy },
  statLabel: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  menuCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, padding: 14, borderRadius: 16 },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.mint200,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTitle: { color: COLORS.navy, fontSize: 15, fontWeight: "900" },
  menuDesc: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  chev: { color: COLORS.teal, fontSize: 26, fontWeight: "900" },
  count: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.mint700,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  countText: { color: "white", fontSize: 11, fontWeight: "900" },
});
