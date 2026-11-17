import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import {
  Button,
  Card,
  COLORS,
  ErrorBox,
  Loading,
  Row,
  Screen,
  SectionTitle,
} from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { AnimatedEmoji } from "../../components/AnimatedEmoji";
import {
  getStorefrontStores,
  getVeterinaryClinics,
} from "../../services/api";
import { formatDate, roleLabel } from "../../utils/format";

const ROLE_ICONS = {
  owner: "🐾",
  vet: "🩺",
  store: "🏪",
  admin: "🛡️",
};

export default function Profile() {
  const { user } = useAuth();

  const [association, setAssociation] = useState(null);
  const [associationLoading, setAssociationLoading] = useState(false);
  const [associationError, setAssociationError] = useState("");

  const roleIcon = ROLE_ICONS[user?.role] || "👤";

  useEffect(() => {
    let active = true;

    async function loadAssociation() {
      if (!user) return;

      if (
        user.role !== "vet" &&
        user.role !== "store"
      ) {
        setAssociation(null);
        return;
      }

      setAssociationLoading(true);
      setAssociationError("");

      try {
        if (user.role === "vet") {
          if (!user.veterinary_id) {
            if (active) setAssociation(null);
            return;
          }

          const clinics = await getVeterinaryClinics();
          const clinic = clinics.find(
            (item) =>
              String(item.id) ===
              String(user.veterinary_id)
          );

          if (active) {
            setAssociation(
              clinic
                ? {
                    type: "clinic",
                    name: clinic.name,
                    commune: clinic.commune,
                    address: clinic.address,
                    hours: clinic.hours,
                  }
                : null
            );
          }

          return;
        }

        if (!user.store_id) {
          if (active) setAssociation(null);
          return;
        }

        const stores = await getStorefrontStores();
        const store = stores.find(
          (item) =>
            String(item.id) === String(user.store_id)
        );

        if (active) {
          setAssociation(
            store
              ? {
                  type: "store",
                  name: store.name,
                  commune: store.commune,
                  address: store.address,
                  delivery_conditions:
                    store.delivery_conditions,
                }
              : null
          );
        }
      } catch (error) {
        if (active) {
          setAssociationError(
            error.message ||
              "No se pudo cargar la asociación."
          );
        }
      } finally {
        if (active) setAssociationLoading(false);
      }
    }

    loadAssociation();

    return () => {
      active = false;
    };
  }, [user]);

  const accountSubtitle = useMemo(
    () => roleLabel(user?.role),
    [user?.role]
  );

  if (!user) {
    return (
      <Screen title="Ver perfil" back>
        <Loading label="Cargando perfil..." />
      </Screen>
    );
  }

  return (
    <Screen
      title="Ver perfil"
      subtitle="Información de tu cuenta VetMap"
      back
    >
      <Card style={styles.identityCard}>
        <View style={styles.avatar}>
          <AnimatedEmoji
            emoji={roleIcon}
            size={42}
            motion="float"
          />
        </View>

        <View style={styles.identityText}>
          <Text style={styles.name}>
            {user.name || "Usuario VetMap"}
          </Text>

          <View style={styles.rolePill}>
            <Text style={styles.rolePillText}>
              {accountSubtitle}
            </Text>
          </View>

          <Text style={styles.email}>
            {user.email || "-"}
          </Text>
        </View>
      </Card>

      <SectionTitle>
        Información de la cuenta
      </SectionTitle>

      <Card>
        <Row
          label="Nombre"
          value={user.name || "-"}
        />
        <Row
          label="Correo"
          value={user.email || "-"}
        />
        <Row
          label="Rol"
          value={accountSubtitle}
        />
        <Row
          label="RUT"
          value={user.rut || "No registrado"}
        />
        <Row
          label="Fecha de nacimiento"
          value={
            user.birth_date
              ? formatDate(user.birth_date)
              : "No registrada"
          }
        />
        <Row
          label="País"
          value={user.country || "No registrado"}
        />
        <Row
          label="Región"
          value={user.region || "No registrada"}
        />
        <Row
          label="Ciudad"
          value={user.city || "No registrada"}
        />
      </Card>

      {user.role === "vet" ? (
        <>
          <SectionTitle>
            Clínica asociada
          </SectionTitle>

          {associationLoading ? (
            <Loading label="Cargando clínica..." />
          ) : (
            <Card>
              <View style={styles.workHeader}>
                <View style={styles.workIcon}>
                  <AnimatedEmoji emoji="🏥" size={27} motion="float" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.workName}>
                    {association?.name ||
                      "Sin clínica asociada"}
                  </Text>
                  <Text style={styles.workType}>
                    Veterinaria asignada a esta cuenta
                  </Text>
                </View>
              </View>

              {association ? (
                <>
                  <Row
                    label="Comuna"
                    value={
                      association.commune || "-"
                    }
                  />
                  <Row
                    label="Dirección"
                    value={
                      association.address || "-"
                    }
                  />
                  <Row
                    label="Horario"
                    value={
                      association.hours || "-"
                    }
                  />
                </>
              ) : (
                <Text style={styles.mutedMessage}>
                  Esta cuenta veterinaria todavía
                  no tiene una clínica asignada.
                </Text>
              )}
            </Card>
          )}
        </>
      ) : null}

      {user.role === "store" ? (
        <>
          <SectionTitle>
            Tienda asociada
          </SectionTitle>

          {associationLoading ? (
            <Loading label="Cargando tienda..." />
          ) : (
            <Card>
              <View style={styles.workHeader}>
                <View style={styles.workIcon}>
                  <AnimatedEmoji emoji="🏪" size={27} motion="float" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.workName}>
                    {association?.name ||
                      "Sin tienda asociada"}
                  </Text>
                  <Text style={styles.workType}>
                    Tienda asignada a esta cuenta
                  </Text>
                </View>
              </View>

              {association ? (
                <>
                  <Row
                    label="Comuna"
                    value={
                      association.commune || "-"
                    }
                  />
                  <Row
                    label="Dirección"
                    value={
                      association.address || "-"
                    }
                  />
                  <Row
                    label="Despacho"
                    value={
                      association.delivery_conditions ||
                      "-"
                    }
                  />
                </>
              ) : (
                <Text style={styles.mutedMessage}>
                  Esta cuenta de tienda todavía no
                  tiene un establecimiento asignado.
                </Text>
              )}
            </Card>
          )}
        </>
      ) : null}

      <ErrorBox message={associationError} />

      <SectionTitle>
        Configuración
      </SectionTitle>

      <Card>
        <View style={styles.editIntro}>
          <View style={styles.editIcon}>
            <Text style={{ fontSize: 22 }}>
              ✏️
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.editTitle}>
              Modificar perfil
            </Text>
            <Text style={styles.editText}>
              Cambia tus datos personales, correo
              o contraseña desde un apartado
              separado.
            </Text>
          </View>
        </View>

        <Button
          label="Modificar perfil"
          onPress={() =>
            router.push("/common/profile-edit")
          }
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  identityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.mint,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarIcon: {
    fontSize: 32,
  },

  identityText: {
    flex: 1,
  },

  name: {
    color: COLORS.navy,
    fontSize: 24,
    fontWeight: "800",
  },

  rolePill: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.mint,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 7,
  },

  rolePillText: {
    color: COLORS.teal,
    fontWeight: "800",
    fontSize: 12,
  },

  email: {
    color: COLORS.muted,
    marginTop: 8,
    fontSize: 14,
  },

  workHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },

  workIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: COLORS.mint,
    alignItems: "center",
    justifyContent: "center",
  },

  workEmoji: {
    fontSize: 24,
  },

  workName: {
    color: COLORS.navy,
    fontWeight: "800",
    fontSize: 17,
  },

  workType: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 3,
  },

  mutedMessage: {
    color: COLORS.muted,
    lineHeight: 20,
  },

  editIntro: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },

  editIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.mint,
    alignItems: "center",
    justifyContent: "center",
  },

  editTitle: {
    color: COLORS.navy,
    fontWeight: "800",
    fontSize: 16,
  },

  editText: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
});
