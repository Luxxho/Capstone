import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import {
  Badge,
  Button,
  Card,
  ChoiceRow,
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
} from "../../../components/ui";
import PresetField from "../../../components/PresetField";
import SelectField from "../../../components/SelectField";
import { ActionCelebration, AnimatedEmoji } from "../../../components/AnimatedEmoji";

import { useAuth } from "../../../context/AuthContext";

import {
  createConsultation,
  createMedication,
  createPetWeight,
  createVaccine,
  deleteMedication,
  deletePetWeight,
  deleteVaccine,
  getConsultations,
  getMedications,
  getPetMedicationSchedule,
  getReservations,
  getPets,
  getPetWeights,
  getVaccines,
  markMedicationAdministered,
  updateConsultation,
  updateMedication,
  updateVaccine,
} from "../../../services/api";

import {
  formatDate,
  todayISO,
} from "../../../utils/format";

import {
  addDaysISO,
  DOSE_PRESETS,
  FREQUENCY_PRESETS,
  MEDICATION_DURATION_DAYS,
  MEDICATION_PRESETS,
  OWNER_CONSULTATION_PRESETS,
  REMINDER_TIME_PRESETS,
  uniqueOptions,
  VACCINE_INTERVAL_PRESETS,
  vaccinePresetsForSpecies,
} from "../../../utils/presets";

import {
  getMedicationReminderPermissionStatus,
  requestMedicationReminderPermission,
  syncPetMedicationReminders,
} from "../../../utils/medicationReminders";

const EMPTY_VACCINE = {
  name: "",
  application_date: todayISO(),
  next_dose_date: "",
  observation: "",
};

const EMPTY_MED = {
  name: "",
  dose: "",
  frequency: "",
  start_date: todayISO(),
  end_date: "",
  reminder_times: "08:00,20:00",
  observation: "",
};

const EMPTY_CONSULT = {
  consultation_date: todayISO(),
  reason: "Control general",
  diagnosis: "",
  treatment: "",
  veterinarian: "",
  observation: "",
};

