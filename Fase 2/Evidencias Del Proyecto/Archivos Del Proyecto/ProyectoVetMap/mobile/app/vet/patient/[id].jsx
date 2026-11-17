import {
  useEffect,
  useState,
} from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import {
  Button,
  Card,
  ChoiceRow,
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
import { useAuth } from "../../../context/AuthContext";

import {
  createClinicConsultation,
  createClinicMedication,
  createClinicPrescription,
  createClinicVaccine,
  deleteClinicConsultation,
  deleteClinicMedication,
  deleteClinicPrescription,
  deleteClinicVaccine,
  getClinicCatalog,
  getClinicPatientHistory,
  getClinicPrescriptions,
} from "../../../services/api";

import {
  formatDate,
  todayISO,
} from "../../../utils/format";

import {
  addDaysISO,
  CONSULTATION_REASON_PRESETS,
  DOSE_PRESETS,
  DURATION_PRESETS,
  FREQUENCY_PRESETS,
  INSTRUCTION_PRESETS,
  MEDICATION_DURATION_DAYS,
  uniqueOptions,
  VACCINE_INTERVAL_PRESETS,
  vaccinePresetsForSpecies,
} from "../../../utils/presets";

const EMPTY_FORM = {
  consultation_date: todayISO(),
  reason: "Control general",
  diagnosis: "",
  treatment: "",
  veterinarian: "",
  observation: "",

  name: "",
  dose: "",
  frequency: "",
  start_date: todayISO(),
  end_date: "",
  reminder_times: "08:00,20:00",

  application_date: todayISO(),
  next_dose_date: "",

  medication: "",
  dosage: "",
  duration: "",
  instructions: "",
  issue_date: todayISO(),
};

const EMPTY_CATALOG = {
  consultation_reason: [],
  vaccine: [],
  medication: [],
  dose: [],
  frequency: [],
  duration: [],
  instructions: [],
};

export default function PatientDetail() {
  const { id, appointment_id } = useLocalSearchParams();
  const petId = Number(id);
  const appointmentId = appointment_id ? Number(appointment_id) : null;
  const { token } = useAuth();

  const [data, setData] = useState(null);
  const [prescriptions, setPrescriptions] =
    useState([]);
  const [type, setType] =
    useState("consultation");
  const [form, setForm] =
    useState(EMPTY_FORM);
  const [catalog, setCatalog] =
    useState(EMPTY_CATALOG);

  const [vaccineInterval, setVaccineInterval] =
    useState("");
  const [medicationDuration, setMedicationDuration] =
    useState("");

  const [loading, setLoading] =
    useState(true);
  const [catalogLoading, setCatalogLoading] =
    useState(false);
  const [error, setError] =
    useState("");
  const [ok, setOk] = useState("");

  const set = (key, value) =>
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

  const pet =
    data?.pet ||
    data?.patient ||
    data;

  const consultations =
    data?.consultations || [];
  const vaccines =
    data?.vaccines || [];
  const meds =
    data?.medications || [];

  async function load() {
    setLoading(true);

    try {
      const [history, prescriptionRows] =
        await Promise.all([
          getClinicPatientHistory(
            token,
            petId
          ),
          getClinicPrescriptions(token),
        ]);

      setData(history);
      setPrescriptions(
        (prescriptionRows || []).filter(
          (item) =>
            Number(item.pet_id) ===
            Number(petId)
        )
      );
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadCatalog(nextType = type) {
    if (!pet?.species) return;

    const categoriesByType = {
      consultation: [
        "consultation_reason",
      ],
      vaccine: ["vaccine"],
      medication: [
        "medication",
        "dose",
        "frequency",
      ],
      prescription: [
        "medication",
        "dose",
        "frequency",
        "duration",
        "instructions",
      ],
    };

    const categories =
      categoriesByType[nextType] || [];

    setCatalogLoading(true);

    try {
      const rows =
        await Promise.all(
          categories.map(
            async (category) => [
              category,
              await getClinicCatalog(
                token,
                category,
                pet.species || ""
              ),
            ]
          )
        );

      setCatalog((current) => ({
        ...current,
        ...Object.fromEntries(rows),
      }));
    } catch (e) {
      setError(e.message);
    } finally {
      setCatalogLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [petId]);

  useEffect(() => {
    if (pet?.species) {
      loadCatalog(type);
    }
  }, [pet?.species, type]);

  function resetCurrentType() {
    setForm((current) => ({
      ...EMPTY_FORM,
      veterinarian:
        current.veterinarian || "",
    }));
    setVaccineInterval("");
    setMedicationDuration("");
  }

  function selectType(nextType) {
    setType(nextType);
    resetCurrentType();
  }

  function applyVaccineInterval(value) {
    setVaccineInterval(value);

    if (!value || value === "manual") {
      return;
    }

    set(
      "next_dose_date",
      addDaysISO(
        form.application_date ||
          todayISO(),
        value
      )
    );
  }

  function applyMedicationDuration(value) {
    setMedicationDuration(value);

    if (!value || value === "manual") {
      return;
    }

    set(
      "end_date",
      addDaysISO(
        form.start_date ||
          todayISO(),
        value
      )
    );
  }

  async function save() {
    setError("");
    setOk("");

    try {
      if (type === "consultation") {
        if (!form.reason.trim()) {
          throw new Error(
            "Selecciona o escribe un motivo de consulta."
          );
        }

        await createClinicConsultation(
          token,
          petId,
          {
            appointment_id: appointmentId,
            consultation_date:
              form.consultation_date ||
              todayISO(),
            reason: form.reason.trim(),
            diagnosis:
              form.diagnosis || null,
            treatment:
              form.treatment || null,
            veterinarian:
              form.veterinarian ||
              null,
            observation:
              form.observation || null,
          }
        );
      }

      if (type === "vaccine") {
        if (!form.name.trim()) {
          throw new Error(
            "Selecciona o escribe una vacuna."
          );
        }

        await createClinicVaccine(
          token,
          petId,
          {
            appointment_id: appointmentId,
            name: form.name.trim(),
            application_date:
              form.application_date ||
              todayISO(),
            next_dose_date:
              form.next_dose_date ||
              null,
            observation:
              form.observation || null,
          }
        );
      }

      if (type === "medication") {
        if (!form.name.trim()) {
          throw new Error(
            "Selecciona o escribe un medicamento."
          );
        }

        await createClinicMedication(
          token,
          petId,
          {
            appointment_id: appointmentId,
            name: form.name.trim(),
            dose: form.dose || null,
            frequency:
              form.frequency || null,
            start_date:
              form.start_date ||
              todayISO(),
            end_date:
              form.end_date || null,
            reminder_times:
              form.reminder_times ||
              null,
            observation:
              form.observation || null,
          }
        );
      }

      if (type === "prescription") {
        if (!form.medication.trim()) {
          throw new Error(
            "Selecciona o escribe un medicamento para la receta."
          );
        }

        await createClinicPrescription(
          token,
          {
            pet_id: petId,
            appointment_id: appointmentId,
            issue_date:
              form.issue_date ||
              todayISO(),
            medication:
              form.medication.trim(),
            dosage:
              form.dosage || null,
            frequency:
              form.frequency || null,
            duration:
              form.duration || null,
            instructions:
              form.instructions ||
              null,
          }
        );
      }

      setOk(
        "Registro clínico guardado correctamente."
      );

      resetCurrentType();
      await load();
      await loadCatalog(type);
    } catch (e) {
      setError(e.message);
    }
  }

  if (loading) {
    return (
      <Screen
        title="Ficha clínica"
        back
        backTo="/vet/patients"
      >
        <Loading />
      </Screen>
    );
  }

  const reasonOptions =
    uniqueOptions(
      catalog.consultation_reason,
      CONSULTATION_REASON_PRESETS
    );

  const vaccineOptions =
    uniqueOptions(
      catalog.vaccine,
      vaccinePresetsForSpecies(
        pet?.species
      )
    );

  const medicationOptions =
    uniqueOptions(catalog.medication);

  const doseOptions =
    uniqueOptions(
      catalog.dose,
      DOSE_PRESETS
    );

  const frequencyOptions =
    uniqueOptions(
      catalog.frequency,
      FREQUENCY_PRESETS
    );

  const durationOptions =
    uniqueOptions(
      catalog.duration,
      DURATION_PRESETS
    );

  const instructionOptions =
    uniqueOptions(
      catalog.instructions,
      INSTRUCTION_PRESETS
    );

  return (
    <Screen
      title={pet?.name || "Paciente"}
      subtitle={`${pet?.species || ""}${
        pet?.breed
          ? ` · ${pet.breed}`
          : ""
      }`}
      back
      backTo="/vet/patients"
      onRefresh={load}
    >
      <ErrorBox message={error} />
      <SuccessBox message={ok} />

      <Card>
        <View style={styles.patientHero}>
          {pet?.photo_data ? (
            <Image
              source={{ uri: pet.photo_data }}
              style={styles.patientPhoto}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.patientEmojiBox}>
              <Text style={styles.patientEmoji}>🐾</Text>
            </View>
          )}

          <View style={{ flex: 1 }}>
            <Text style={styles.patientHeroName}>{pet?.name || "Paciente"}</Text>
            <Text style={styles.patientHeroMeta}>
              {pet?.species || ""}{pet?.breed ? ` · ${pet.breed}` : ""}
            </Text>
          </View>
        </View>

        {appointmentId ? (
          <View style={styles.linkedAppointment}>
            <Text style={styles.linkedAppointmentTitle}>📅 Atención vinculada</Text>
            <Text style={styles.linkedAppointmentText}>
              Los nuevos registros clínicos quedarán asociados a la reserva #{appointmentId}.
            </Text>
          </View>
        ) : null}

        <Row label="Dueño" value={pet?.owner_name || data?.owner?.name || "-"} />
        <Row label="Correo dueño" value={pet?.owner_email || data?.owner?.email || "-"} />
        <Row label="Peso" value={pet?.weight ? `${pet.weight} kg` : "-"} />
        <Row label="Antecedentes" value={pet?.medical_background || "Sin antecedentes registrados"} />
        <Row label="Alimentación" value={pet?.feeding_info || "Sin información registrada"} />
        <Row label="Información adicional" value={pet?.additional_info || "Sin información adicional"} />
      </Card>

      <SectionTitle>
        Gestionar atención
      </SectionTitle>

      <Card>
        <ChoiceRow
          label="Tipo"
          options={[
            {
              value: "consultation",
              label: "Consulta",
            },
            {
              value: "vaccine",
              label: "Vacuna",
            },
            {
              value: "medication",
              label: "Medicamento",
            },
            {
              value: "prescription",
              label: "Receta",
            },
          ]}
          value={type}
          onChange={selectType}
        />

        {catalogLoading ? (
          <Text
            style={{
              color: "#72847F",
              marginBottom: 10,
            }}
          >
            Cargando opciones guardadas...
          </Text>
        ) : null}

        {type === "consultation" ? (
          <>
            <Input
              label="Fecha"
              value={
                form.consultation_date
              }
              onChangeText={(value) =>
                set(
                  "consultation_date",
                  value
                )
              }
            />

            <PresetField
              label="Motivo"
              options={reasonOptions}
              value={form.reason}
              onChange={(value) =>
                set("reason", value)
              }
              placeholder="Ej.: Control dermatológico"
            />

            <Input
              label="Diagnóstico"
              multiline
              value={form.diagnosis}
              onChangeText={(value) =>
                set("diagnosis", value)
              }
            />

            <Input
              label="Tratamiento"
              multiline
              value={form.treatment}
              onChangeText={(value) =>
                set("treatment", value)
              }
            />

            <Input
              label="Profesional"
              value={
                form.veterinarian
              }
              onChangeText={(value) =>
                set(
                  "veterinarian",
                  value
                )
              }
            />

            <Input
              label="Observación"
              multiline
              value={
                form.observation
              }
              onChangeText={(value) =>
                set(
                  "observation",
                  value
                )
              }
            />
          </>
        ) : null}

        {type === "vaccine" ? (
          <>
            <PresetField
              label="Vacuna"
              options={vaccineOptions}
              value={form.name}
              onChange={(value) =>
                set("name", value)
              }
              placeholder="Escribe una nueva vacuna"
            />

            <Input
              label="Aplicación"
              value={
                form.application_date
              }
              onChangeText={(value) => {
                set(
                  "application_date",
                  value
                );

                if (
                  vaccineInterval &&
                  vaccineInterval !==
                    "manual"
                ) {
                  set(
                    "next_dose_date",
                    addDaysISO(
                      value,
                      vaccineInterval
                    )
                  );
                }
              }}
            />

            <ChoiceRow
              label="Intervalo próxima dosis"
              options={
                VACCINE_INTERVAL_PRESETS
              }
              value={vaccineInterval}
              onChange={
                applyVaccineInterval
              }
            />

            <Input
              label="Fecha próxima dosis"
              value={
                form.next_dose_date
              }
              onChangeText={(value) => {
                setVaccineInterval(
                  "manual"
                );
                set(
                  "next_dose_date",
                  value
                );
              }}
            />

            <Input
              label="Observación"
              multiline
              value={
                form.observation
              }
              onChangeText={(value) =>
                set(
                  "observation",
                  value
                )
              }
            />
          </>
        ) : null}

        {type === "medication" ? (
          <>
            <PresetField
              label="Medicamento"
              options={
                medicationOptions
              }
              value={form.name}
              onChange={(value) =>
                set("name", value)
              }
              placeholder="Escribe un medicamento nuevo"
            />

            <PresetField
              label="Dosis"
              options={doseOptions}
              value={form.dose}
              onChange={(value) =>
                set("dose", value)
              }
              placeholder="Ej.: 3 mL"
            />

            <PresetField
              label="Frecuencia"
              options={
                frequencyOptions
              }
              value={form.frequency}
              onChange={(value) =>
                set(
                  "frequency",
                  value
                )
              }
              placeholder="Ej.: Cada 6 horas"
            />

            <Input
              label="Inicio"
              value={
                form.start_date
              }
              onChangeText={(value) => {
                set(
                  "start_date",
                  value
                );

                if (
                  medicationDuration &&
                  medicationDuration !==
                    "manual"
                ) {
                  set(
                    "end_date",
                    addDaysISO(
                      value,
                      medicationDuration
                    )
                  );
                }
              }}
            />

            <ChoiceRow
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
            />

            <Input
              label="Término"
              value={form.end_date}
              onChangeText={(value) => {
                setMedicationDuration(
                  "manual"
                );
                set("end_date", value);
              }}
            />

            <Input
              label="Horarios de aviso"
              value={
                form.reminder_times
              }
              onChangeText={(value) =>
                set(
                  "reminder_times",
                  value
                )
              }
              placeholder="08:00,20:00"
            />

            <Input
              label="Observación"
              multiline
              value={
                form.observation
              }
              onChangeText={(value) =>
                set(
                  "observation",
                  value
                )
              }
            />
          </>
        ) : null}

        {type === "prescription" ? (
          <>
            <Input
              label="Fecha de emisión"
              value={form.issue_date}
              onChangeText={(value) =>
                set(
                  "issue_date",
                  value
                )
              }
            />

            <PresetField
              label="Medicamento"
              options={
                medicationOptions
              }
              value={
                form.medication
              }
              onChange={(value) =>
                set(
                  "medication",
                  value
                )
              }
              placeholder="Escribe un medicamento"
            />

            <PresetField
              label="Dosis"
              options={doseOptions}
              value={form.dosage}
              onChange={(value) =>
                set("dosage", value)
              }
            />

            <PresetField
              label="Frecuencia"
              options={
                frequencyOptions
              }
              value={form.frequency}
              onChange={(value) =>
                set(
                  "frequency",
                  value
                )
              }
            />

            <PresetField
              label="Duración"
              options={
                durationOptions
              }
              value={form.duration}
              onChange={(value) =>
                set(
                  "duration",
                  value
                )
              }
            />

            <PresetField
              label="Indicaciones"
              options={
                instructionOptions
              }
              value={
                form.instructions
              }
              onChange={(value) =>
                set(
                  "instructions",
                  value
                )
              }
              customLabel="Otra indicación"
              multiline
            />
          </>
        ) : null}

        <Button
          label="Guardar registro"
          onPress={save}
        />
      </Card>

      <SectionTitle>
        Consultas
      </SectionTitle>

      {consultations.length === 0 ? (
        <Empty
          icon="🩺"
          title="Sin consultas"
        />
      ) : (
        consultations.map((item) => (
          <Card key={item.id}>
            <Text
              style={{
                fontWeight: "900",
                color: "#162850",
              }}
            >
              {item.reason}
            </Text>
            <Row
              label="Fecha"
              value={formatDate(
                item.consultation_date
              )}
            />
            <Row
              label="Diagnóstico"
              value={item.diagnosis}
            />
            <Row
              label="Tratamiento"
              value={item.treatment}
            />
            <Button
              label="Eliminar"
              compact
              variant="danger"
              onPress={async () => {
                await deleteClinicConsultation(
                  token,
                  item.id
                );
                await load();
              }}
            />
          </Card>
        ))
      )}

      <SectionTitle>Vacunas</SectionTitle>

      {vaccines.length === 0 ? (
        <Empty
          icon="💉"
          title="Sin vacunas"
        />
      ) : (
        vaccines.map((item) => (
          <Card key={item.id}>
            <Text
              style={{
                fontWeight: "900",
                color: "#162850",
              }}
            >
              {item.name}
            </Text>
            <Row
              label="Aplicación"
              value={formatDate(
                item.application_date
              )}
            />
            <Row
              label="Próxima"
              value={formatDate(
                item.next_dose_date
              )}
            />
            <Button
              label="Eliminar"
              compact
              variant="danger"
              onPress={async () => {
                await deleteClinicVaccine(
                  token,
                  item.id
                );
                await load();
              }}
            />
          </Card>
        ))
      )}

      <SectionTitle>
        Medicamentos
      </SectionTitle>

      {meds.length === 0 ? (
        <Empty
          icon="💊"
          title="Sin medicamentos"
        />
      ) : (
        meds.map((item) => (
          <Card key={item.id}>
            <Text
              style={{
                fontWeight: "900",
                color: "#162850",
              }}
            >
              {item.name}
            </Text>
            <Row
              label="Dosis"
              value={item.dose}
            />
            <Row
              label="Frecuencia"
              value={
                item.frequency
              }
            />
            <Button
              label="Eliminar"
              compact
              variant="danger"
              onPress={async () => {
                await deleteClinicMedication(
                  token,
                  item.id
                );
                await load();
              }}
            />
          </Card>
        ))
      )}

      <SectionTitle>Recetas</SectionTitle>

      {prescriptions.length === 0 ? (
        <Empty
          icon="📄"
          title="Sin recetas"
        />
      ) : (
        prescriptions.map((item) => (
          <Card key={item.id}>
            <Text
              style={{
                fontWeight: "900",
                color: "#162850",
              }}
            >
              {item.medication}
            </Text>
            <Row
              label="Fecha"
              value={formatDate(
                item.issue_date
              )}
            />
            <Row
              label="Dosis"
              value={item.dosage}
            />
            <Row
              label="Frecuencia"
              value={
                item.frequency
              }
            />
            <Row
              label="Duración"
              value={item.duration}
            />
            <Button
              label="Eliminar"
              compact
              variant="danger"
              onPress={async () => {
                await deleteClinicPrescription(
                  token,
                  item.id
                );
                await load();
              }}
            />
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  patientHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 10,
  },
  patientPhoto: {
    width: 78,
    height: 78,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#D8E7E3",
  },
  patientEmojiBox: {
    width: 78,
    height: 78,
    borderRadius: 20,
    backgroundColor: "#E9F7F2",
    alignItems: "center",
    justifyContent: "center",
  },
  patientEmoji: {
    fontSize: 39,
  },
  patientHeroName: {
    color: "#162850",
    fontSize: 20,
    fontWeight: "900",
  },
  patientHeroMeta: {
    color: "#526A63",
    marginTop: 3,
  },
  linkedAppointment: {
    backgroundColor: "#F4FBF8",
    borderWidth: 1,
    borderColor: "#B9DDD2",
    borderRadius: 13,
    padding: 10,
    marginBottom: 10,
  },
  linkedAppointmentTitle: {
    color: "#162850",
    fontWeight: "900",
  },
  linkedAppointmentText: {
    color: "#526A63",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },
});
