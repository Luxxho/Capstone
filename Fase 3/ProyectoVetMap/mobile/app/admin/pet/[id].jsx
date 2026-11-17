import {
  useEffect,
  useState,
} from "react";
import { Text } from "react-native";
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
  createAdminConsultation,
  createAdminMedication,
  createAdminPrescription,
  createAdminVaccine,
  deleteAdminConsultation,
  deleteAdminMedication,
  deleteAdminPrescription,
  deleteAdminVaccine,
  getAdminClinicalCatalog,
  getAdminConsultations,
  getAdminMedications,
  getAdminPets,
  getAdminPrescriptions,
  getAdminVaccines,
  getVeterinaryClinics,
  updateAdminConsultation,
  updateAdminMedication,
  updateAdminPrescription,
  updateAdminVaccine,
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

  veterinary_id: "",
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

export default function AdminPetDetail() {
  const { id } = useLocalSearchParams();
  const petId = Number(id);
  const { token } = useAuth();

  const [pet, setPet] = useState(null);
  const [vaccines, setVaccines] =
    useState([]);
  const [meds, setMeds] =
    useState([]);
  const [consults, setConsults] =
    useState([]);
  const [pres, setPres] =
    useState([]);
  const [clinics, setClinics] =
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
  const [editingRecord, setEditingRecord] =
    useState(null);

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

  async function load() {
    setLoading(true);

    try {
      const [
        pets,
        vaccineRows,
        medRows,
        consultRows,
        prescriptionRows,
        clinicRows,
      ] = await Promise.all([
        getAdminPets(token),
        getAdminVaccines(
          token,
          petId
        ),
        getAdminMedications(
          token,
          petId
        ),
        getAdminConsultations(
          token,
          petId
        ),
        getAdminPrescriptions(
          token,
          petId
        ),
        getVeterinaryClinics(),
      ]);

      setPet(
        pets.find(
          (item) =>
            Number(item.id) ===
            Number(petId)
        )
      );
      setVaccines(vaccineRows);
      setMeds(medRows);
      setConsults(consultRows);
      setPres(prescriptionRows);
      setClinics(clinicRows);
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
              await getAdminClinicalCatalog(
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
    setForm({
      ...EMPTY_FORM,
      consultation_date: todayISO(),
      application_date: todayISO(),
      start_date: todayISO(),
      issue_date: todayISO(),
    });
    setVaccineInterval("");
    setMedicationDuration("");
    setEditingRecord(null);
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

  function startEdit(kind, item) {
    setType(kind);
    setEditingRecord({
      type: kind,
      id: item.id,
    });
    setVaccineInterval("");
    setMedicationDuration("");

    if (kind === "consultation") {
      setForm({
        ...EMPTY_FORM,
        consultation_date:
          item.consultation_date ||
          todayISO(),
        reason:
          item.reason ||
          "Control general",
        diagnosis:
          item.diagnosis || "",
        treatment:
          item.treatment || "",
        veterinarian:
          item.veterinarian || "",
        observation:
          item.observation || "",
      });
      return;
    }

    if (kind === "vaccine") {
      setVaccineInterval("manual");
      setForm({
        ...EMPTY_FORM,
        name: item.name || "",
        application_date:
          item.application_date ||
          todayISO(),
        next_dose_date:
          item.next_dose_date || "",
        observation:
          item.observation || "",
      });
      return;
    }

    if (kind === "medication") {
      setMedicationDuration("manual");
      setForm({
        ...EMPTY_FORM,
        name: item.name || "",
        dose: item.dose || "",
        frequency:
          item.frequency || "",
        start_date:
          item.start_date ||
          todayISO(),
        end_date:
          item.end_date || "",
        reminder_times:
          item.reminder_times || "",
        observation:
          item.observation || "",
      });
      return;
    }

    if (kind === "prescription") {
      setForm({
        ...EMPTY_FORM,
        veterinary_id:
          item.veterinary_id
            ? String(
                item.veterinary_id
              )
            : "",
        medication:
          item.medication || "",
        dosage:
          item.dosage || "",
        frequency:
          item.frequency || "",
        duration:
          item.duration || "",
        instructions:
          item.instructions || "",
        issue_date:
          item.issue_date ||
          todayISO(),
      });
    }
  }

  async function save() {
    setError("");
    setOk("");

    try {
      if (type === "consultation") {
        if (!form.reason.trim()) {
          throw new Error(
            "Selecciona o escribe el motivo."
          );
        }

        const payload = {
          consultation_date:
            form.consultation_date ||
            todayISO(),
          reason: form.reason.trim(),
          diagnosis:
            form.diagnosis || null,
          treatment:
            form.treatment || null,
          veterinarian:
            form.veterinarian || null,
          observation:
            form.observation || null,
        };

        if (
          editingRecord?.type ===
          "consultation"
        ) {
          await updateAdminConsultation(
            token,
            editingRecord.id,
            payload
          );
        } else {
          await createAdminConsultation(
            token,
            petId,
            payload
          );
        }
      }

      if (type === "vaccine") {
        if (!form.name.trim()) {
          throw new Error(
            "Selecciona o escribe una vacuna."
          );
        }

        const payload = {
          name: form.name.trim(),
          application_date:
            form.application_date ||
            todayISO(),
          next_dose_date:
            form.next_dose_date ||
            null,
          observation:
            form.observation || null,
        };

        if (
          editingRecord?.type ===
          "vaccine"
        ) {
          await updateAdminVaccine(
            token,
            editingRecord.id,
            payload
          );
        } else {
          await createAdminVaccine(
            token,
            petId,
            payload
          );
        }
      }

      if (type === "medication") {
        if (!form.name.trim()) {
          throw new Error(
            "Selecciona o escribe un medicamento."
          );
        }

        const payload = {
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
        };

        if (
          editingRecord?.type ===
          "medication"
        ) {
          await updateAdminMedication(
            token,
            editingRecord.id,
            payload
          );
        } else {
          await createAdminMedication(
            token,
            petId,
            payload
          );
        }
      }

      if (type === "prescription") {
        if (
          !form.veterinary_id ||
          !form.medication.trim()
        ) {
          throw new Error(
            "Selecciona una veterinaria y un medicamento."
          );
        }

        const payload = {
          veterinary_id:
            Number(
              form.veterinary_id
            ),
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
        };

        if (
          editingRecord?.type ===
          "prescription"
        ) {
          await updateAdminPrescription(
            token,
            editingRecord.id,
            payload
          );
        } else {
          await createAdminPrescription(
            token,
            petId,
            payload
          );
        }
      }

      setOk(
        editingRecord
          ? "Registro actualizado correctamente."
          : "Registro guardado correctamente."
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
        title="Gestión clínica"
        back
        backTo="/admin/pets"
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
      title={
        pet?.name || "Mascota"
      }
      subtitle="Gestión clínica administrativa"
      back
      backTo="/admin/pets"
      onRefresh={load}
    >
      <ErrorBox message={error} />
      <SuccessBox message={ok} />

      <Card>
        <Row
          label="Especie"
          value={pet?.species}
        />
        <Row
          label="Raza"
          value={pet?.breed || "-"}
        />
        <Row
          label="Peso"
          value={
            pet?.weight
              ? `${pet.weight} kg`
              : "-"
          }
        />
      </Card>

      <SectionTitle>
        Agregar / editar registro
      </SectionTitle>

      <Card>
        {editingRecord ? (
          <Text
            style={{
              color: "#6AA896",
              fontWeight: "900",
              marginBottom: 8,
            }}
          >
            ✏️ Editando registro existente
          </Text>
        ) : null}
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
              label="Veterinario"
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
            />

            <PresetField
              label="Dosis"
              options={doseOptions}
              value={form.dose}
              onChange={(value) =>
                set("dose", value)
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
            <ChoiceRow
              label="Veterinaria"
              options={clinics.map(
                (clinic) => ({
                  value: clinic.id,
                  label: clinic.name,
                })
              )}
              value={
                form.veterinary_id
              }
              onChange={(value) =>
                set(
                  "veterinary_id",
                  value
                )
              }
            />

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
          label={
            editingRecord
              ? "Guardar cambios"
              : "Guardar"
          }
          onPress={save}
        />

        {editingRecord ? (
          <Button
            label="Cancelar edición"
            variant="ghost"
            onPress={resetCurrentType}
          />
        ) : null}
      </Card>

      <SectionTitle>
        Consultas
      </SectionTitle>

      {consults.length === 0 ? (
        <Empty
          icon="🩺"
          title="Sin consultas"
        />
      ) : (
        consults.map((item) => (
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
            <Button
              label="✏️ Editar"
              compact
              variant="ghost"
              onPress={() =>
                startEdit(
                  "consultation",
                  item
                )
              }
            />
            <Button
              label="Eliminar"
              compact
              variant="danger"
              onPress={async () => {
                await deleteAdminConsultation(
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
              label="Próxima dosis"
              value={formatDate(
                item.next_dose_date
              )}
            />
            <Button
              label="✏️ Editar"
              compact
              variant="ghost"
              onPress={() =>
                startEdit(
                  "vaccine",
                  item
                )
              }
            />
            <Button
              label="Eliminar"
              compact
              variant="danger"
              onPress={async () => {
                await deleteAdminVaccine(
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
              label="✏️ Editar"
              compact
              variant="ghost"
              onPress={() =>
                startEdit(
                  "medication",
                  item
                )
              }
            />
            <Button
              label="Eliminar"
              compact
              variant="danger"
              onPress={async () => {
                await deleteAdminMedication(
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

      {pres.length === 0 ? (
        <Empty
          icon="📄"
          title="Sin recetas"
        />
      ) : (
        pres.map((item) => (
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
              label="Clínica"
              value={
                item.clinic_name || "-"
              }
            />
            <Button
              label="✏️ Editar"
              compact
              variant="ghost"
              onPress={() =>
                startEdit(
                  "prescription",
                  item
                )
              }
            />
            <Button
              label="Eliminar"
              compact
              variant="danger"
              onPress={async () => {
                await deleteAdminPrescription(
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
