import * as Notifications from "expo-notifications";

export async function registerForPushNotifications() {
    console.log("🔔 Starting push notification registration...");

    const { status } = await Notifications.requestPermissionsAsync();
    console.log("🔔 Permission status:", status);

    if (status !== "granted") {
        console.warn("❌ Notification permission denied");
        throw new Error("Notification permission denied");
    }

    console.log("✅ Permission granted, getting device token...");
    const deviceToken = await Notifications.getDevicePushTokenAsync();
    console.log("✅ Device token received:", deviceToken);

    return deviceToken.data;
}
