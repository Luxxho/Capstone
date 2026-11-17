import {
  useMemo,
  useState,
  useEffect,
} from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import {
  Badge,
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
} from "../../components/ui";
import SelectField from "../../components/SelectField";
import { AnimatedEmoji } from "../../components/AnimatedEmoji";
import { useAuth } from "../../context/AuthContext";
import { downloadAppointmentReport } from "../../services/downloads";
import {
  archiveClinicAppointment,
  archiveClinicFinalAppointments,
  getClinicAppointments,
  getClinicPatientHistory,
  updateClinicAppointmentStatus,
} from "../../services/api";
import { formatDate } from "../../utils/format";

const STATES = [
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmada" },
  { value: "completed", label: "Completada" },
  { value: "cancelled", label: "Cancelada" },
];

function petEmoji(species) {
  const value = String(species || "").toLowerCase();
  if (value.includes("perro")) return "🐶";
  if (value.includes("gato")) return "🐱";
  if (value.includes("conejo")) return "🐰";
  if (value.includes("pez")) return "🐟";
  if (value.includes("tortuga")) return "🐢";
  if (value.includes("ave") || value.includes("loro")) return "🐦";
  return "🐾";
}

export default function Agenda() {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);

    try {
      setItems(await getClinicAppointments(token));
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

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !text ||
        [
          item.pet_name,
          item.user_name,
          item.user_email,
          item.service,
          item.pet_species,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(text);

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [items, query, statusFilter]);

  async function changeStatus(id, nextStatus) {
    try {
      await updateClinicAppointmentStatus(token, id, nextStatus);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function toggleHistory(item) {
    if (expandedId === item.id) {
      setExpandedId(null);
      setHistory(null);
      return;
    }

    setExpandedId(item.id);
    setHistory(null);
    setHistoryLoading(true);

    try {
      setHistory(
        await getClinicPatientHistory(token, item.pet_id)
      );
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setHistoryLoading(false);
    }
  }

  function recent(list, count = 3) {
    return (list || []).slice(0, count);
  }

  return (
    <Screen
      title="Agenda veterinaria"
      subtitle="Gestiona las horas y revisa el contexto clínico antes de atender"
      back
      backTo="/vet"
      onRefresh={load}
      refreshing={loading}
    >
      <ErrorBox message={error} />

      <Input
        label="Buscar en agenda"
        value={query}
        onChangeText={setQuery}
        placeholder="Mascota, dueño, servicio o especie..."
      />

      <SelectField
        label="Filtrar por estado"
        value={statusFilter}
        onChange={setStatusFilter}
        options={[
          { value: "all", label: "Todas las reservas" },
          ...STATES,
        ]}
      />

      <View style={styles.summaryRow}>
        <View style={styles.summaryPill}>
          <Text style={styles.summaryValue}>{filtered.length}</Text>
          <Text style={styles.summaryLabel}>Visibles</Text>
        </View>
        <View style={styles.summaryPill}>
          <Text style={styles.summaryValue}>
            {items.filter((item) => item.status === "pending").length}
          </Text>
          <Text style={styles.summaryLabel}>Pendientes</Text>
        </View>
        <View style={styles.summaryPill}>
          <Text style={styles.summaryValue}>
            {items.filter((item) => item.status === "confirmed").length}
          </Text>
          <Text style={styles.summaryLabel}>Confirmadas</Text>
        </View>
      </View>

      <Button
        label="🧹 Limpiar finalizadas"
        variant="ghost"
        onPress={async () => {
          try {
            await archiveClinicFinalAppointments(token);
            await load();
          } catch (e) {
            setError(e.message);
          }
        }}
      />

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <Empty
          icon="📅"
          title="No hay reservas para mostrar"
          text="Prueba cambiando la búsqueda o el filtro."
        />
      ) : (
        filtered.map((item) => (
          <Card key={item.id}>
            <View style={styles.appointmentTop}>
              <AnimatedEmoji
                emoji={petEmoji(item.pet_species)}
                size={34}
                motion="float"
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.petName}>{item.pet_name}</Text>
                <Text style={styles.ownerName}>Dueño: {item.user_name}</Text>
              </View>

              <Badge status={item.status} />
            </View>

            <Row label="Servicio" value={item.service} />
            <Row
              label="Fecha"
              value={`${formatDate(item.appointment_date)} · ${String(item.appointment_time || "").slice(0, 5)}`}
            />
            <Row label="Correo" value={item.user_email || "-"} />
            {item.notes ? <Row label="Notas" value={item.notes} /> : null}

            <Button
              label={expandedId === item.id ? "Cerrar ficha rápida" : "📋 Ver ficha rápida"}
              variant="secondary"
              onPress={() => toggleHistory(item)}
            />

            {expandedId === item.id ? (
              <View style={styles.inlineHistory}>
                {historyLoading ? (
                  <Loading label="Cargando ficha clínica..." />
                ) : history ? (
                  <>
                    <View style={styles.historyHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyTitle}>Resumen clínico</Text>
                        <Text style={styles.historySubtitle}>
                          Información útil antes de la atención
                        </Text>
                      </View>
                      <AnimatedEmoji emoji="🩺" size={29} motion="float" />
                    </View>

                    <Row
                      label="Antecedentes"
                      value={history.pet?.medical_background || "Sin antecedentes registrados"}
                    />
                    <Row
                      label="Alimentación"
                      value={history.pet?.feeding_info || "Sin información registrada"}
                    />
                    <Row
                      label="Observaciones"
                      value={history.pet?.additional_info || "Sin observaciones adicionales"}
                    />

                    <SectionTitle>Últimas consultas</SectionTitle>
                    {recent(history.consultations).length ? (
                      recent(history.consultations).map((record) => (
                        <View key={`consultation-${record.id}`} style={styles.miniRecord}>
                          <Text style={styles.miniRecordTitle}>🩺 {record.reason}</Text>
                          <Text style={styles.miniRecordText}>
                            {formatDate(record.consultation_date)}
                            {record.diagnosis ? ` · ${record.diagnosis}` : ""}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noRecord}>Sin consultas registradas.</Text>
                    )}

                    <SectionTitle>Medicamentos recientes</SectionTitle>
                    {recent(history.medications).length ? (
                      recent(history.medications).map((record) => (
                        <View key={`med-${record.id}`} style={styles.miniRecord}>
                          <Text style={styles.miniRecordTitle}>💊 {record.name}</Text>
                          <Text style={styles.miniRecordText}>
                            {[record.dose, record.frequency].filter(Boolean).join(" · ") || "Sin pauta registrada"}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noRecord}>Sin medicamentos registrados.</Text>
                    )}

                    <SectionTitle>Vacunas recientes</SectionTitle>
                    {recent(history.vaccines).length ? (
                      recent(history.vaccines).map((record) => (
                        <View key={`vaccine-${record.id}`} style={styles.miniRecord}>
                          <Text style={styles.miniRecordTitle}>💉 {record.name}</Text>
                          <Text style={styles.miniRecordText}>
                            {formatDate(record.application_date)}
                            {record.next_dose_date ? ` · Próxima: ${formatDate(record.next_dose_date)}` : ""}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noRecord}>Sin vacunas registradas.</Text>
                    )}

                    <SectionTitle>Recetas recientes</SectionTitle>
                    {recent(history.prescriptions).length ? (
                      recent(history.prescriptions).map((record) => (
                        <View key={`rx-${record.id}`} style={styles.miniRecord}>
                          <Text style={styles.miniRecordTitle}>📄 {record.medication}</Text>
                          <Text style={styles.miniRecordText}>
                            {[record.dosage, record.frequency, record.duration].filter(Boolean).join(" · ") || "Sin pauta registrada"}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noRecord}>Sin recetas registradas.</Text>
                    )}

                    <Button
                      label="Abrir ficha clínica completa"
                      onPress={() =>
                        router.push({
                          pathname: "/vet/patient/[id]",
                          params: {
                            id: String(item.pet_id),
                            appointment_id: String(item.id),
                          },
                        })
                      }
                    />
                  </>
                ) : (
                  <Text style={styles.noRecord}>No fue posible cargar la ficha.</Text>
                )}
              </View>
            ) : null}

            {!['completed', 'cancelled'].includes(item.status) ? (
              <ChoiceRow
                label="Cambiar estado"
                options={STATES}
                value={item.status}
                onChange={(next) => changeStatus(item.id, next)}
              />
            ) : (
              <Button
                label="Quitar del historial"
                compact
                variant="ghost"
                onPress={async () => {
                  try {
                    await archiveClinicAppointment(token, item.id);
                    await load();
                  } catch (e) {
                    setError(e.message);
                  }
                }}
              />
            )}
            <Button
              label="📄 Descargar informe PDF"
              compact
              variant="secondary"
              onPress={async () => {
                try {
                  await downloadAppointmentReport(token, item.id);
                } catch (e) {
                  setError(e.message);
                }
              }}
            />
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryPill: {
    flex: 1,
    minWidth: 88,
    borderRadius: 14,
    padding: 10,
    backgroundColor: '#E9F7F2',
    alignItems: 'center',
  },
  summaryValue: {
    color: '#162850',
    fontSize: 20,
    fontWeight: '900',
  },
  summaryLabel: {
    color: '#526A63',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  appointmentTop: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 7,
  },
  petName: {
    color: '#162850',
    fontSize: 18,
    fontWeight: '900',
  },
  ownerName: {
    color: '#6AA896',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  inlineHistory: {
    marginTop: 8,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F5FAF8',
    borderWidth: 1,
    borderColor: '#D8E7E3',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 7,
  },
  historyTitle: {
    color: '#162850',
    fontWeight: '900',
    fontSize: 17,
  },
  historySubtitle: {
    color: '#526A63',
    fontSize: 11,
    marginTop: 2,
  },
  miniRecord: {
    borderRadius: 11,
    padding: 9,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E3ECE9',
    marginBottom: 6,
  },
  miniRecordTitle: {
    color: '#162850',
    fontWeight: '900',
    fontSize: 12,
  },
  miniRecordText: {
    color: '#526A63',
    fontSize: 10,
    marginTop: 3,
    lineHeight: 15,
  },
  noRecord: {
    color: '#526A63',
    fontSize: 11,
    marginBottom: 6,
  },
});
