import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

export default function RootLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf="house.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="anime_list" role="search">
        <Icon sf="gear" drawable="custom_settings_drawable" />
        <Label>Animation list</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
