import {
  useEffect,
  useState,
} from "react";
import { Text, View } from "react-native";

import {
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
import PresetField from "../../components/PresetField";
import { useAuth } from "../../context/AuthContext";
import {
  createClinicPrescriptionTemplate,
  deleteClinicPrescriptionTemplate,
  getClinicPrescriptionTemplates,
} from "../../services/api";
import {
  DOSE_PRESETS,
  DURATION_PRESETS,
  FREQUENCY_PRESETS,
  INSTRUCTION_PRESETS,
  MEDICATION_PRESETS,
} from "../../utils/presets";

const EMPTY = {
  name: "",
  medication: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
};

export default function Templates() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
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
      setItems(await getClinicPrescriptionTemplates(token));
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

  async function save() {
    setError("");
    setOk("");

    if (!form.medication.trim()) {
      setError("Ingresa un medicamento para guardar la plantilla.");
      return;
    }

    try {
      const result = await createClinicPrescriptionTemplate(token, {
        ...form,
        name: form.name.trim() || form.medication.trim(),
      });
      setOk(result?.message || "Plantilla guardada correctamente.");
      setForm(EMPTY);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function remove(template) {
    const templateId = template.db_id || template.id;

    if (!template.can_delete || !templateId) {
      setError("Las plantillas predeterminadas de VetMap no se pueden eliminar.");
      return;
    }

    try {
      await deleteClinicPrescriptionTemplate(token, templateId);
      setOk("Plantilla eliminada correctamente.");
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <Screen
      title="Plantillas de recetas"
      subtitle="Atajos reutilizables para emitir recetas más rápido"
      back
      backTo="/vet/prescriptions"
      onRefresh={load}
      refreshing={loading}
    >
      <ErrorBox message={error} />
      <SuccessBox message={ok} />

      <Card>
        <Text style={{ color: "#162850", fontWeight: "900", fontSize: 18, marginBottom: 8 }}>
          Guardar nueva plantilla
        </Text>

        <Input
          label="Nombre de plantilla"
          value={form.name}
          onChangeText={(value) => set("name", value)}
          placeholder="Opcional: usa el nombre del medicamento"
        />

        <PresetField
          label="Medicamento"
          options={MEDICATION_PRESETS}
          value={form.medication}
          onChange={(value) => set("medication", value)}
          customLabel="Otro medicamento"
        />

        <PresetField
          label="Dosis"
          options={DOSE_PRESETS}
          value={form.dosage}
          onChange={(value) => set("dosage", value)}
          customLabel="Otra dosis"
        />

        <PresetField
          label="Frecuencia"
          options={FREQUENCY_PRESETS}
          value={form.frequency}
          onChange={(value) => set("frequency", value)}
          customLabel="Otra frecuencia"
        />

        <PresetField
          label="Duración"
          options={DURATION_PRESETS}
          value={form.duration}
          onChange={(value) => set("duration", value)}
          customLabel="Otra duración"
        />

        <PresetField
          label="Indicaciones"
          options={INSTRUCTION_PRESETS}
          value={form.instructions}
          onChange={(value) => set("instructions", value)}
          customLabel="Otra indicación"
          multiline
        />

        <Button label="Guardar plantilla" onPress={save} />
      </Card>

      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <Empty icon="📋" title="Sin plantillas" />
      ) : (
        <>
          <Text style={{ color: "#6AA896", fontWeight: "900" }}>
            Plantillas VetMap + tus plantillas guardadas
          </Text>

          {items.map((template) => (
            <Card key={template.id}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ fontSize: 24 }}>
                  {template.is_default ? "⚡" : "💾"}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "900", color: "#162850", fontSize: 17 }}>
                    {template.name || template.medication}
                  </Text>
                  <Text style={{ color: "#526A63", fontSize: 10, marginTop: 2 }}>
                    {template.is_default ? "Plantilla VetMap" : "Mi plantilla"}
                  </Text>
                </View>
              </View>

              <Row label="Medicamento" value={template.medication} />
              <Row label="Dosis" value={template.dosage || "-"} />
              <Row label="Frecuencia" value={template.frequency || "-"} />
              <Row label="Duración" value={template.duration || "-"} />
              <Row label="Indicaciones" value={template.instructions || "-"} />

              {template.can_delete ? (
                <Button
                  label="🗑️ Eliminar plantilla"
                  compact
                  variant="danger"
                  onPress={() =>
                    confirm(
                      "Eliminar plantilla",
                      `¿Eliminar ${template.name}?`,
                      () => remove(template)
                    )
                  }
                />
              ) : null}
            </Card>
          ))}
        </>
      )}
    </Screen>
  );
}
