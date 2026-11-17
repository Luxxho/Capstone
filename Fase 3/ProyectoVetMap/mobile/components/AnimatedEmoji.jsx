import React, {
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

const DRIVER = Platform.OS !== "web";

export function AnimatedEmoji({
  emoji,
  size = 24,
  motion = "float",
  style,
}) {
  const value = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    value.setValue(0);

    let animation;

    if (motion === "pulse") {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: 650,
            easing: Easing.inOut(
              Easing.quad
            ),
            useNativeDriver: DRIVER,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 650,
            easing: Easing.inOut(
              Easing.quad
            ),
            useNativeDriver: DRIVER,
          }),
        ])
      );
    } else if (motion === "wiggle") {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: 380,
            easing: Easing.inOut(
              Easing.quad
            ),
            useNativeDriver: DRIVER,
          }),
          Animated.timing(value, {
            toValue: -1,
            duration: 380,
            easing: Easing.inOut(
              Easing.quad
            ),
            useNativeDriver: DRIVER,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 380,
            easing: Easing.inOut(
              Easing.quad
            ),
            useNativeDriver: DRIVER,
          }),
        ])
      );
    } else if (motion === "bounce") {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: 420,
            easing: Easing.out(
              Easing.cubic
            ),
            useNativeDriver: DRIVER,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 420,
            easing: Easing.bounce,
            useNativeDriver: DRIVER,
          }),
          Animated.delay(260),
        ])
      );
    } else {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(
              Easing.sin
            ),
            useNativeDriver: DRIVER,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 900,
            easing: Easing.inOut(
              Easing.sin
            ),
            useNativeDriver: DRIVER,
          }),
        ])
      );
    }

    animation.start();

    return () => {
      animation.stop();
    };
  }, [motion, value]);

  const animatedStyle =
    useMemo(() => {
      if (motion === "pulse") {
        return {
          transform: [
            {
              scale: value.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.14],
              }),
            },
          ],
        };
      }

      if (motion === "wiggle") {
        return {
          transform: [
            {
              rotate: value.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: [
                  "-10deg",
                  "0deg",
                  "10deg",
                ],
              }),
            },
          ],
        };
      }

      if (motion === "bounce") {
        return {
          transform: [
            {
              translateY:
                value.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -9],
                }),
            },
            {
              scale: value.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.08],
              }),
            },
          ],
        };
      }

      return {
        transform: [
          {
            translateY:
              value.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -4],
              }),
          },
          {
            rotate: value.interpolate({
              inputRange: [0, 1],
              outputRange: [
                "-2deg",
                "2deg",
              ],
            }),
          },
        ],
      };
    }, [motion, value]);

  return (
    <Animated.Text
      style={[
        {
          fontSize: size,
          lineHeight:
            Math.ceil(size * 1.25),
          textAlign: "center",
        },
        animatedStyle,
        style,
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

export function ActionCelebration({
  visible,
  type = "success",
  title,
  text,
}) {
  const config = {
    purchase: {
      emoji: "🛒",
      secondary: "🎉",
      title:
        title ||
        "¡Compra realizada!",
      motion: "bounce",
    },
    appointment: {
      emoji: "📅",
      secondary: "✅",
      title:
        title ||
        "¡Hora agendada!",
      motion: "bounce",
    },
    alarm: {
      emoji: "🔔",
      secondary: "💊",
      title:
        title ||
        "¡Alarmas activadas!",
      motion: "wiggle",
    },
    success: {
      emoji: "✅",
      secondary: "✨",
      title:
        title ||
        "¡Listo!",
      motion: "pulse",
    },
  }[type] || {
    emoji: "✨",
    secondary: "🎉",
    title: title || "¡Listo!",
    motion: "bounce",
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View
        pointerEvents="none"
        style={styles.overlay}
      >
        <View style={styles.card}>
          <View style={styles.sparkRow}>
            <AnimatedEmoji
              emoji="✨"
              size={25}
              motion="pulse"
            />

            <AnimatedEmoji
              emoji={config.emoji}
              size={65}
              motion={config.motion}
            />

            <AnimatedEmoji
              emoji="✨"
              size={25}
              motion="pulse"
            />
          </View>

          <View
            style={
              styles.secondaryRow
            }
          >
            <AnimatedEmoji
              emoji={config.secondary}
              size={31}
              motion="bounce"
            />
            <AnimatedEmoji
              emoji="🎉"
              size={28}
              motion="wiggle"
            />
          </View>

          <Text style={styles.title}>
            {config.title}
          </Text>

          {text ? (
            <Text style={styles.text}>
              {text}
            </Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor:
      "rgba(10, 28, 43, 0.38)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "white",
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D8E7E3",
  },
  sparkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  secondaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 2,
  },
  title: {
    color: "#162850",
    fontSize: 23,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 12,
  },
  text: {
    color: "#526A63",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 7,
  },
});
