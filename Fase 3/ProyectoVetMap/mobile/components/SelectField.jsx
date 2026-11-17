import {
  useMemo,
  useState,
} from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { COLORS } from "./ui";

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function SelectField({
  label,
  options = [],
  value = "",
  onChange,
  placeholder = "Selecciona una opción",
  disabled = false,
  searchable = false,
  searchPlaceholder = "Buscar...",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const normalized = useMemo(
    () =>
      options.map((item) =>
        typeof item === "string"
          ? { value: item, label: item }
          : item
      ),
    [options]
  );

  const filtered = useMemo(() => {
    if (!searchable || !search.trim()) {
      return normalized;
    }

    const q = normalize(search);

    return normalized.filter((item) =>
      normalize(item.label).includes(q)
    );
  }, [normalized, search, searchable]);

  const selected = normalized.find(
    (item) =>
      String(item.value) === String(value)
  );

  function close() {
    setOpen(false);
    setSearch("");
  }

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.82}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[
          styles.control,
          disabled && styles.disabled,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.value,
            !selected && styles.placeholder,
          ]}
        >
          {selected?.label || placeholder}
        </Text>

        <Text style={styles.chevron}>⌄</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={close}
          style={styles.overlay}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={styles.modal}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {label || "Seleccionar"}
              </Text>

              <TouchableOpacity
                onPress={close}
                style={styles.close}
              >
                <Text style={styles.closeText}>×</Text>
              </TouchableOpacity>
            </View>

            {searchable ? (
              <View style={styles.searchWrap}>
                <Text style={styles.searchIcon}>🔎</Text>
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder={searchPlaceholder}
                  placeholderTextColor="#95A4A0"
                  style={styles.searchInput}
                />
              </View>
            ) : null}

            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
            >
              {filtered.length === 0 ? (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsEmoji}>🔎</Text>
                  <Text style={styles.noResultsText}>
                    No encontramos opciones.
                  </Text>
                </View>
              ) : (
                filtered.map((item) => {
                  const active =
                    String(item.value) ===
                    String(value);

                  return (
                    <TouchableOpacity
                      key={String(item.value)}
                      onPress={() => {
                        onChange?.(item.value);
                        close();
                      }}
                      style={[
                        styles.option,
                        active && styles.optionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          active && styles.optionTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>

                      {active ? (
                        <Text style={styles.check}>✓</Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  label: { color: "#49655D", fontWeight: "800", marginBottom: 6, fontSize: 13 },
  control: { minHeight: 50, backgroundColor: COLORS.mint50, borderWidth: 1, borderColor: "#D8E7E3", borderRadius: 14, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  disabled: { opacity: 0.55 },
  value: { flex: 1, color: COLORS.text, fontSize: 15, fontWeight: "600" },
  placeholder: { color: "#9AA9A5", fontWeight: "500" },
  chevron: { color: COLORS.navy, fontSize: 20, fontWeight: "900" },
  overlay: { flex: 1, backgroundColor: "rgba(12,30,45,0.38)", justifyContent: "center", padding: 18 },
  modal: { maxHeight: "80%", backgroundColor: "white", borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, overflow: "hidden" },
  modalHeader: { minHeight: 58, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#E9F0EE" },
  modalTitle: { flex: 1, color: COLORS.navy, fontSize: 18, fontWeight: "900" },
  close: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.mint100, alignItems: "center", justifyContent: "center" },
  closeText: { color: COLORS.navy, fontSize: 24, lineHeight: 27, fontWeight: "700" },
  searchWrap: { margin: 10, marginBottom: 2, minHeight: 48, borderRadius: 13, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.mint50, flexDirection: "row", alignItems: "center", paddingHorizontal: 11, gap: 7 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 14, paddingVertical: 10 },
  list: { maxHeight: 480 },
  listContent: { padding: 10 },
  option: { minHeight: 48, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", borderRadius: 12, marginBottom: 4 },
  optionActive: { backgroundColor: COLORS.mint100 },
  optionText: { flex: 1, color: COLORS.text, fontSize: 15, fontWeight: "700" },
  optionTextActive: { color: COLORS.navy },
  check: { color: COLORS.teal, fontSize: 18, fontWeight: "900" },
  noResults: { minHeight: 120, alignItems: "center", justifyContent: "center" },
  noResultsEmoji: { fontSize: 30 },
  noResultsText: { color: COLORS.muted, marginTop: 5 },
});
