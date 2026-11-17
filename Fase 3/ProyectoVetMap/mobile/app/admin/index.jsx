import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import {
  Card,
  COLORS,
  Empty,
  MenuCard,
  Row,
  Screen,
  Stat,
} from "../../components/ui";
import { AnimatedEmoji } from "../../components/AnimatedEmoji";
import { useAuth } from "../../context/AuthContext";

import {
  getAdminPets,
  getAdminStoreProducts,
  getAdminUsers,
  getReservations,
} from "../../services/api";

import {
  formatDateTime,
  roleLabel,
} from "../../utils/format";

function roleEmoji(role) {
  return {
    owner: "🐾",
    vet: "🩺",
    store: "🏪",
    admin: "🛡️",
  }[role] || "👤";
}

export default function AdminHome() {
  const { token, user } = useAuth();

  const [users, setUsers] =
    useState([]);
  const [pets, setPets] =
    useState([]);
  const [reservations, setReservations] =
    useState([]);
  const [products, setProducts] =
    useState([]);

  async function load() {
    try {
      const [
        userRows,
        petRows,
        reservationRows,
        productRows,
      ] = await Promise.all([
        getAdminUsers(token),
        getAdminPets(token),
        getReservations(token),
        getAdminStoreProducts(token),
      ]);

      setUsers(userRows || []);
      setPets(petRows || []);
      setReservations(
        reservationRows || []
      );
      setProducts(
        productRows || []
      );
    } catch {}
  }

  useEffect(() => {
    load();
  }, []);

  const pendingReservations =
    reservations.filter(
      (item) =>
        item.status === "pending"
    );

  const recentUsers = useMemo(
    () =>
      [...users]
        .sort((a, b) => {
          const first =
            new Date(
              a.created_at || 0
            ).getTime() ||
            Number(a.id || 0);

          const second =
            new Date(
              b.created_at || 0
            ).getTime() ||
            Number(b.id || 0);

          return second - first;
        })
        .slice(0, 4),
    [users]
  );


  return (
    <Screen
      title={`Admin · ${
        user?.name?.split(" ")[0] ||
        ""
      }`}
      subtitle="Inicio informativo y acceso al panel de gestión"
      onRefresh={load}
    >
      <Card style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>
              CONTROL GENERAL
            </Text>
            <Text style={styles.heroTitle}>
              Estado de VetMap
            </Text>
            <Text style={styles.heroText}>
              Revisa actividad y entra a cada módulo cuando necesites gestionar información.
            </Text>
          </View>

          <AnimatedEmoji
            emoji="🛡️"
            size={46}
            motion="float"
          />
        </View>

        <View style={styles.stats}>
          <Stat
            value={users.length}
            label="Usuarios"
          />
          <Stat
            value={pets.length}
            label="Mascotas"
          />
          <Stat
            value={
              pendingReservations.length
            }
            label="Reservas pendientes"
          />
          <Stat
            value={products.length}
            label="Productos"
          />
        </View>
      </Card>

      <Text style={styles.sectionTitle}>
        Actividad reciente
      </Text>

      {recentUsers.length === 0 ? (
        <Empty
          icon="🪪"
          title="Sin registros recientes"
          text="Las nuevas cuentas aparecerán aquí."
        />
      ) : (
        recentUsers.map((item) => (
          <Card key={item.id}>
            <View style={styles.activityRow}>
              <AnimatedEmoji
                emoji={roleEmoji(
                  item.role
                )}
                size={29}
                motion="float"
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.activityName}>
                  {item.name}
                </Text>
                <Text style={styles.activityMeta}>
                  {roleLabel(
                    item.role
                  )}{" "}
                  · {item.email}
                </Text>
              </View>
            </View>

            {item.created_at ? (
              <Row
                label="Registro"
                value={formatDateTime(
                  item.created_at
                )}
              />
            ) : null}
          </Card>
        ))
      )}


      <MenuCard
        icon="👥"
        title="Usuarios"
        text="Crear, ver perfil, editar y eliminar cuentas"
        onPress={() =>
          router.push("/admin/users")
        }
      />

      <MenuCard
        icon="🐾"
        title="Mascotas"
        text="Ficha y gestión clínica global"
        onPress={() =>
          router.push("/admin/pets")
        }
      />

      <MenuCard
        icon="📅"
        title="Reservas"
        text="Agenda administrativa y estados"
        onPress={() =>
          router.push(
            "/admin/reservations"
          )
        }
      />

      <MenuCard
        icon="🏷️"
        title="Productos"
        text="Buscar, filtrar y gestionar cualquier tienda"
        onPress={() =>
          router.push("/admin/products")
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: "#E9F7F2",
  },
  heroTop: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  kicker: {
    color: COLORS.teal,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  heroTitle: {
    color: COLORS.navy,
    fontWeight: "900",
    fontSize: 22,
    marginTop: 3,
  },
  heroText: {
    color: COLORS.muted,
    lineHeight: 19,
    marginTop: 5,
  },
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  sectionTitle: {
    color: COLORS.navy,
    fontSize: 18,
    fontWeight: "900",
  },
  activityRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  activityName: {
    color: COLORS.navy,
    fontWeight: "900",
    fontSize: 16,
  },
  activityMeta: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
  },
});
