import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { router, useLocalSearchParams } from "expo-router";

import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Badge,
  Button,
  Card,
  COLORS,
  confirm,
  Empty,
  ErrorBox,
  Input,
  Loading,
  Row,
  Screen,
  SectionTitle,
  SuccessBox,
} from "../../components/ui";
import SelectField from "../../components/SelectField";
import { ActionCelebration, AnimatedEmoji } from "../../components/AnimatedEmoji";

import { useAuth } from "../../context/AuthContext";
import { downloadAppointmentReport } from "../../services/downloads";

import {
  archiveFinalReservations,
  archiveReservation,
  cancelReservation,
  createReservation,
  getPets,
  getReservationAvailability,
  getReservations,
  getVeterinaryClinics,
} from "../../services/api";

import {
  formatDate,
  todayISO,
} from "../../utils/format";

function StepCard({
  number,
  title,
  text,
  children,
}) {
  return (
    <Card>
      <View style={styles.stepHeader}>
        <View style={styles.stepNumber}>
          <Text
            style={
              styles.stepNumberText
            }
          >
            {number}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.stepTitle}>
            {title}
          </Text>
          <Text style={styles.stepText}>
            {text}
          </Text>
        </View>
      </View>

      <View style={styles.stepBody}>
        {children}
      </View>
    </Card>
  );
}

function petEmoji(species) {
  const value = String(species || "").toLowerCase();
  if (value.includes("perro")) return "🐶";
  if (value.includes("gato")) return "🐱";
  if (value.includes("conejo")) return "🐰";
  return "🐾";
}

function nextDateOptions() {
  const rows = [];
  const base = new Date();

  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(base);
    date.setDate(base.getDate() + offset);

    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const day = date.toLocaleDateString("es-CL", { weekday: "short" }).replace(".", "");
    const number = date.getDate();

    rows.push({ value, day, number });
  }

  return rows;
}

