import {
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  AnimatedEmoji,
} from "./AnimatedEmoji";

export default function CartAddedToast({
  visible,
  productName,
  quantity = 1,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View
        pointerEvents="none"
        style={styles.overlay}
      >
        <View style={styles.toast}>
          <View style={styles.icons}>
            <AnimatedEmoji
              emoji="🛒"
              size={29}
              motion="bounce"
            />

            <AnimatedEmoji
              emoji="✅"
              size={23}
              motion="pulse"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              Producto agregado al carrito
            </Text>

            <Text
              style={styles.product}
              numberOfLines={1}
            >
              {productName}
            </Text>

            <Text style={styles.quantity}>
              {quantity === 1
                ? "1 unidad en el carrito"
                : `${quantity} unidades en el carrito`}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 84,
  },
  toast: {
    width: "100%",
    maxWidth: 430,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: "#F4FBF8",
    borderWidth: 1,
    borderColor: "#98CFBF",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#162850",
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 8,
  },
  icons: {
    minWidth: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  title: {
    color: "#397261",
    fontSize: 13,
    fontWeight: "900",
  },
  product: {
    color: "#162850",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 2,
  },
  quantity: {
    color: "#526A63",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },
});
