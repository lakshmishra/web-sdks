import React from "react";
import { useMedia } from "react-use";
import { selectIsAllowedToPublish, useHMSStore } from "@100mslive/react-sdk";
import { ArrowRightIcon, CheckIcon, PersonIcon } from "@100mslive/react-icons";
import { config, Dropdown, Text } from "@100mslive/react-ui";

const getParams = () => {
  return window.__hms.sdk.localPeer.videoTrack?.transceiver?.sender?.getParameters();
};

export const DegradationPreference = () => {
  const hideTriggerItem = useMedia(config.media.sm);
  const isAllowedToPublish = useHMSStore(selectIsAllowedToPublish);
  if (!isAllowedToPublish.video) {
    return null;
  }

  return hideTriggerItem ? null : (
    <Dropdown.SubMenu>
      <Dropdown.TriggerItem data-testid="change_my_role_btn">
        <PersonIcon />
        <Text variant="sm" css={{ flex: "1 1 0", mx: "$4" }}>
          Degradation Preference
        </Text>
        <ArrowRightIcon />
      </Dropdown.TriggerItem>
      <Dropdown.SubMenuContent
        sideOffset={8}
        alignOffset={-5}
        css={{ "@md": { w: "$64" } }}
      >
        {["maintain-framerate", "maintain-resolution", "balanced", "none"].map(
          preference => (
            <Dropdown.Item
              key={preference}
              css={{ justifyContent: "space-between" }}
              onClick={async () => {
                const params = getParams();
                if (params) {
                  params.degradationPreference =
                    preference === "none" ? undefined : preference;
                  await window.__hms.sdk.localPeer.videoTrack.transceiver.sender.setParameters(
                    params
                  );
                }
              }}
            >
              <Text variant="sm" css={{ textTransform: "capitalize" }}>
                {preference}
              </Text>
              {getParams()?.degradationPreference === preference && (
                <CheckIcon width={16} height={16} />
              )}
            </Dropdown.Item>
          )
        )}
      </Dropdown.SubMenuContent>
    </Dropdown.SubMenu>
  );
};
