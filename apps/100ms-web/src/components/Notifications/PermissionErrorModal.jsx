import React, { useEffect, useState } from "react";
import {
  HMSNotificationTypes,
  useHMSActions,
  useHMSNotifications,
} from "@100mslive/react-sdk";
import { Button, Dialog, Text } from "@100mslive/react-ui";
import { DialogRow } from "../../primitives/DialogContent";

export function PermissionErrorModal() {
  const notification = useHMSNotifications(HMSNotificationTypes.ERROR);
  const [deviceType, setDeviceType] = useState("");
  const [isSystemError, setIsSystemError] = useState(false);
  const [showAction, setShowAction] = useState(false);
  const actions = useHMSActions();
  useEffect(() => {
    if (
      !notification ||
      (notification.data?.code !== 3001 && notification.data?.code !== 3011) ||
      (notification.data?.code === 3001 &&
        notification.data?.message.includes("screen"))
    ) {
      return;
    }
    const errorMessage = notification.data?.message;
    const hasAudio = errorMessage.includes("audio");
    const hasVideo = errorMessage.includes("video");
    const hasScreen = errorMessage.includes("screen");

    console.error(`[${notification.type}]`, notification);

    (async () => {
      setShowAction(false);
      try {
        if (hasVideo) {
          const result = await navigator.permissions?.query({
            name: "camera",
          });
          if (result.state === "prompt") {
            setShowAction(true);
          }
        }
        if (hasAudio) {
          const result = await navigator.permissions?.query({
            name: "camera",
          });
          if (result.state === "prompt") {
            setShowAction(true);
          }
        }
      } catch (err) {
        console.debug("Permissions query error", err);
      }
    })();

    if (hasAudio && hasVideo) {
      setDeviceType("Camera and Microphone");
    } else if (hasAudio) {
      setDeviceType("Microphone");
    } else if (hasVideo) {
      setDeviceType("Camera");
    } else if (hasScreen) {
      setDeviceType("Screenshare");
    }
    setIsSystemError(notification.data.code === 3011);
  }, [notification]);
  return deviceType ? (
    <Dialog.Root
      open
      onOpenChange={value => {
        if (!value) {
          setDeviceType("");
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content css={{ w: "min(480px, 90%)" }}>
          <Dialog.Title
            css={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid $borderDefault",
              pb: "$8",
            }}
          >
            <Text css={{ fontWeight: "$semiBold" }}>
              {deviceType} permissions are blocked
            </Text>
            <Dialog.DefaultClose
              data-testid="dialoge_cross_icon"
              css={{ alignSelf: "start" }}
              tabIndex="-1"
            />
          </Dialog.Title>
          <Text variant="md" css={{ py: "$10" }}>
            Access to {deviceType} is required.&nbsp;
            {isSystemError
              ? `Enable permissions for ${deviceType} from sytem settings`
              : `Enable permissions for ${deviceType} from address bar or browser settings`}
          </Text>
          {showAction ? (
            <DialogRow justify="end">
              <Button
                variant="primary"
                onClick={async () => {
                  setDeviceType("");
                  if (deviceType.includes("Camera")) {
                    await actions
                      .setLocalVideoEnabled(true)
                      .catch(console.error);
                  }
                  if (deviceType.includes("Microphone")) {
                    await actions
                      .setLocalAudioEnabled(true)
                      .catch(console.error);
                  }
                }}
              >
                Request permissions
              </Button>
            </DialogRow>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  ) : null;
}
