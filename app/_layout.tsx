import { Provider } from "react-redux";
import { store } from "../src/store";
import { router, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useAppDispatch, useAppSelector } from "../src/store/hooks";
import { setToken } from "../src/store/auth/auth.slice";
import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications"; import { useRouter } from "expo-router";

function RootLayoutNav() {
    const dispatch = useAppDispatch();
    const token = useAppSelector((state) => state.auth.token);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const bootstrapAsync = async () => {
            try {
                const savedToken = await SecureStore.getItemAsync("token");
                if (savedToken) {
                    dispatch(setToken(savedToken));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        bootstrapAsync();
    }, [dispatch]);

    if (isLoading) {
        return null;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            {!token ? (
                <Stack.Screen name="(public)" />
            ) : (
                <Stack.Screen name="(protected)" />
            )}
        </Stack>
    );
}
useEffect(() => {
    const sub =
        Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;

            if (data.type === "direct") {
                router.push(`/chat/user/${data.userId}` as any);
            }

            if (data.type === "channel") {
                router.push(`/chat/${data.channelId}` as any);
            }
        });

    return () => sub.remove();
}, []);


export default function RootLayout() {
    return (
        <Provider store={store}>
            <RootLayoutNav />
        </Provider>
    );
}
