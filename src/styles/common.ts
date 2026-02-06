import { StyleSheet } from "react-native";
import { colors, spacing, fontSize, fontWeights, borderRadius } from "./theme";

export const commonStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
    },

    paddingContainer: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },

    // Spacing utilities
    p2: { padding: spacing.sm },
    p4: { padding: spacing.md },
    p6: { padding: spacing.lg },

    ph2: { paddingHorizontal: spacing.sm },
    ph4: { paddingHorizontal: spacing.md },
    ph6: { paddingHorizontal: spacing.lg },

    pv2: { paddingVertical: spacing.sm },
    pv4: { paddingVertical: spacing.md },
    pv6: { paddingVertical: spacing.lg },

    // Margins
    m2: { margin: spacing.sm },
    m4: { margin: spacing.md },
    m6: { margin: spacing.lg },

    // Text styles
    h1: {
        fontSize: fontSize["3xl"],
        fontWeight: fontWeights.bold,
        color: colors.text.primary,
    },

    h2: {
        fontSize: fontSize["2xl"],
        fontWeight: fontWeights.bold,
        color: colors.text.primary,
    },

    h3: {
        fontSize: fontSize.lg,
        fontWeight: fontWeights.semibold,
        color: colors.text.primary,
    },

    body: {
        fontSize: fontSize.base,
        fontWeight: fontWeights.normal,
        color: colors.text.primary,
    },

    caption: {
        fontSize: fontSize.sm,
        fontWeight: fontWeights.normal,
        color: colors.text.secondary,
    },

    // Flexbox utilities
    flexRow: {
        flexDirection: "row",
    },

    flexCenter: {
        justifyContent: "center",
        alignItems: "center",
    },

    flexBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    flexStart: {
        justifyContent: "flex-start",
        alignItems: "flex-start",
    },

    gap2: {
        gap: spacing.sm,
    },

    gap4: {
        gap: spacing.md,
    },

    gap6: {
        gap: spacing.lg,
    },

    // Card styles
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginVertical: spacing.sm,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },

    // Input styles
    input: {
        fontSize: fontSize.base,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        color: colors.text.primary,
    },

    // Button styles
    button: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        justifyContent: "center",
        alignItems: "center",
    },

    buttonPrimary: {
        backgroundColor: colors.primary,
    },

    buttonSecondary: {
        backgroundColor: colors.secondary,
    },

    buttonText: {
        color: colors.surface,
        fontSize: fontSize.base,
        fontWeight: fontWeights.semibold,
    },

    // Divider
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.md,
    },
});
