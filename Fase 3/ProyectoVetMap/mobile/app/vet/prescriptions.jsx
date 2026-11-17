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
  Button,
  Card,
  ChoiceRow,
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
import PresetField from "../../components/PresetField";
import { AnimatedEmoji } from "../../components/AnimatedEmoji";
import { useAuth } from "../../context/AuthContext";

import {
  createClinicPrescription,
  createClinicPrescriptionTemplate,
  deleteClinicPrescription,
  deleteClinicPrescriptionTemplate,
  getClinicCatalog,
  getClinicPatients,
  getClinicPrescriptions,
  getClinicPrescriptionTemplates,
} from "../../services/api";

import {
  DOSE_PRESETS,
  DURATION_PRESETS,
  FREQUENCY_PRESETS,
  INSTRUCTION_PRESETS,
  MEDICATION_PRESETS,
  uniqueOptions,
} from "../../utils/presets";
import {
  formatDate,
  todayISO,
} from "../../utils/format";

const EMPTY = {
  pet_id: "",
  issue_date: todayISO(),
  medication: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
};

export default function Prescriptions() {
  const { token } = useAuth();

  const [patients, setPatients] = useState([]);
  const [items, setItems] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [catalog, setCatalog] = useState({
    medication: [],
    dose: [],
    frequency: [],
    duration: [],
    instructions: [],
  });

  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [saveAsTemplate, setSaveAsTemplate] = useState(true);
  const [templateName, setTemplateName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const set = (key, value) =>
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

  async function load() {
    setLoading(true);

    try {
      const [patientRows, prescriptionRows, templateRows] =
        await Promise.all([
          getClinicPatients(token),
          getClinicPrescriptions(token),
          getClinicPrescriptionTemplates(token),
        ]);

      setPatients(patientRows || []);
      setItems(prescriptionRows || []);
      setTemplates(templateRows || []);
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

  const selectedPatient = patients.find(
    (item) =>
      String(item.id) === String(form.pet_id)
  );

  useEffect(() => {
    async function loadCatalog() {
      if (!selectedPatient?.species) {
        setCatalog({
          medication: [],
          dose: [],
          frequency: [],
          duration: [],
          instructions: [],
        });
        return;
      }

      try {
        const categories = [
          "medication",
          "dose",
          "frequency",
          "duration",
          "instructions",
        ];

        const rows = await Promise.all(
          categories.map(async (category) => [
            category,
            await getClinicCatalog(
              token,
              category,
              selectedPatient.species
            ),
          ])
        );

        setCatalog(Object.fromEntries(rows));
      } catch (e) {
        setError(e.message);
      }
    }

    loadCatalog();
  }, [form.pet_id, selectedPatient?.species]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return items;

    return items.filter((item) =>
      [
        item.pet_name,
        item.medication,
        item.dosage,
        item.frequency,
        item.duration,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [items, query]);

  function applyTemplate(templateId) {
    setSelectedTemplate(templateId);

    if (!templateId) {
      return;
    }

    const template = templates.find(
      (item) =>
        String(item.id) === String(templateId)
    );

    if (!template) return;

    setForm((current) => ({
      ...current,
      medication: template.medication || "",
      dosage: template.dosage || "",
      frequency: template.frequency || "",
      duration: template.duration || "",
      instructions: template.instructions || "",
    }));

    setTemplateName(template.name || "");
  }

  function resetForm() {
    setForm(EMPTY);
    setSelectedTemplate("");
    setSaveAsTemplate(true);
    setTemplateName("");
  }

  async function save() {
    setError("");
    setOk("");

    if (!form.pet_id) {
      setError("Selecciona un paciente.");
      return;
    }

    if (!form.medication.trim()) {
      setError("Selecciona o escribe un medicamento.");
      return;
    }

    setSaving(true);

    try {
      await createClinicPrescription(token, {
        pet_id: Number(form.pet_id),
        issue_date: form.issue_date || todayISO(),
        medication: form.medication.trim(),
        dosage: form.dosage || null,
        frequency: form.frequency || null,
        duration: form.duration || null,
        instructions: form.instructions || null,
      });

      if (saveAsTemplate) {
        await createClinicPrescriptionTemplate(token, {
          name:
            templateName.trim() ||
            form.medication.trim(),
          medication: form.medication.trim(),
          dosage: form.dosage || null,
          frequency: form.frequency || null,
          duration: form.duration || null,
          instructions: form.instructions || null,
        });
      }

      setOk("Receta emitida correctamente.");
      resetForm();
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeTemplate(template) {
    const id = template.db_id || template.id;

    if (!template.can_delete || !id) {
      setError("Las plantillas predeterminadas de VetMap no se pueden eliminar.");
      return;
    }

    try {
      await deleteClinicPrescriptionTemplate(token, id);
      setOk("Plantilla eliminada correctamente.");
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  const medicationOptions = uniqueOptions(
    catalog.medication,
    MEDICATION_PRESETS
  );
  const doseOptions = uniqueOptions(
    catalog.dose,
    DOSE_PRESETS
  );
  const frequencyOptions = uniqueOptions(
    catalog.frequency,
    FREQUENCY_PRESETS
  );
  const durationOptions = uniqueOptions(
    catalog.duration,
    DURATION_PRESETS
  );
  const instructionOptions = uniqueOptions(
    catalog.instructions,
    INSTRUCTION_PRESETS
  );

  return (
    <Screen
      title="Recetas veterinarias"
      subtitle="Emite, busca y administra recetas de tus pacientes"
      back
      backTo="/vet"
      onRefresh={load}
      refreshing={loading}
    >
      <ErrorBox message={error} />
      <SuccessBox message={ok} />

      <Button
        label={showForm ? "Cerrar nueva receta" : "📄 Emitir nueva receta"}
        onPress={() => setShowForm((value) => !value)}
      />

      <Button
        label="📋 Administrar plantillas"
        variant="secondary"
        onPress={() => router.push("/vet/templates")}
      />

      {showForm ? (
        <Card>
          <View style={styles.formHead}>
            <AnimatedEmoji emoji="📄" size={35} motion="float" />
            <View style={{ flex: 1 }}>
              <Text style={styles.formTitle}>Nueva receta</Text>
              <Text style={styles.formText}>
                Usa una plantilla o completa la receta desde cero.
              </Text>
            </View>
          </View>

          <SelectField
            label="Paciente"
            searchable
            searchPlaceholder="Buscar paciente..."
            placeholder="Selecciona una mascota"
            options={patients.map((patient) => ({
              value: String(patient.id),
              label: `${patient.name} · ${patient.owner_name} · ${patient.species}`,
            }))}
            value={form.pet_id}
            onChange={(value) => {
              set("pet_id", value);
              setSelectedTemplate("");
            }}
          />

          <SelectField
            label="Receta rápida"
            searchable
            placeholder="✍️ Escribir desde cero"
            options={[
              { value: "", label: "✍️ Escribir desde cero" },
              ...templates.map((template) => ({
                value: String(template.id),
                label: `${template.is_default ? "VetMap" : "Mi plantilla"} · ${template.name} · ${template.medication}`,
              })),
            ]}
            value={selectedTemplate}
            onChange={applyTemplate}
          />

          <Input
            label="Fecha de emisión"
            value={form.issue_date}
            onChangeText={(value) => set("issue_date", value)}
            placeholder="AAAA-MM-DD"
          />

          <PresetField
            label="Medicamento"
            options={medicationOptions}
            value={form.medication}
            onChange={(value) => set("medication", value)}
            customLabel="Otro medicamento"
          />

          <PresetField
            label="Dosis"
            options={doseOptions}
            value={form.dosage}
            onChange={(value) => set("dosage", value)}
            customLabel="Otra dosis"
          />

          <PresetField
            label="Frecuencia"
            options={frequencyOptions}
            value={form.frequency}
            onChange={(value) => set("frequency", value)}
            customLabel="Otra frecuencia"
          />

          <PresetField
            label="Duración"
            options={durationOptions}
            value={form.duration}
            onChange={(value) => set("duration", value)}
            customLabel="Otra duración"
          />

          <PresetField
            label="Indicaciones"
            options={instructionOptions}
            value={form.instructions}
            onChange={(value) => set("instructions", value)}
            customLabel="Otra indicación"
            multiline
          />

          <ChoiceRow
            label="Guardar como plantilla reutilizable"
            options={[
              { value: true, label: "Sí" },
              { value: false, label: "No" },
            ]}
            value={saveAsTemplate}
            onChange={setSaveAsTemplate}
          />

          {saveAsTemplate ? (
            <Input
              label="Nombre de plantilla (opcional)"
              value={templateName}
              onChangeText={setTemplateName}
              placeholder="Ej.: Antibiótico postoperatorio"
            />
          ) : null}

          <Button
            label={saving ? "Emitiendo..." : "Emitir receta"}
            disabled={saving}
            onPress={save}
          />
        </Card>
      ) : null}

      <SectionTitle>Historial de recetas</SectionTitle>

      <Input
        label="Buscar receta"
        value={query}
        onChangeText={setQuery}
        placeholder="Paciente, medicamento, dosis o frecuencia..."
      />

      <Text style={styles.resultText}>
        {filtered.length} de {items.length} receta{items.length === 1 ? "" : "s"}
      </Text>

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <Empty icon="📄" title="Sin recetas" />
      ) : (
        filtered.map((item) => (
          <Card key={item.id}>
            <View style={styles.prescriptionHead}>
              <AnimatedEmoji emoji="📄" size={27} motion="float" />
              <View style={{ flex: 1 }}>
                <Text style={styles.patientName}>{item.pet_name}</Text>
                <Text style={styles.medication}>{item.medication}</Text>
              </View>
            </View>

            <Row label="Fecha" value={formatDate(item.issue_date)} />
            <Row label="Dosis" value={item.dosage || "-"} />
            <Row label="Frecuencia" value={item.frequency || "-"} />
            <Row label="Duración" value={item.duration || "-"} />
            <Row label="Indicaciones" value={item.instructions || "-"} />

            <Button
              label="Abrir paciente"
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: "/vet/patient/[id]",
                  params: { id: String(item.pet_id) },
                })
              }
            />

            <Button
              label="🗑️ Eliminar receta"
              compact
              variant="danger"
              onPress={() =>
                confirm(
                  "Eliminar receta",
                  "¿Quieres eliminar esta receta del historial?",
                  async () => {
                    try {
                      await deleteClinicPrescription(token, item.id);
                      setOk("Receta eliminada correctamente.");
                      await load();
                    } catch (e) {
                      setError(e.message);
                    }
                  }
                )
              }
            />
          </Card>
        ))
      )}

      {templates.some((item) => item.can_delete) ? (
        <>
          <SectionTitle>Mis plantillas guardadas</SectionTitle>
          {templates
            .filter((item) => item.can_delete)
            .slice(0, 4)
            .map((template) => (
              <Card key={template.id}>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateMeta}>{template.medication}</Text>
                <Button
                  label="Eliminar plantilla"
                  compact
                  variant="danger"
                  onPress={() =>
                    confirm(
                      "Eliminar plantilla",
                      `¿Eliminar ${template.name}?`,
                      () => removeTemplate(template)
                    )
                  }
                />
              </Card>
            ))}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  formHead: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 10 },
  formTitle: { color: "#162850", fontSize: 18, fontWeight: "900" },
  formText: { color: "#526A63", fontSize: 11, marginTop: 2 },
  resultText: { color: "#6AA896", fontWeight: "900", fontSize: 11 },
  prescriptionHead: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 8 },
  patientName: { color: "#162850", fontWeight: "900", fontSize: 17 },
  medication: { color: "#6AA896", fontWeight: "800", marginTop: 2 },
  templateName: { color: "#162850", fontWeight: "900", fontSize: 16 },
  templateMeta: { color: "#526A63", marginTop: 3, marginBottom: 6 },
});
