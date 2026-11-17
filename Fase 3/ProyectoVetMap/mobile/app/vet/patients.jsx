import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import {
  Button,
  Card,
  Empty,
  ErrorBox,
  Input,
  Loading,
  Row,
  Screen,
} from "../../components/ui";
import SelectField from "../../components/SelectField";
import { AnimatedEmoji } from "../../components/AnimatedEmoji";
import { useAuth } from "../../context/AuthContext";
import { getClinicPatients } from "../../services/api";
import { formatDate } from "../../utils/format";

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

export default function Patients() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);

    try {
      setItems(await getClinicPatients(token));
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

  const species = useMemo(
    () =>
      Array.from(
        new Set(items.map((item) => item.species).filter(Boolean))
      ).sort(),
    [items]
  );

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !text ||
        [
          item.name,
          item.owner_name,
          item.owner_email,
          item.species,
          item.breed,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(text);

      const matchesSpecies =
        speciesFilter === "all" || item.species === speciesFilter;

      return matchesSearch && matchesSpecies;
    });
  }, [items, query, speciesFilter]);

  return (
    <Screen
      title="Pacientes"
      subtitle="Busca por mascota, dueño o raza y filtra por especie"
      back
      backTo="/vet"
      onRefresh={load}
      refreshing={loading}
    >
      <ErrorBox message={error} />

      <Input
        label="Buscar paciente"
        value={query}
        onChangeText={setQuery}
        placeholder="Mascota, dueño, correo o raza..."
      />

      <SelectField
        label="Filtrar por especie"
        value={speciesFilter}
        onChange={setSpeciesFilter}
        options={[
          { value: "all", label: "Todas las especies" },
          ...species.map((item) => ({ value: item, label: item })),
        ]}
      />

      <Text style={styles.countText}>
        {filtered.length} paciente{filtered.length === 1 ? "" : "s"} visible{filtered.length === 1 ? "" : "s"}
      </Text>

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <Empty
          icon="🐾"
          title="Sin pacientes"
          text="No encontramos pacientes con esos filtros."
        />
      ) : (
        filtered.map((patient) => (
          <Card key={patient.id || patient.pet_id}>
            <View style={styles.patientTop}>
              {patient.photo_data ? (
                <Image
                  source={{ uri: patient.photo_data }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.emojiBox}>
                  <AnimatedEmoji
                    emoji={petEmoji(patient.species)}
                    size={35}
                    motion="float"
                  />
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{patient.name || patient.pet_name}</Text>
                <Text style={styles.owner}>{patient.owner_name || "Dueño no informado"}</Text>
                <Text style={styles.email}>{patient.owner_email || ""}</Text>
              </View>
            </View>

            <Row label="Especie" value={patient.species} />
            <Row label="Raza" value={patient.breed || "-"} />
            <Row label="Peso" value={patient.weight ? `${patient.weight} kg` : "-"} />
            <Row label="Atenciones" value={patient.appointments_count ?? 0} />
            <Row
              label="Última atención"
              value={patient.last_appointment ? formatDate(patient.last_appointment) : "-"}
            />
            <Row
              label="Próxima atención"
              value={patient.next_appointment ? formatDate(patient.next_appointment) : "Sin próxima hora"}
            />

            <Button
              label="🩺 Abrir ficha clínica"
              onPress={() =>
                router.push({
                  pathname: "/vet/patient/[id]",
                  params: { id: String(patient.id || patient.pet_id) },
                })
              }
            />
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  countText: {
    color: '#6AA896',
    fontWeight: '900',
    fontSize: 11,
  },
  patientTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 8,
  },
  photo: {
    width: 76,
    height: 76,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#D8E7E3',
  },
  emojiBox: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: '#E9F7F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: '#162850',
    fontSize: 19,
    fontWeight: '900',
  },
  owner: {
    color: '#6AA896',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 3,
  },
  email: {
    color: '#526A63',
    fontSize: 10,
    marginTop: 2,
  },
});