export default function Reservations() {
  const { token } = useAuth();
  const params = useLocalSearchParams();

  const [pets, setPets] =
    useState([]);
  const [clinics, setClinics] =
    useState([]);
  const [items, setItems] =
    useState([]);

  const [availability, setAvailability] =
    useState(null);
  const [availabilityLoading, setAvailabilityLoading] =
    useState(false);

  const [form, setForm] =
    useState({
      pet_id: "",
      veterinary_id: "",
      service: "",
      appointment_date:
        todayISO(),
      appointment_time: "",
      notes: "",
    });

  const [show, setShow] =
    useState(false);
  const [confirmOpen, setConfirmOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [ok, setOk] =
    useState("");
  const [appointmentCelebration, setAppointmentCelebration] = useState(false);

  const set = (key, value) =>
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

  const selectedPet =
    useMemo(
      () =>
        pets.find(
          (item) =>
            String(item.id) ===
            String(form.pet_id)
        ) || null,
      [pets, form.pet_id]
    );

  const selectedClinic =
    useMemo(
      () =>
        clinics.find(
          (item) =>
            String(item.id) ===
            String(
              form.veterinary_id
            )
        ) || null,
      [
        clinics,
        form.veterinary_id,
      ]
    );

  const services = (
    selectedClinic?.services || ""
  )
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const dateOptions = useMemo(
    () => nextDateOptions(),
    []
  );

  async function load() {
    setLoading(true);

    try {
      const [petRows, clinicRows, reservationRows] =
        await Promise.all([
          getPets(token),
          getVeterinaryClinics(),
          getReservations(token),
        ]);

      setPets(petRows);
      setClinics(clinicRows);
      setItems(reservationRows);
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
    const requestedPetId =
      params?.pet_id
        ? String(params.pet_id)
        : "";

    if (
      requestedPetId &&
      !form.pet_id &&
      pets.some(
        (pet) =>
          String(pet.id) ===
          requestedPetId
      )
    ) {
      setForm((current) => ({
        ...current,
        pet_id: requestedPetId,
      }));
      setShow(true);
    }
  }, [
    params?.pet_id,
    pets.length,
    form.pet_id,
  ]);

  useEffect(() => {
    const requestedClinicId =
      params?.veterinary_id
        ? String(params.veterinary_id)
        : "";

    if (
      requestedClinicId &&
      !form.veterinary_id &&
      clinics.some(
        (clinic) =>
          String(clinic.id) ===
          requestedClinicId
      )
    ) {
      setForm((current) => ({
        ...current,
        veterinary_id:
          requestedClinicId,
        service: "",
        appointment_time: "",
      }));
      setShow(true);
    }
  }, [
    params?.veterinary_id,
    clinics.length,
    form.veterinary_id,
  ]);

  async function loadSlots(
    clinicId = form.veterinary_id,
    date = form.appointment_date
  ) {
    if (!clinicId || !date) {
      setAvailability(null);
      return;
    }

    setAvailabilityLoading(true);
    setError("");

    try {
      const result =
        await getReservationAvailability(
          token,
          Number(clinicId),
          date
        );

      setAvailability(result);
    } catch (e) {
      setAvailability(null);
      setError(e.message);
    } finally {
      setAvailabilityLoading(false);
    }
  }

  function resetForm() {
    setForm({
      pet_id: "",
      veterinary_id: "",
      service: "",
      appointment_date:
        todayISO(),
      appointment_time: "",
      notes: "",
    });

    setAvailability(null);
    setConfirmOpen(false);
  }

  const bookingStep =
    !form.pet_id
      ? 1
      : !form.veterinary_id
      ? 2
      : !form.service
      ? 3
      : 4;

  async function save() {
    setError("");
    setOk("");

    if (
      !form.pet_id ||
      !form.veterinary_id ||
      !form.service ||
      !form.appointment_date ||
      !form.appointment_time
    ) {
      setError(
        "Faltan datos para completar la reserva."
      );
      return;
    }

    try {
      await createReservation(
        token,
        {
          pet_id: Number(
            form.pet_id
          ),
          veterinary_id: Number(
            form.veterinary_id
          ),
          service: form.service,
          appointment_date:
            form.appointment_date,
          appointment_time:
            form.appointment_time,
          notes:
            form.notes || null,
        }
      );

      setOk(
        "¡Hora agendada correctamente!"
      );

      setAppointmentCelebration(true);
      setShow(false);
      resetForm();
      await load();

      setTimeout(
        () =>
          setAppointmentCelebration(false),
        1800
      );
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <Screen
      title="Reservar hora"
      subtitle="Agenda una atención paso a paso"
      onRefresh={load}
      refreshing={loading}
    >
      <ErrorBox message={error} />
      <SuccessBox message={ok} />

      {show ? (
        <View style={styles.nativeStepper}>
          {[
            ["1", "Mascota"],
            ["2", "Veterinaria"],
            ["3", "Servicio"],
            ["4", "Fecha y hora"],
          ].map(([number, label], index) => {
            const step = index + 1;
            const active = bookingStep === step;
            const done = bookingStep > step;

            return (
              <View key={number} style={styles.nativeStepItem}>
                {index < 3 ? (
                  <View
                    style={[
                      styles.nativeStepConnector,
                      done &&
                        styles.nativeStepConnectorDone,
                    ]}
                  />
                ) : null}

                <View
                  style={[
                    styles.nativeStepCircle,
                    active &&
                      styles.nativeStepCircleActive,
                    done &&
                      styles.nativeStepCircleDone,
                  ]}
                >
                  <Text
                    style={[
                      styles.nativeStepNumber,
                      (active || done) &&
                        styles.nativeStepNumberActive,
                    ]}
                  >
                    {done ? "✓" : number}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.nativeStepLabel,
                    active &&
                      styles.nativeStepLabelActive,
                  ]}
                >
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      <Button
        label={
          show
            ? "Cerrar"
            : "＋ Reservar una hora"
        }
        onPress={() => {
          if (show) {
            resetForm();
          }

          setShow((value) => !value);
        }}
      />

      {show ? (
        <>
          <StepCard
            number="1"
            title="Mascota y veterinaria"
            text="Selecciona quién será atendido y dónde."
          >
            <Text style={styles.nativePrompt}>¿Para qué mascota es la cita?</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.petChoiceStrip}
            >
              {pets.map((pet) => {
                const selected = String(form.pet_id) === String(pet.id);

                return (
                  <TouchableOpacity
                    key={pet.id}
                    activeOpacity={0.82}
                    style={styles.petChoice}
                    onPress={() => set("pet_id", String(pet.id))}
                  >
                    <View style={[styles.petChoiceCircle, selected && styles.petChoiceCircleSelected]}>
                      {pet.photo_data ? (
                        <Image source={{ uri: pet.photo_data }} style={styles.petChoicePhoto} />
                      ) : (
                        <AnimatedEmoji emoji={petEmoji(pet.species)} size={33} motion="float" />
                      )}
                    </View>
                    <Text style={[styles.petChoiceName, selected && styles.petChoiceNameSelected]}>
                      {pet.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={styles.petChoice}
                onPress={() => router.push("/owner/pet-new")}
              >
                <View style={[styles.petChoiceCircle, styles.petChoiceAdd]}>
                  <Text style={styles.petChoicePlus}>＋</Text>
                </View>
                <Text style={styles.petChoiceName}>Agregar</Text>
              </TouchableOpacity>
            </ScrollView>

            <Text style={styles.nativePrompt}>Selecciona la veterinaria</Text>

            <View style={styles.clinicChoiceList}>
              {clinics.map((clinic) => {
                const selected = String(form.veterinary_id) === String(clinic.id);

                return (
                  <TouchableOpacity
                    key={clinic.id}
                    activeOpacity={0.84}
                    style={[styles.clinicChoiceCard, selected && styles.clinicChoiceCardSelected]}
                    onPress={() => {
                      const nextServices = String(clinic.services || "")
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean);

                      setForm((current) => ({
                        ...current,
                        veterinary_id: String(clinic.id),
                        service: nextServices[0] || "",
                        appointment_time: "",
                      }));
                      setAvailability(null);

                      if (form.appointment_date) {
                        setTimeout(() => loadSlots(String(clinic.id), form.appointment_date), 0);
                      }
                    }}
                  >
                    <View style={styles.clinicChoiceIcon}>
                      <AnimatedEmoji emoji={clinic.is_24h ? "🚑" : "🏥"} size={26} motion="float" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.clinicChoiceName}>{clinic.name}</Text>
                      <Text style={styles.clinicChoiceMeta}>📍 {clinic.commune || "Comuna"} · 🕐 {clinic.hours || "Horario por confirmar"}</Text>
                    </View>
                    <View style={[styles.clinicRadio, selected && styles.clinicRadioSelected]}>
                      {selected ? <Text style={styles.clinicCheck}>✓</Text> : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </StepCard>

          <StepCard
            number="2"
            title="Servicio y fecha"
            text="Los servicios cambian según la veterinaria seleccionada."
          >
            <Text style={styles.nativePrompt}>Selecciona el servicio</Text>

            <View style={styles.serviceChoices}>
              {services.length ? (
                services.map((service, index) => {
                  const selected = form.service === service;
                  const icons = ["🩺", "💉", "🐾", "➕"];

                  return (
                    <TouchableOpacity
                      key={service}
                      activeOpacity={0.84}
                      style={[styles.serviceChoice, selected && styles.serviceChoiceSelected]}
                      onPress={() => set("service", service)}
                    >
                      <Text style={styles.serviceChoiceIcon}>{icons[index % icons.length]}</Text>
                      <Text style={[styles.serviceChoiceText, selected && styles.serviceChoiceTextSelected]}>
                        {service}
                      </Text>
                      <Text style={[styles.serviceChoiceCheck, selected && styles.serviceChoiceCheckSelected]}>
                        {selected ? "✓" : "○"}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text style={styles.placeholderText}>Primero selecciona una veterinaria.</Text>
              )}
            </View>

            <Text style={styles.nativePrompt}>Elige una fecha</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateStrip}
            >
              {dateOptions.map((date) => {
                const selected = form.appointment_date === date.value;
                return (
                  <TouchableOpacity
                    key={date.value}
                    activeOpacity={0.82}
                    style={[styles.dateChip, selected && styles.dateChipSelected]}
                    onPress={() => {
                      setForm((current) => ({
                        ...current,
                        appointment_date: date.value,
                        appointment_time: "",
                      }));
                      setAvailability(null);
                      if (form.veterinary_id) {
                        setTimeout(() => loadSlots(form.veterinary_id, date.value), 0);
                      }
                    }}
                  >
                    <Text style={[styles.dateChipDay, selected && styles.dateChipTextSelected]}>{date.day}</Text>
                    <Text style={[styles.dateChipNumber, selected && styles.dateChipTextSelected]}>{date.number}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Input
              label="Otra fecha"
              placeholder="AAAA-MM-DD"
              value={form.appointment_date}
              onChangeText={(value) => {
                setForm((current) => ({
                  ...current,
                  appointment_date: value,
                  appointment_time: "",
                }));
                setAvailability(null);
                if (form.veterinary_id && value) {
                  setTimeout(() => loadSlots(form.veterinary_id, value), 0);
                }
              }}
            />
          </StepCard>

          <StepCard
            number="3"
            title="Horario disponible"
            text="Los horarios ocupados quedan bloqueados automáticamente."
          >
            {!form.veterinary_id ||
            !form.appointment_date ? (
              <View
                style={
                  styles.slotPlaceholder
                }
              >
                <Text
                  style={
                    styles.placeholderIcon
                  }
                >
                  🕐
                </Text>
                <Text
                  style={
                    styles.placeholderText
                  }
                >
                  Selecciona veterinaria y fecha para ver los horarios.
                </Text>
              </View>
            ) : availabilityLoading ? (
              <Loading label="Buscando horarios disponibles..." />
            ) : availability?.slots?.length ? (
              <>
                <View
                  style={
                    styles.legend
                  }
                >
                  <Text
                    style={
                      styles.legendAvailable
                    }
                  >
                    ● Disponible
                  </Text>
                  <Text
                    style={
                      styles.legendSelected
                    }
                  >
                    ● Seleccionado
                  </Text>
                  <Text
                    style={
                      styles.legendOccupied
                    }
                  >
                    ● Ocupado
                  </Text>
                </View>

                <View
                  style={
                    styles.slotGrid
                  }
                >
                  {availability.slots.map(
                    (slot) => {
                      const selected =
                        form.appointment_time ===
                        slot.time;

                      return (
                        <TouchableOpacity
                          key={
                            slot.time
                          }
                          disabled={
                            !slot.available
                          }
                          onPress={() =>
                            set(
                              "appointment_time",
                              slot.time
                            )
                          }
                          style={[
                            styles.slot,
                            selected &&
                              styles.slotSelected,
                            !slot.available &&
                              styles.slotOccupied,
                          ]}
                        >
                          <Text
                            style={[
                              styles.slotTime,
                              selected &&
                                styles.slotTextSelected,
                              !slot.available &&
                                styles.slotTextOccupied,
                            ]}
                          >
                            {slot.time}
                          </Text>
                          <Text
                            style={[
                              styles.slotState,
                              selected &&
                                styles.slotTextSelected,
                              !slot.available &&
                                styles.slotTextOccupied,
                            ]}
                          >
                            {slot.available
                              ? selected
                                ? "Elegido"
                                : "Disponible"
                              : "Ocupado"}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                  )}
                </View>

                <Text
                  style={
                    styles.availabilitySummary
                  }
                >
                  {availability.available_count ??
                    availability.slots.filter(
                      (slot) =>
                        slot.available
                    ).length}{" "}
                  horarios disponibles para esta fecha.
                </Text>
              </>
            ) : (
              <View
                style={
                  styles.slotPlaceholder
                }
              >
                <Text
                  style={
                    styles.placeholderIcon
                  }
                >
                  📅
                </Text>
                <Text
                  style={
                    styles.placeholderText
                  }
                >
                  No hay horarios disponibles para esta fecha.
                </Text>
              </View>
            )}
          </StepCard>

          <StepCard
            number="4"
            title="Observación"
            text="Opcional: agrega información útil para la atención."
          >
            <Input
              placeholder="Ejemplo: control anual, molestias, síntomas..."
              multiline
              value={form.notes}
              onChangeText={(value) =>
                set("notes", value)
              }
            />
          </StepCard>

          <Card
            style={
              styles.summaryCard
            }
          >
            <View
              style={
                styles.summaryHeader
              }
            >
              <AnimatedEmoji
                emoji="📋"
                size={27}
                motion="float"
              />

              <View
                style={{ flex: 1 }}
              >
                <Text
                  style={
                    styles.summarySmall
                  }
                >
                  RESUMEN DE LA RESERVA
                </Text>

                <Text
                  style={
                    styles.summaryTitle
                  }
                >
                  {selectedPet?.name ||
                    "Selecciona mascota"}{" "}
                  ·{" "}
                  {selectedClinic?.name ||
                    "Selecciona veterinaria"}
                </Text>

                <Text
                  style={
                    styles.summaryText
                  }
                >
                  {form.service ||
                    "Servicio pendiente"}{" "}
                  ·{" "}
                  {form.appointment_date ||
                    "Fecha pendiente"}{" "}
                  ·{" "}
                  {form.appointment_time ||
                    "Hora pendiente"}
                </Text>
              </View>
            </View>

            <Button
              label="Revisar y confirmar reserva"
              onPress={() =>
                setConfirmOpen(true)
              }
              disabled={
                !form.pet_id ||
                !form.veterinary_id ||
                !form.service ||
                !form.appointment_date ||
                !form.appointment_time
              }
            />
          </Card>

          <Card
            style={
              styles.infoCard
            }
          >
            <Text
              style={
                styles.infoTitle
              }
            >
              🐾 Agenda VetMap
            </Text>

            <Text
              style={
                styles.infoText
              }
            >
              El backend verifica nuevamente el horario antes de guardar la reserva para evitar duplicados.
            </Text>

            <Text
              style={
                styles.infoLine
              }
            >
              ✓ Servicios según veterinaria
            </Text>
            <Text
              style={
                styles.infoLine
              }
            >
              ✓ Horarios disponibles en tiempo real
            </Text>
            <Text
              style={
                styles.infoLine
              }
            >
              ✓ Horas ocupadas bloqueadas
            </Text>
            <Text
              style={
                styles.infoLine
              }
            >
              ✓ Confirmación antes de agendar
            </Text>
          </Card>
        </>
      ) : null}

      <SectionTitle>
        Mis reservas
      </SectionTitle>

      <Button
        label="Limpiar finalizadas"
        variant="ghost"
        onPress={async () => {
          try {
            await archiveFinalReservations(
              token
            );
            await load();
          } catch (e) {
            setError(e.message);
          }
        }}
      />

      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <Empty
          icon="📅"
          title="Sin reservas"
        />
      ) : (
        items.map((reservation) => (
          <Card key={reservation.id}>
            <Text
              style={
                styles.reservationTitle
              }
            >
              {reservation.pet_name} ·{" "}
              {reservation.service}
            </Text>

            <Row
              label="Veterinaria"
              value={
                reservation.veterinary_name
              }
            />

            <Row
              label="Fecha"
              value={`${formatDate(
                reservation.appointment_date
              )} · ${String(
                reservation.appointment_time
              ).slice(0, 5)}`}
            />

            <Badge
              status={
                reservation.status
              }
            />

            <Button
              label={
                reservation.status === "completed"
                  ? "📄 Descargar informe de atención"
                  : "📄 Descargar comprobante / informe"
              }
              compact
              variant="secondary"
              onPress={async () => {
                try {
                  await downloadAppointmentReport(
                    token,
                    reservation.id
                  );
                } catch (e) {
                  setError(e.message);
                }
              }}
            />

            {![
              "cancelled",
              "completed",
            ].includes(
              reservation.status
            ) ? (
              <Button
                label="Cancelar reserva"
                compact
                variant="danger"
                onPress={() =>
                  confirm(
                    "Cancelar reserva",
                    "¿Seguro que quieres cancelar esta hora?",
                    async () => {
                      try {
                        await cancelReservation(
                          token,
                          reservation.id
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
            ) : (
              <Button
                label="Quitar del historial"
                compact
                variant="ghost"
                onPress={async () => {
                  try {
                    await archiveReservation(
                      token,
                      reservation.id
                    );
                    await load();
                  } catch (e) {
                    setError(e.message);
                  }
                }}
              />
            )}
          </Card>
        ))
      )}

      <ActionCelebration
        visible={appointmentCelebration}
        type="appointment"
        title="¡Hora agendada!"
        text="La reserva quedó guardada correctamente."
      />

      <Modal
        visible={confirmOpen}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setConfirmOpen(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Confirmar reserva
            </Text>

            <Text style={styles.modalText}>
              Revisa los datos antes de agendar.
            </Text>

            <Row
              label="Mascota"
              value={
                selectedPet?.name
              }
            />
            <Row
              label="Veterinaria"
              value={
                selectedClinic?.name
              }
            />
            <Row
              label="Servicio"
              value={form.service}
            />
            <Row
              label="Fecha"
              value={
                form.appointment_date
              }
            />
            <Row
              label="Hora"
              value={
                form.appointment_time
              }
            />

            <Button
              label="Confirmar y agendar"
              onPress={async () => {
                setConfirmOpen(false);
                await save();
              }}
            />

            <Button
              label="Volver"
              variant="ghost"
              onPress={() =>
                setConfirmOpen(false)
              }
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  nativeStepper: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    borderRadius: 18,
    paddingHorizontal: 2,
    paddingVertical: 8,
  },
  nativeStepItem: {
    flex: 1,
    alignItems: "center",
    gap: 5,
    position: "relative",
  },
  nativeStepConnector: {
    position: "absolute",
    height: 2,
    top: 14,
    left: "61%",
    right: "-39%",
    backgroundColor: "#DCE8E7",
  },
  nativeStepConnectorDone: {
    backgroundColor: COLORS.brand,
  },
  nativeStepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EFF3F5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D7E1E4",
    zIndex: 2,
  },
  nativeStepCircleActive: {
    backgroundColor: COLORS.brand,
    borderColor: COLORS.brand,
    shadowColor: COLORS.brandDark,
    shadowOpacity: 0.16,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  nativeStepCircleDone: {
    backgroundColor: COLORS.brand,
    borderColor: COLORS.brand,
  },
  nativeStepNumber: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "900",
  },
  nativeStepNumberActive: { color: "white" },
  nativeStepLabel: {
    color: "#66798A",
    fontSize: 8,
    fontWeight: "800",
    textAlign: "center",
  },
  nativeStepLabelActive: {
    color: COLORS.navy,
    fontWeight: "900",
  },
  nativePrompt: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 8,
  },
  petChoiceStrip: { gap: 12, paddingRight: 5, marginBottom: 14 },
  petChoice: { width: 66, alignItems: "center" },
  petChoiceCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.mint100,
    borderWidth: 2,
    borderColor: COLORS.border,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  petChoiceCircleSelected: {
    borderColor: COLORS.brand,
    borderWidth: 3,
    shadowColor: COLORS.brand,
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  petChoicePhoto: { width: "100%", height: "100%" },
  petChoiceAdd: { borderStyle: "dashed", backgroundColor: "white", borderColor: COLORS.mint500 },
  petChoicePlus: { color: COLORS.mint600, fontSize: 28 },
  petChoiceName: { color: COLORS.muted, fontSize: 9, fontWeight: "800", marginTop: 4 },
  petChoiceNameSelected: { color: COLORS.navy, fontWeight: "900" },
  clinicChoiceList: { gap: 8, marginBottom: 4 },
  clinicChoiceCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "white",
    padding: 10,
  },
  clinicChoiceCardSelected: {
    borderColor: COLORS.brand,
    borderWidth: 2,
    backgroundColor: "#F4FFFE",
  },
  clinicChoiceIcon: { width: 52, height: 52, borderRadius: 15, backgroundColor: COLORS.mint100, alignItems: "center", justifyContent: "center" },
  clinicChoiceName: { color: COLORS.navy, fontWeight: "900", fontSize: 13 },
  clinicChoiceMeta: { color: COLORS.muted, fontSize: 9, marginTop: 3 },
  clinicRadio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" },
  clinicRadioSelected: {
    backgroundColor: COLORS.brand,
    borderColor: COLORS.brand,
  },
  clinicCheck: { color: "white", fontSize: 12, fontWeight: "900" },
  serviceChoices: { gap: 7, marginBottom: 12 },
  serviceChoice: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "white",
    paddingHorizontal: 12,
  },
  serviceChoiceSelected: {
    borderColor: COLORS.brand,
    backgroundColor: "#F4FFFE",
    borderWidth: 2,
  },
  serviceChoiceIcon: { fontSize: 20 },
  serviceChoiceText: { flex: 1, color: COLORS.navy, fontSize: 12, fontWeight: "800" },
  serviceChoiceTextSelected: { fontWeight: "900" },
  serviceChoiceCheck: { color: COLORS.muted, fontSize: 18 },
  serviceChoiceCheckSelected: {
    color: COLORS.brand,
    fontWeight: "900",
  },
  dateStrip: { gap: 7, paddingRight: 3, marginBottom: 10 },
  dateChip: {
    width: 54,
    height: 62,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  dateChipSelected: {
    backgroundColor: COLORS.brand,
    borderColor: COLORS.brand,
  },
  dateChipDay: { color: COLORS.muted, fontSize: 9, fontWeight: "800", textTransform: "capitalize" },
  dateChipNumber: { color: COLORS.navy, fontSize: 17, fontWeight: "900", marginTop: 2 },
  dateChipTextSelected: { color: "white" },
  stepHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    color: "white",
    fontWeight: "900",
  },
  stepTitle: {
    color: COLORS.navy,
    fontWeight: "900",
    fontSize: 15,
  },
  stepText: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  stepBody: {
    marginTop: 14,
  },
  selectedClinic: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    backgroundColor: "#F0F8F6",
    borderRadius: 14,
    padding: 12,
  },
  selectedClinicIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedClinicSmall: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
  },
  selectedClinicName: {
    color: COLORS.navy,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 1,
  },
  selectedClinicMeta: {
    color: COLORS.teal,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
  },
  selectedClinicServices: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 3,
  },
  slotPlaceholder: {
    minHeight: 120,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#BAD9D1",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  placeholderIcon: {
    fontSize: 30,
  },
  placeholderText: {
    color: COLORS.muted,
    textAlign: "center",
    fontSize: 12,
    marginTop: 6,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  legendAvailable: {
    color: COLORS.teal,
    fontSize: 10,
    fontWeight: "800",
  },
  legendSelected: {
    color: COLORS.navy,
    fontSize: 10,
    fontWeight: "800",
  },
  legendOccupied: {
    color: "#9B6A68",
    fontSize: 10,
    fontWeight: "800",
  },
  slotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  slot: {
    minWidth: 92,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "#F6FBF9",
    borderWidth: 1,
    borderColor: "#BAD9D1",
  },
  slotSelected: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  slotOccupied: {
    backgroundColor: "#F4F4F4",
    borderColor: "#D9D9D9",
  },
  slotTime: {
    color: COLORS.navy,
    fontWeight: "900",
    textAlign: "center",
  },
  slotState: {
    color: COLORS.teal,
    fontSize: 9,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 2,
  },
  slotTextSelected: {
    color: "white",
  },
  slotTextOccupied: {
    color: "#999999",
  },
  availabilitySummary: {
    color: COLORS.teal,
    fontWeight: "800",
    fontSize: 11,
    marginTop: 10,
  },
  summaryCard: {
    backgroundColor: "#F8FCFB",
  },
  summaryHeader: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  summaryIcon: {
    fontSize: 27,
  },
  summarySmall: {
    color: COLORS.teal,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  summaryTitle: {
    color: COLORS.navy,
    fontWeight: "900",
    marginTop: 2,
  },
  summaryText: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 3,
  },
  infoCard: {
    backgroundColor: "#D8F0E8",
  },
  infoTitle: {
    color: COLORS.navy,
    fontSize: 18,
    fontWeight: "900",
  },
  infoText: {
    color: "#345950",
    lineHeight: 19,
    marginTop: 5,
    marginBottom: 8,
  },
  infoLine: {
    color: "#256A5A",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
  },
  reservationTitle: {
    color: COLORS.navy,
    fontWeight: "900",
    fontSize: 17,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(12,30,45,0.38)",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: {
    color: COLORS.navy,
    fontSize: 21,
    fontWeight: "900",
  },
  modalText: {
    color: COLORS.muted,
    marginTop: 4,
    marginBottom: 10,
  },
});
