import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Badge,
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
import SelectField from "../../components/SelectField";
import { AnimatedEmoji } from "../../components/AnimatedEmoji";
import { useAuth } from "../../context/AuthContext";
import { downloadAppointmentReport } from "../../services/downloads";

import {
  archiveAdminReservation,
  archiveAllAdminFinalReservations,
  createAdminReservation,
  getAdminPets,
  getAdminUsers,
  getReservationAvailability,
  getReservations,
  getVeterinaryClinics,
  updateReservationStatus,
} from "../../services/api";

import {
  formatDate,
  statusLabel,
  todayISO,
} from "../../utils/format";

const STATES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
].map((value) => ({
  value,
  label: statusLabel(value),
}));

export default function AdminReservations() {
  const { token } = useAuth();

  const [users, setUsers] = useState([]);
  const [pets, setPets] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [items, setItems] = useState([]);

  const [availability, setAvailability] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const [show, setShow] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [form, setForm] = useState({
    owner_id: "",
    pet_id: "",
    veterinary_id: "",
    service: "",
    appointment_date: todayISO(),
    appointment_time: "",
    notes: "",
  });

  const set = (key, value) =>
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

  const owners = useMemo(
    () => users.filter((user) => user.role === "owner"),
    [users]
  );

  const ownerPets = useMemo(
    () =>
      pets.filter(
        (pet) =>
          String(pet.owner_id) === String(form.owner_id)
      ),
    [pets, form.owner_id]
  );

  const selectedClinic = useMemo(
    () =>
      clinics.find(
        (clinic) =>
          String(clinic.id) === String(form.veterinary_id)
      ) || null,
    [clinics, form.veterinary_id]
  );

  const services = useMemo(
    () =>
      String(selectedClinic?.services || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [selectedClinic]
  );

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();

    return items.filter((item) => {
      const searchOk =
        !text ||
        [
          item.pet_name,
          item.pet_species,
          item.user_name,
          item.user_email,
          item.veterinary_name,
          item.service,
          item.id,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(text);

      const statusOk =
        statusFilter === "all" ||
        item.status === statusFilter;

      return searchOk && statusOk;
    });
  }, [items, query, statusFilter]);

  async function load() {
    setLoading(true);

    try {
      const [userRows, petRows, clinicRows, reservationRows] =
        await Promise.all([
          getAdminUsers(token),
          getAdminPets(token),
          getVeterinaryClinics(),
          getReservations(token),
        ]);

      setUsers(userRows || []);
      setPets(petRows || []);
      setClinics(clinicRows || []);
      setItems(reservationRows || []);
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

  function resetForm() {
    setForm({
      owner_id: "",
      pet_id: "",
      veterinary_id: "",
      service: "",
      appointment_date: todayISO(),
      appointment_time: "",
      notes: "",
    });
    setAvailability(null);
  }

  async function loadSlots() {
    setError("");

    if (!form.veterinary_id || !form.appointment_date) {
      setError("Selecciona una veterinaria y una fecha.");
      return;
    }

    setAvailabilityLoading(true);

    try {
      setAvailability(
        await getReservationAvailability(
          token,
          Number(form.veterinary_id),
          form.appointment_date
        )
      );
    } catch (e) {
      setAvailability(null);
      setError(e.message);
    } finally {
      setAvailabilityLoading(false);
    }
  }

  async function create() {
    setError("");
    setOk("");

    if (
      !form.owner_id ||
      !form.pet_id ||
      !form.veterinary_id ||
      !form.service ||
      !form.appointment_date ||
      !form.appointment_time
    ) {
      setError("Completa dueño, mascota, veterinaria, servicio, fecha y hora.");
      return;
    }

    if (form.appointment_date < todayISO()) {
      setError("No puedes registrar una reserva en una fecha pasada.");
      return;
    }

    setCreating(true);

    try {
      await createAdminReservation(
        token,
        Number(form.owner_id),
        {
          pet_id: Number(form.pet_id),
          veterinary_id: Number(form.veterinary_id),
          service: form.service,
          appointment_date: form.appointment_date,
          appointment_time: form.appointment_time,
          notes: form.notes || null,
        }
      );

      setOk("Reserva administrativa creada correctamente.");
      setShow(false);
      resetForm();
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function changeStatus(id, status) {
    try {
      await updateReservationStatus(token, id, status);
      setOk(`Reserva actualizada a ${statusLabel(status)}.`);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  const slots = availability?.slots || [];

  return (
    <Screen
      title="Reservas globales"
      subtitle="Agenda y supervisión administrativa"
      back
      backTo="/admin"
      onRefresh={load}
      refreshing={loading}
    >
      <ErrorBox message={error} />
      <SuccessBox message={ok} />

      <Button
        label={show ? "Cerrar agenda" : "📅 Agendar para un dueño"}
        onPress={() => {
          if (show) resetForm();
          setShow((current) => !current);
        }}
      />

      {show ? (
        <Card>
          <View style={styles.formHead}>
            <AnimatedEmoji emoji="📅" size={36} motion="pulse" />
            <View style={{ flex: 1 }}>
              <Text style={styles.formTitle}>Nueva reserva administrativa</Text>
              <Text style={styles.formText}>
                Selecciona primero al dueño para mostrar solamente sus mascotas.
              </Text>
            </View>
          </View>

          <SelectField
            label="Dueño"
            searchable
            searchPlaceholder="Buscar dueño..."
            placeholder="Selecciona un dueño"
            options={owners.map((owner) => ({
              value: String(owner.id),
              label: `${owner.name} · ${owner.email}`,
            }))}
            value={form.owner_id}
            onChange={(value) => {
              setForm((current) => ({
                ...current,
                owner_id: value,
                pet_id: "",
              }));
            }}
          />

          <SelectField
            label="Mascota"
            searchable
            disabled={!form.owner_id}
            placeholder={
              form.owner_id
                ? "Selecciona una mascota"
                : "Primero selecciona un dueño"
            }
            options={ownerPets.map((pet) => ({
              value: String(pet.id),
              label: `${pet.name} · ${pet.species}${pet.breed ? ` · ${pet.breed}` : ""}`,
            }))}
            value={form.pet_id}
            onChange={(value) => set("pet_id", value)}
          />

          <SelectField
            label="Veterinaria"
            searchable
            searchPlaceholder="Buscar veterinaria..."
            placeholder="Selecciona una veterinaria"
            options={clinics.map((clinic) => ({
              value: String(clinic.id),
              label: `${clinic.name} · ${clinic.commune || ""}`,
            }))}
            value={form.veterinary_id}
            onChange={(value) => {
              const clinic = clinics.find(
                (item) => String(item.id) === String(value)
              );
              const options = String(clinic?.services || "")
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);

              setForm((current) => ({
                ...current,
                veterinary_id: value,
                service: options[0] || "",
                appointment_time: "",
              }));
              setAvailability(null);
            }}
          />

          {services.length ? (
            <SelectField
              label="Servicio"
              options={services.map((service) => ({
                value: service,
                label: service,
              }))}
              value={form.service}
              onChange={(value) => set("service", value)}
            />
          ) : null}

          <Input
            label="Fecha"
            value={form.appointment_date}
            onChangeText={(value) => {
              set("appointment_date", value);
              set("appointment_time", "");
              setAvailability(null);
            }}
            placeholder="AAAA-MM-DD"
          />

          <Button
            label={availabilityLoading ? "Buscando horarios..." : "Buscar horarios disponibles"}
            variant="secondary"
            disabled={availabilityLoading || !form.veterinary_id || !form.appointment_date}
            onPress={loadSlots}
          />

          {slots.length ? (
            <>
              <Text style={styles.slotsTitle}>Horarios</Text>
              <View style={styles.slotsGrid}>
                {slots.map((slot) => {
                  const selected = form.appointment_time === slot.time;
                  return (
                    <TouchableOpacity
                      key={slot.time}
                      disabled={!slot.available}
                      onPress={() => set("appointment_time", slot.time)}
                      style={[
                        styles.slot,
                        selected && styles.slotSelected,
                        !slot.available && styles.slotDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.slotText,
                          selected && styles.slotTextSelected,
                          !slot.available && styles.slotTextDisabled,
                        ]}
                      >
                        {slot.time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.availableText}>
                {availability?.available_count ?? slots.filter((slot) => slot.available).length} horarios disponibles
              </Text>
            </>
          ) : availability && !availabilityLoading ? (
            <Text style={styles.noSlots}>No hay horarios disponibles para esa fecha.</Text>
          ) : null}

          <Input
            label="Notas"
            multiline
            value={form.notes}
            onChangeText={(value) => set("notes", value)}
            placeholder="Observación opcional"
          />

          <Button
            label={creating ? "Creando reserva..." : "Crear reserva"}
            disabled={
              creating ||
              !form.owner_id ||
              !form.pet_id ||
              !form.veterinary_id ||
              !form.service ||
              !form.appointment_time
            }
            onPress={create}
          />
        </Card>
      ) : null}

      <Input
        label="Buscar reserva"
        value={query}
        onChangeText={setQuery}
        placeholder="Mascota, dueño, veterinaria, servicio o ID..."
      />

      <SelectField
        label="Filtrar por estado"
        options={[
          { value: "all", label: "Todas" },
          ...STATES,
        ]}
        value={statusFilter}
        onChange={setStatusFilter}
      />

      <View style={styles.summaryRow}>
        <Summary value={items.length} label="Total" />
        <Summary value={items.filter((item) => item.status === "pending").length} label="Pendientes" />
        <Summary value={items.filter((item) => item.status === "completed").length} label="Completadas" />
      </View>

      <Button
        label="🧹 Limpiar finalizadas"
        variant="ghost"
        onPress={() =>
          confirm(
            "Limpiar reservas finalizadas",
            "Se quitarán del historial visible las reservas completadas y canceladas.",
            async () => {
              try {
                await archiveAllAdminFinalReservations(token);
                setOk("Historial finalizado limpiado correctamente.");
                await load();
              } catch (e) {
                setError(e.message);
              }
            }
          )
        }
      />

      <Text style={styles.resultCount}>
        {filtered.length} reserva{filtered.length === 1 ? "" : "s"} visible{filtered.length === 1 ? "" : "s"}
      </Text>

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <Empty icon="📅" title="Sin reservas para mostrar" />
      ) : (
        filtered.map((reservation) => {
          const final = ["completed", "cancelled"].includes(reservation.status);

          return (
            <Card key={reservation.id}>
              <View style={styles.reservationHead}>
                <AnimatedEmoji
                  emoji={reservation.pet_species?.toLowerCase().includes("gato") ? "🐱" : reservation.pet_species?.toLowerCase().includes("perro") ? "🐶" : "🐾"}
                  size={32}
                  motion="float"
                />

                <View style={{ flex: 1 }}>
                  <Text style={styles.petName}>{reservation.pet_name}</Text>
                  <Text style={styles.service}>{reservation.service}</Text>
                </View>

                <Badge status={reservation.status} />
              </View>

              <Row label="ID reserva" value={reservation.id} />
              <Row label="Dueño" value={reservation.user_name} />
              {reservation.user_email ? <Row label="Correo" value={reservation.user_email} /> : null}
              <Row label="Veterinaria" value={reservation.veterinary_name} />
              <Row
                label="Fecha"
                value={`${formatDate(reservation.appointment_date)} · ${String(reservation.appointment_time || "").slice(0, 5)}`}
              />
              {reservation.notes ? <Row label="Notas" value={reservation.notes} /> : null}

              {!final ? (
                <SelectField
                  label="Estado"
                  options={STATES}
                  value={reservation.status}
                  onChange={(next) => changeStatus(reservation.id, next)}
                />
              ) : (
                <View style={styles.finalBox}>
                  <Text style={styles.finalText}>🔒 Reserva finalizada · estado bloqueado</Text>
                </View>
              )}

              <Button
                label={
                  reservation.status === "completed"
                    ? "📄 Descargar informe de atención"
                    : "📄 Descargar comprobante / informe"
                }
                variant="secondary"
                onPress={async () => {
                  try {
                    await downloadAppointmentReport(token, reservation.id);
                  } catch (e) {
                    setError(e.message);
                  }
                }}
              />

              {final ? (
                <Button
                  label="Quitar del historial"
                  compact
                  variant="ghost"
                  onPress={async () => {
                    try {
                      await archiveAdminReservation(token, reservation.id);
                      await load();
                    } catch (e) {
                      setError(e.message);
                    }
                  }}
                />
              ) : null}
            </Card>
          );
        })
      )}
    </Screen>
  );
}

function Summary({ value, label }) {
  return (
    <View style={styles.summary}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  formHead: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 10 },
  formTitle: { color: "#162850", fontSize: 18, fontWeight: "900" },
  formText: { color: "#526A63", fontSize: 11, marginTop: 2, lineHeight: 16 },
  slotsTitle: { color: "#162850", fontWeight: "900", marginBottom: 7 },
  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 7 },
  slot: { minWidth: 74, borderRadius: 12, borderWidth: 1, borderColor: "#BBD8D0", paddingVertical: 9, paddingHorizontal: 10, alignItems: "center", backgroundColor: "#F8FCFB" },
  slotSelected: { backgroundColor: "#162850", borderColor: "#162850" },
  slotDisabled: { backgroundColor: "#F1F3F3", borderColor: "#E1E5E4" },
  slotText: { color: "#162850", fontWeight: "900", fontSize: 12 },
  slotTextSelected: { color: "white" },
  slotTextDisabled: { color: "#A8B1AF", textDecorationLine: "line-through" },
  availableText: { color: "#6AA896", fontSize: 11, fontWeight: "800", marginBottom: 9 },
  noSlots: { color: "#A45B3A", fontWeight: "800", fontSize: 11, marginVertical: 8 },
  summaryRow: { flexDirection: "row", gap: 8 },
  summary: { flex: 1, backgroundColor: "#E9F7F2", borderRadius: 14, padding: 10, alignItems: "center" },
  summaryValue: { color: "#162850", fontSize: 20, fontWeight: "900" },
  summaryLabel: { color: "#526A63", fontSize: 10, fontWeight: "800", marginTop: 2 },
  resultCount: { color: "#6AA896", fontWeight: "900", fontSize: 11 },
  reservationHead: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 8 },
  petName: { color: "#162850", fontWeight: "900", fontSize: 17 },
  service: { color: "#6AA896", fontSize: 11, fontWeight: "800", marginTop: 2 },
  finalBox: { backgroundColor: "#F4F7F6", borderRadius: 12, padding: 9, marginVertical: 7 },
  finalText: { color: "#526A63", textAlign: "center", fontWeight: "800", fontSize: 11 },
});