export default function PetDetail() {
  const { id } = useLocalSearchParams();
  const petId = Number(id);
  const { token } = useAuth();

  const [pet, setPet] = useState(null);
  const [weights, setWeights] =
    useState([]);
  const [vaccines, setVaccines] =
    useState([]);
  const [meds, setMeds] =
    useState([]);
  const [consults, setConsults] =
    useState([]);
  const [schedule, setSchedule] =
    useState([]);
  const [reservations, setReservations] =
    useState([]);

  const [weight, setWeight] =
    useState("");
  const [note, setNote] =
    useState("");

  const [clinicalType, setClinicalType] =
    useState("vaccine");

  const [vaccineForm, setVaccineForm] =
    useState(EMPTY_VACCINE);
  const [medForm, setMedForm] =
    useState(EMPTY_MED);
  const [consultForm, setConsultForm] =
    useState(EMPTY_CONSULT);

  const [vaccineInterval, setVaccineInterval] =
    useState("");
  const [medicationDuration, setMedicationDuration] =
    useState("");

  const [editingVaccine, setEditingVaccine] =
    useState(null);
  const [editingMed, setEditingMed] =
    useState(null);
  const [editingConsult, setEditingConsult] =
    useState(null);

  const [reminderPermission, setReminderPermission] =
    useState("unknown");
  const [reminderCount, setReminderCount] =
    useState(0);
  const [alarmCelebration, setAlarmCelebration] = useState(false);

  const [error, setError] =
    useState("");
  const [ok, setOk] =
    useState("");
  const [loading, setLoading] =
    useState(true);
  const [activeTab, setActiveTab] =
    useState("summary");

  const setVaccine = (key, value) =>
    setVaccineForm((current) => ({
      ...current,
      [key]: value,
    }));

  const setMed = (key, value) =>
    setMedForm((current) => ({
      ...current,
      [key]: value,
    }));

  const setConsult = (key, value) =>
    setConsultForm((current) => ({
      ...current,
      [key]: value,
    }));

  async function load() {
    setLoading(true);
    setError("");

    try {
      const [
        pets,
        weightRows,
        vaccineRows,
        medRows,
        consultationRows,
        scheduleRows,
        reservationRows,
      ] = await Promise.all([
        getPets(token),
        getPetWeights(token, petId),
        getVaccines(token, petId),
        getMedications(token, petId),
        getConsultations(token, petId),
        getPetMedicationSchedule(
          token,
          petId
        ).catch(() => []),
        getReservations(token).catch(() => []),
      ]);

      const currentPet =
        pets.find(
          (item) =>
            Number(item.id) ===
            Number(petId)
        ) || null;

      setPet(currentPet);
      setWeights(weightRows || []);
      setVaccines(vaccineRows || []);
      setMeds(medRows || []);
      setConsults(
        consultationRows || []
      );
      setSchedule(
        Array.isArray(scheduleRows)
          ? scheduleRows
          : scheduleRows?.items || []
      );
      setReservations(
        reservationRows || []
      );

      const permission =
        await getMedicationReminderPermissionStatus();

      setReminderPermission(permission);

      if (
        currentPet &&
        permission === "granted"
      ) {
        const count =
          await syncPetMedicationReminders(
            currentPet,
            medRows || []
          );

        setReminderCount(count);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [petId]);

  const upcomingReservations =
    useMemo(() => {
      const today = todayISO();

      return (reservations || [])
        .filter(
          (item) =>
            Number(item.pet_id) ===
              Number(petId) &&
            ![
              "cancelled",
              "completed",
            ].includes(item.status) &&
            String(
              item.appointment_date || ""
            ) >= today
        )
        .sort((a, b) =>
          `${a.appointment_date}T${String(
            a.appointment_time || ""
          )}`.localeCompare(
            `${b.appointment_date}T${String(
              b.appointment_time || ""
            )}`
          )
        )
        .slice(0, 3);
    }, [reservations, petId]);

  const nextVaccine = useMemo(() => {
    const today = todayISO();

    return (vaccines || [])
      .filter(
        (item) =>
          item.next_dose_date &&
          String(item.next_dose_date) >= today
      )
      .sort((a, b) =>
        String(a.next_dose_date).localeCompare(
          String(b.next_dose_date)
        )
      )[0] || null;
  }, [vaccines]);

  const vaccineOptions = useMemo(
    () =>
      uniqueOptions(
        vaccinePresetsForSpecies(
          pet?.species
        ),
        vaccines.map(
          (item) => item.name
        )
      ),
    [pet?.species, vaccines]
  );

  const medicationOptions = useMemo(
    () =>
      uniqueOptions(
        MEDICATION_PRESETS,
        meds.map(
          (item) => item.name
        )
      ),
    [meds]
  );

  const consultationOptions = useMemo(
    () =>
      uniqueOptions(
        OWNER_CONSULTATION_PRESETS,
        consults.map(
          (item) => item.reason
        )
      ),
    [consults]
  );

  async function activateReminders() {
    const result =
      await requestMedicationReminderPermission();

    setReminderPermission(
      result.status
    );

    if (!result.granted) {
      setError(result.message);
      return;
    }

    const count =
      await syncPetMedicationReminders(
        pet,
        meds
      );

    setReminderCount(count);
    setError("");
    setOk(
      count > 0
        ? `Alarmas activadas. Hay ${count} recordatorios programados para las próximas dosis.`
        : "Alarmas activadas. Agrega horarios a un medicamento para recibir avisos."
    );

    setAlarmCelebration(true);
    setTimeout(
      () =>
        setAlarmCelebration(false),
      1900
    );
  }

  async function addWeight() {
    if (!weight) {
      setError("Ingresa un peso.");
      return;
    }

    try {
      await createPetWeight(
        token,
        petId,
        {
          weight: Number(weight),
          record_date: todayISO(),
          note: note || null,
        }
      );

      setWeight("");
      setNote("");
      setOk("Peso registrado.");
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function markDose(item) {
    try {
      await markMedicationAdministered(
        token,
        item.medication_id ||
          item.id,
        {
          scheduled_date:
            item.scheduled_date ||
            todayISO(),
          scheduled_time:
            item.scheduled_time ||
            item.time,
        }
      );

      setOk(
        "Dosis marcada como administrada."
      );
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  function resetClinicalForms() {
    setVaccineForm({
      ...EMPTY_VACCINE,
      application_date:
        todayISO(),
    });

    setMedForm({
      ...EMPTY_MED,
      start_date: todayISO(),
    });

    setConsultForm({
      ...EMPTY_CONSULT,
      consultation_date:
        todayISO(),
    });

    setVaccineInterval("");
    setMedicationDuration("");

    setEditingVaccine(null);
    setEditingMed(null);
    setEditingConsult(null);
  }

  function changeClinicalType(next) {
    setClinicalType(next);
    resetClinicalForms();
  }

  function applyVaccineInterval(value) {
    setVaccineInterval(value);

    if (
      !value ||
      value === "manual"
    ) {
      return;
    }

    setVaccine(
      "next_dose_date",
      addDaysISO(
        vaccineForm.application_date ||
          todayISO(),
        value
      )
    );
  }

  function applyMedicationDuration(value) {
    setMedicationDuration(value);

    if (
      !value ||
      value === "manual"
    ) {
      return;
    }

    setMed(
      "end_date",
      addDaysISO(
        medForm.start_date ||
          todayISO(),
        value
      )
    );
  }

  async function saveVaccine() {
    if (!vaccineForm.name.trim()) {
      setError(
        "Selecciona o escribe el nombre de la vacuna."
      );
      return;
    }

    try {
      const data = {
        name:
          vaccineForm.name.trim(),
        application_date:
          vaccineForm.application_date ||
          null,
        next_dose_date:
          vaccineForm.next_dose_date ||
          null,
        observation:
          vaccineForm.observation ||
          null,
      };

      if (editingVaccine) {
        await updateVaccine(
          token,
          editingVaccine,
          data
        );
      } else {
        await createVaccine(
          token,
          petId,
          data
        );
      }

      setOk(
        editingVaccine
          ? "Vacuna actualizada correctamente."
          : "Vacuna agregada correctamente."
      );

      resetClinicalForms();
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function saveMedication() {
    if (!medForm.name.trim()) {
      setError(
        "Selecciona o escribe el nombre del medicamento."
      );
      return;
    }

    try {
      const data = {
        name: medForm.name.trim(),
        dose:
          medForm.dose || null,
        frequency:
          medForm.frequency || null,
        start_date:
          medForm.start_date || null,
        end_date:
          medForm.end_date || null,
        reminder_times:
          medForm.reminder_times ||
          null,
        observation:
          medForm.observation ||
          null,
      };

      if (editingMed) {
        await updateMedication(
          token,
          editingMed,
          data
        );
      } else {
        await createMedication(
          token,
          petId,
          data
        );
      }

      setOk(
        editingMed
          ? "Medicamento actualizado. Las alarmas se sincronizarán con los nuevos horarios."
          : "Medicamento agregado. Si las alarmas están activas, VetMap usará los horarios configurados."
      );

      resetClinicalForms();
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function saveConsultation() {
    if (!consultForm.reason.trim()) {
      setError(
        "Selecciona o escribe el motivo de la consulta."
      );
      return;
    }

    try {
      const data = {
        consultation_date:
          consultForm.consultation_date ||
          null,
        reason:
          consultForm.reason.trim(),
        diagnosis:
          consultForm.diagnosis ||
          null,
        treatment:
          consultForm.treatment ||
          null,
        veterinarian:
          consultForm.veterinarian ||
          null,
        observation:
          consultForm.observation ||
          null,
      };

      if (editingConsult) {
        await updateConsultation(
          token,
          editingConsult,
          data
        );
      } else {
        await createConsultation(
          token,
          petId,
          data
        );
      }

      setOk(
        editingConsult
          ? "Consulta actualizada correctamente."
          : "Consulta agregada correctamente."
      );

      resetClinicalForms();
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  if (loading) {
    return (
      <Screen
        title="Ficha de mascota"
        back
        backTo="/owner/pets"
      >
        <Loading />
      </Screen>
    );
  }

  return (
    <Screen
      title={pet?.name || "Mascota"}
      subtitle={`${pet?.species || ""}${
        pet?.breed
          ? ` · ${pet.breed}`
          : ""
      }`}
      back
      backTo="/owner/pets"
      onRefresh={load}
    >
      <ErrorBox message={error} />
      <SuccessBox message={ok} />

      <View style={styles.nativeHeroCard}>
        {pet?.photo_data ? (
          <Image
            source={{ uri: pet.photo_data }}
            style={styles.nativeHeroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.nativeHeroFallback}>
            <AnimatedEmoji emoji="🐾" size={82} motion="float" />
          </View>
        )}

        <View style={styles.nativeHeroBody}>
          <View style={styles.nativeHeroTitleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nativeHeroName}>{pet?.name || "Mascota"}</Text>
              <Text style={styles.nativeHeroMeta}>
                {pet?.breed || pet?.species || ""}
                {pet?.age != null ? ` · ${pet.age} año${Number(pet.age) === 1 ? "" : "s"}` : ""}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.heroEditButton}
              onPress={() =>
                router.push({
                  pathname:
                    "/owner/pet-edit/[id]",
                  params: {
                    id: String(petId),
                  },
                })
              }
            >
              <Text style={styles.heroEditText}>✏️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.nativeStatsGrid}>
            <View style={styles.nativeStatTile}>
              <Text style={styles.nativeStatIcon}>⚖️</Text>
              <View>
                <Text style={styles.nativeStatLabel}>Peso</Text>
                <Text style={styles.nativeStatValue}>{pet?.weight ? `${pet.weight} kg` : "Sin dato"}</Text>
              </View>
            </View>
            <View style={styles.nativeStatTile}>
              <Text style={styles.nativeStatIcon}>💉</Text>
              <View>
                <Text style={styles.nativeStatLabel}>Vacunas</Text>
                <Text style={styles.nativeStatValue}>{vaccines.length ? `${vaccines.length} registradas` : "Sin registro"}</Text>
              </View>
            </View>
            <View style={styles.nativeStatTile}>
              <Text style={styles.nativeStatIcon}>🩺</Text>
              <View>
                <Text style={styles.nativeStatLabel}>Consultas</Text>
                <Text style={styles.nativeStatValue}>{consults.length}</Text>
              </View>
            </View>
            <View style={styles.nativeStatTile}>
              <Text style={styles.nativeStatIcon}>💊</Text>
              <View>
                <Text style={styles.nativeStatLabel}>Medicamentos</Text>
                <Text style={styles.nativeStatValue}>{meds.length}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.nativeTabs}>
        {[
          ["summary", "Resumen"],
          ["clinical", "Clínica"],
          ["medications", "Medicamentos"],
          ["weight", "Peso"],
        ].map(([key, label]) => (
          <TouchableOpacity
            key={key}
            onPress={() => setActiveTab(key)}
            style={[styles.nativeTab, activeTab === key && styles.nativeTabActive]}
          >
            <Text style={[styles.nativeTabText, activeTab === key && styles.nativeTabTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "summary" ? (
        <>
          <Card style={styles.summaryInfoCard}>
            <Row label="Nacimiento" value={formatDate(pet?.birth_date)} />
            <Row label="Antecedentes" value={pet?.medical_background || "Sin registrar"} />
            <Row label="Alimentación" value={pet?.feeding_info || "Sin registrar"} />
            <Row label="Información adicional" value={pet?.additional_info || "Sin registrar"} />
          </Card>

          {nextVaccine ? (
            <View style={styles.nextVaccineCard}>
              <View style={styles.nextVaccineBell}>
                <Text style={styles.nextVaccineBellText}>🔔</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.nextVaccineEyebrow}>
                  Próxima vacuna
                </Text>
                <Text style={styles.nextVaccineName}>
                  {nextVaccine.name}
                </Text>
                <Text style={styles.nextVaccineDate}>
                  {formatDate(nextVaccine.next_dose_date)}
                </Text>
              </View>

              <Text style={styles.nextVaccineArrow}>›</Text>
            </View>
          ) : null}

      <SectionTitle>
        Próximas atenciones
      </SectionTitle>

      {upcomingReservations.length === 0 ? (
        <Card>
          <Text style={styles.upcomingEmpty}>
            No hay próximas horas registradas para {pet?.name || "esta mascota"}.
          </Text>

          <Button
            label="📅 Agendar una hora"
            onPress={() =>
              router.push({
                pathname: "/owner/reservations",
                params: {
                  pet_id: String(petId),
                },
              })
            }
          />
        </Card>
      ) : (
        <>
          {upcomingReservations.map(
            (reservation) => (
              <Card key={reservation.id}>
                <Text style={styles.itemTitle}>
                  📅 {reservation.veterinary_name}
                </Text>
                <Row
                  label="Servicio"
                  value={reservation.service}
                />
                <Row
                  label="Fecha"
                  value={formatDate(
                    reservation.appointment_date
                  )}
                />
                <Row
                  label="Hora"
                  value={String(
                    reservation.appointment_time || ""
                  ).slice(0, 5)}
                />
                <Badge
                  status={reservation.status}
                />
              </Card>
            )
          )}

          <Button
            label="Agendar otra hora"
            variant="secondary"
            onPress={() =>
              router.push({
                pathname: "/owner/reservations",
                params: {
                  pet_id: String(petId),
                },
              })
            }
          />
        </>
      )}

        </>
      ) : null}

      {activeTab === "weight" ? (
        <>
      <SectionTitle>
        Control de peso
      </SectionTitle>

      <Card>
        <Input
          label="Nuevo peso (kg)"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />
        <Input
          label="Nota"
          value={note}
          onChangeText={setNote}
        />
        <Button
          label="Registrar peso de hoy"
          onPress={addWeight}
        />
      </Card>

      {weights.map((row) => (
        <Card key={row.id}>
          <Row
            label={formatDate(
              row.record_date
            )}
            value={`${row.weight} kg`}
          />

          {row.note ? (
            <Text>{row.note}</Text>
          ) : null}

          <Button
            label="Eliminar registro"
            compact
            variant="danger"
            onPress={() =>
              confirm(
                "Eliminar peso",
                "¿Eliminar este registro de peso?",
                async () => {
                  try {
                    await deletePetWeight(
                      token,
                      row.id
                    );
                    await load();
                  } catch (e) {
                    setError(e.message);
                  }
                }
              )
            }
          />
        </Card>
      ))}

        </>
      ) : null}

      {activeTab === "medications" ? (
        <>
      <View style={styles.animatedSectionTitle}>
        <AnimatedEmoji
          emoji="🔔"
          size={22}
          motion="wiggle"
        />
        <Text style={styles.animatedSectionText}>
          Alarmas de medicamentos
        </Text>
      </View>

      <Card style={styles.reminderCard}>
        <Text style={styles.reminderTitle}>
          Recordatorios de dosis
        </Text>

        <Text style={styles.reminderText}>
          VetMap puede avisarte cuando llegue la hora de darle un medicamento a {pet?.name || "tu mascota"}.
        </Text>

        <Row
          label="Permiso"
          value={
            reminderPermission === "granted"
              ? "Activado"
              : reminderPermission === "denied"
              ? "Bloqueado"
              : reminderPermission === "unsupported"
              ? "No disponible"
              : "Pendiente"
          }
        />

        <Row
          label="Recordatorios programados"
          value={reminderCount}
        />

        <Button
          label={
            reminderPermission === "granted"
              ? "🔔 Actualizar alarmas"
              : "🔔 Activar alarmas"
          }
          onPress={activateReminders}
        />

        <Text style={styles.reminderNote}>
          En Android/iOS las alarmas locales pueden aparecer aunque VetMap esté en segundo plano. En navegador, los avisos requieren mantener VetMap abierto.
        </Text>
      </Card>

      <SectionTitle>
        Medicamentos de hoy
      </SectionTitle>

      {schedule.length === 0 ? (
        <Empty
          icon="💊"
          title="Sin dosis programadas"
        />
      ) : (
        schedule.map((item, index) => (
          <Card
            key={`${
              item.medication_id ||
              index
            }-${
              item.scheduled_time ||
              item.time
            }`}
          >
            <Text style={styles.itemTitle}>
              {item.medication_name ||
                item.name ||
                "Medicamento"}
            </Text>

            <Row
              label="Hora"
              value={
                item.scheduled_time ||
                item.time
              }
            />

            <Row
              label="Dosis"
              value={
                item.dose || "-"
              }
            />

            <Badge
              status={
                item.administered
                  ? "completed"
                  : item.status ||
                    "pending"
              }
            />

            {!item.administered &&
            item.status !==
              "administered" ? (
              <Button
                label="Marcar administrado"
                compact
                onPress={() =>
                  markDose(item)
                }
              />
            ) : null}
          </Card>
        ))
      )}

        </>
      ) : null}

      {activeTab === "clinical" ? (
        <>
      <SectionTitle>
        Agregar / editar registro
      </SectionTitle>

      <Card>
        <ChoiceRow
          label="Tipo de registro"
          options={[
            {
              value: "vaccine",
              label: "Vacuna",
            },
            {
              value: "medication",
              label: "Medicamento",
            },
            {
              value: "consultation",
              label: "Consulta",
            },
          ]}
          value={clinicalType}
          onChange={changeClinicalType}
        />

        {clinicalType === "vaccine" ? (
          <>
            <PresetField
              label="Vacuna"
              options={vaccineOptions}
              value={vaccineForm.name}
              onChange={(value) =>
                setVaccine(
                  "name",
                  value
                )
              }
              placeholder="Escribe una vacuna nueva"
              customLabel="+ Otra vacuna"
            />

            <Input
              label="Fecha de aplicación"
              value={
                vaccineForm.application_date
              }
              onChangeText={(value) => {
                setVaccine(
                  "application_date",
                  value
                );

                if (
                  vaccineInterval &&
                  vaccineInterval !==
                    "manual"
                ) {
                  setVaccine(
                    "next_dose_date",
                    addDaysISO(
                      value,
                      vaccineInterval
                    )
                  );
                }
              }}
            />

            <SelectField
              label="Intervalo próxima dosis"
              options={
                VACCINE_INTERVAL_PRESETS
              }
              value={vaccineInterval}
              onChange={
                applyVaccineInterval
              }
              placeholder="Selecciona intervalo"
            />

            <Input
              label="Próxima dosis"
              value={
                vaccineForm.next_dose_date
              }
              onChangeText={(value) => {
                setVaccineInterval(
                  "manual"
                );
                setVaccine(
                  "next_dose_date",
                  value
                );
              }}
              placeholder="AAAA-MM-DD"
            />

            <Input
              label="Observación"
              multiline
              value={
                vaccineForm.observation
              }
              onChangeText={(value) =>
                setVaccine(
                  "observation",
                  value
                )
              }
            />

            <Button
              label={
                editingVaccine
                  ? "Actualizar vacuna"
                  : "Guardar vacuna"
              }
              onPress={saveVaccine}
            />
          </>
        ) : null}

        {clinicalType === "medication" ? (
          <>
            <PresetField
              label="Medicamento"
              options={medicationOptions}
              value={medForm.name}
              onChange={(value) =>
                setMed(
                  "name",
                  value
                )
              }
              placeholder="Escribe un medicamento nuevo"
              customLabel="+ Otro medicamento"
            />

            <PresetField
              label="Dosis"
              options={DOSE_PRESETS}
              value={medForm.dose}
              onChange={(value) =>
                setMed(
                  "dose",
                  value
                )
              }
              placeholder="Ej.: 3 mL"
              customLabel="+ Otra dosis"
            />

            <PresetField
              label="Frecuencia"
              options={
                FREQUENCY_PRESETS
              }
              value={
                medForm.frequency
              }
              onChange={(value) =>
                setMed(
                  "frequency",
                  value
                )
              }
              placeholder="Ej.: Cada 6 horas"
              customLabel="+ Otra frecuencia"
            />

            <Input
              label="Inicio"
              value={
                medForm.start_date
              }
              onChangeText={(value) => {
                setMed(
                  "start_date",
                  value
                );

                if (
                  medicationDuration &&
                  medicationDuration !==
                    "manual"
                ) {
                  setMed(
                    "end_date",
                    addDaysISO(
                      value,
                      medicationDuration
                    )
                  );
                }
              }}
            />

            <SelectField
              label="Duración"
              options={
                MEDICATION_DURATION_DAYS
              }
              value={
                medicationDuration
              }
              onChange={
                applyMedicationDuration
              }
              placeholder="Selecciona duración"
            />

            <Input
              label="Término"
              value={medForm.end_date}
              onChangeText={(value) => {
                setMedicationDuration(
                  "manual"
                );
                setMed(
                  "end_date",
                  value
                );
              }}
              placeholder="AAAA-MM-DD"
            />

            <PresetField
              label="Horas de recordatorio"
              options={
                REMINDER_TIME_PRESETS
              }
              value={
                medForm.reminder_times
              }
              onChange={(value) =>
                setMed(
                  "reminder_times",
                  value
                )
              }
              placeholder="Ej.: 08:00,20:00"
              customLabel="+ Horario personalizado"
            />

            <View style={styles.alarmHint}>
              <Text style={styles.alarmHintTitle}>
                🔔 Estas horas generan las alarmas
              </Text>
              <Text style={styles.alarmHintText}>
                Si eliges 08:00,20:00, VetMap te avisará a las 08:00 y a las 20:00 mientras el tratamiento esté vigente.
              </Text>
            </View>

            <Input
              label="Observación"
              multiline
              value={
                medForm.observation
              }
              onChangeText={(value) =>
                setMed(
                  "observation",
                  value
                )
              }
            />

            <Button
              label={
                editingMed
                  ? "Actualizar medicamento"
                  : "Guardar medicamento"
              }
              onPress={saveMedication}
            />
          </>
        ) : null}

        {clinicalType === "consultation" ? (
          <>
            <Input
              label="Fecha"
              value={
                consultForm.consultation_date
              }
              onChangeText={(value) =>
                setConsult(
                  "consultation_date",
                  value
                )
              }
            />

            <PresetField
              label="Motivo"
              options={
                consultationOptions
              }
              value={
                consultForm.reason
              }
              onChange={(value) =>
                setConsult(
                  "reason",
                  value
                )
              }
              placeholder="Escribe otro motivo"
              customLabel="+ Otro motivo"
            />

            <Input
              label="Diagnóstico"
              multiline
              value={
                consultForm.diagnosis
              }
              onChangeText={(value) =>
                setConsult(
                  "diagnosis",
                  value
                )
              }
            />

            <Input
              label="Tratamiento"
              multiline
              value={
                consultForm.treatment
              }
              onChangeText={(value) =>
                setConsult(
                  "treatment",
                  value
                )
              }
            />

            <Input
              label="Veterinario"
              value={
                consultForm.veterinarian
              }
              onChangeText={(value) =>
                setConsult(
                  "veterinarian",
                  value
                )
              }
            />

            <Input
              label="Observación"
              multiline
              value={
                consultForm.observation
              }
              onChangeText={(value) =>
                setConsult(
                  "observation",
                  value
                )
              }
            />

            <Button
              label={
                editingConsult
                  ? "Actualizar consulta"
                  : "Guardar consulta"
              }
              onPress={saveConsultation}
            />
          </>
        ) : null}
      </Card>

      <SectionTitle>
        Vacunas
      </SectionTitle>

      {vaccines.length === 0 ? (
        <Empty
          icon="💉"
          title="Sin vacunas registradas"
        />
      ) : (
        vaccines.map((row) => (
          <Card key={row.id}>
            <Text style={styles.itemTitle}>
              {row.name}
            </Text>
            <Row
              label="Aplicación"
              value={formatDate(
                row.application_date
              )}
            />
            <Row
              label="Próxima dosis"
              value={formatDate(
                row.next_dose_date
              )}
            />
            <Row
              label="Observación"
              value={
                row.observation || "-"
              }
            />

            <Button
              label="Editar"
              compact
              variant="ghost"
              onPress={() => {
                setClinicalType(
                  "vaccine"
                );
                setEditingVaccine(
                  row.id
                );
                setVaccineInterval(
                  "manual"
                );
                setVaccineForm({
                  name:
                    row.name || "",
                  application_date:
                    row.application_date ||
                    "",
                  next_dose_date:
                    row.next_dose_date ||
                    "",
                  observation:
                    row.observation ||
                    "",
                });
              }}
            />

            <Button
              label="Eliminar"
              compact
              variant="danger"
              onPress={() =>
                confirm(
                  "Eliminar vacuna",
                  "¿Quieres eliminar esta vacuna?",
                  async () => {
                    try {
                      await deleteVaccine(
                        token,
                        row.id
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

        </>
      ) : null}

      {activeTab === "medications" ? (
        <>
      <SectionTitle>
        Medicamentos históricos
      </SectionTitle>

      {meds.length === 0 ? (
        <Empty
          icon="💊"
          title="Sin medicamentos"
        />
      ) : (
        meds.map((row) => (
          <Card key={row.id}>
            <Text style={styles.itemTitle}>
              {row.name}
            </Text>

            <Row
              label="Dosis"
              value={row.dose}
            />

            <Row
              label="Frecuencia"
              value={
                row.frequency
              }
            />

            <Row
              label="Inicio"
              value={formatDate(
                row.start_date
              )}
            />

            <Row
              label="Término"
              value={formatDate(
                row.end_date
              )}
            />

            <Row
              label="🔔 Alarmas"
              value={
                row.reminder_times ||
                "Sin horarios"
              }
            />

            <Button
              label="Editar"
              compact
              variant="ghost"
              onPress={() => {
                setActiveTab("clinical");
                setClinicalType(
                  "medication"
                );
                setEditingMed(row.id);
                setMedicationDuration(
                  "manual"
                );
                setMedForm({
                  name:
                    row.name || "",
                  dose:
                    row.dose || "",
                  frequency:
                    row.frequency ||
                    "",
                  start_date:
                    row.start_date ||
                    "",
                  end_date:
                    row.end_date ||
                    "",
                  reminder_times:
                    row.reminder_times ||
                    "",
                  observation:
                    row.observation ||
                    "",
                });
              }}
            />

            <Button
              label="Eliminar"
              compact
              variant="danger"
              onPress={() =>
                confirm(
                  "Eliminar medicamento",
                  "¿Quieres eliminar este medicamento?",
                  async () => {
                    try {
                      await deleteMedication(
                        token,
                        row.id
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

        </>
      ) : null}

      <ActionCelebration
        visible={alarmCelebration}
        type="alarm"
        title="¡Alarmas activadas!"
        text="VetMap te avisará en los horarios configurados para los medicamentos."
      />

      {activeTab === "clinical" ? (
        <>
      <SectionTitle>
        Consultas
      </SectionTitle>

      {consults.length === 0 ? (
        <Empty
          icon="🩺"
          title="Sin consultas registradas"
        />
      ) : (
        consults.map((row) => (
          <Card key={row.id}>
            <Text style={styles.itemTitle}>
              {row.reason}
            </Text>

            <Row
              label="Fecha"
              value={formatDate(
                row.consultation_date
              )}
            />

            <Row
              label="Diagnóstico"
              value={row.diagnosis}
            />

            <Row
              label="Tratamiento"
              value={row.treatment}
            />

            <Row
              label="Veterinario"
              value={
                row.veterinarian
              }
            />

            <Row
              label="Observación"
              value={
                row.observation ||
                "-"
              }
            />

            <Button
              label="Editar"
              compact
              variant="ghost"
              onPress={() => {
                setClinicalType(
                  "consultation"
                );
                setEditingConsult(
                  row.id
                );
                setConsultForm({
                  consultation_date:
                    row.consultation_date ||
                    "",
                  reason:
                    row.reason || "",
                  diagnosis:
                    row.diagnosis ||
                    "",
                  treatment:
                    row.treatment ||
                    "",
                  veterinarian:
                    row.veterinarian ||
                    "",
                  observation:
                    row.observation ||
                    "",
                });
              }}
            />
          </Card>
        ))
      )}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  nativeHeroCard: {
    borderRadius: 28,
    overflow: "visible",
    backgroundColor: "transparent",
    shadowColor: COLORS.navy,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    marginBottom: 4,
  },
  nativeHeroImage: {
    width: "100%",
    height: 285,
    borderRadius: 28,
    backgroundColor: COLORS.brandSoft,
  },
  nativeHeroFallback: {
    width: "100%",
    height: 260,
    borderRadius: 28,
    backgroundColor: "#CFF4F1",
    alignItems: "center",
    justifyContent: "center",
  },
  nativeHeroBody: {
    marginTop: -28,
    marginHorizontal: 10,
    padding: 16,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8ECE8",
    shadowColor: COLORS.navy,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  nativeHeroTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  nativeHeroName: {
    color: COLORS.navy,
    fontSize: 26,
    fontWeight: "900",
  },
  nativeHeroMeta: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 3,
  },
  heroEditButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.mint100,
    alignItems: "center",
    justifyContent: "center",
  },
  heroEditText: {
    fontSize: 18,
  },
  nativeStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  nativeStatTile: {
    width: "48.5%",
    minHeight: 70,
    borderRadius: 16,
    backgroundColor: COLORS.mint50,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nativeStatIcon: {
    fontSize: 21,
  },
  nativeStatLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "700",
  },
  nativeStatValue: {
    color: COLORS.navy,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 2,
  },
  nativeTabs: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  nativeTab: {
    flex: 1,
    minHeight: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  nativeTabActive: {
    backgroundColor: COLORS.brand,
  },
  nativeTabText: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "800",
  },
  nativeTabTextActive: {
    color: "white",
  },
  summaryInfoCard: {
    backgroundColor: "#FFFFFF",
  },
  nextVaccineCard: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 13,
    borderRadius: 19,
    backgroundColor: "#FFF5E7",
    borderWidth: 1,
    borderColor: "#F4D7AC",
  },
  nextVaccineBell: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE8C7",
  },
  nextVaccineBellText: {
    fontSize: 24,
  },
  nextVaccineEyebrow: {
    color: "#F08A29",
    fontSize: 10,
    fontWeight: "900",
  },
  nextVaccineName: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },
  nextVaccineDate: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
  },
  nextVaccineArrow: {
    color: "#F08A29",
    fontSize: 28,
    fontWeight: "700",
  },
  petHeroImage: {
    width: 126,
    height: 126,
    borderRadius: 28,
    alignSelf: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#D8E7E3",
  },
  upcomingEmpty: {
    color: "#526A63",
    lineHeight: 19,
    marginBottom: 8,
  },
  animatedSectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    marginBottom: 2,
  },
  animatedSectionText: {
    color: "#162850",
    fontSize: 18,
    fontWeight: "900",
  },
  reminderCard: {
    backgroundColor: "#F5FBF8",
  },
  reminderTitle: {
    color: "#162850",
    fontWeight: "900",
    fontSize: 17,
  },
  reminderText: {
    color: "#526A63",
    lineHeight: 19,
    marginTop: 5,
    marginBottom: 8,
  },
  reminderNote: {
    color: "#526A63",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },
  itemTitle: {
    fontWeight: "900",
    color: "#162850",
    fontSize: 16,
  },
  alarmHint: {
    backgroundColor: "#FFF8DF",
    borderWidth: 1,
    borderColor: "#EED59B",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  alarmHintTitle: {
    color: "#6D5200",
    fontWeight: "900",
    fontSize: 12,
  },
  alarmHintText: {
    color: "#7A631E",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
});
