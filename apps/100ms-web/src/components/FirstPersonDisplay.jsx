import React from "react";
import { selectLocalPeerRoleName, useHMSStore } from "@100mslive/react-sdk";
import { Box, Flex, Text } from "@100mslive/react-ui";
import PlaceholderBg from "../images/first_person.png";

export const FirstPersonDisplay = React.memo(() => {
  const role = useHMSStore(selectLocalPeerRoleName);
  const otherRole = role === "doctor" ? "patient" : "doctor";
  return (
    <Box
      css={{
        position: "relative",
        overflow: "hidden",
        w: "37.5rem",
        maxWidth: "80%",
        h: "100%",
        r: "$3",
        m: "0 auto",
        backgroundImage: `url(${PlaceholderBg})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
      data-testid="first_person_img"
    >
      <Flex
        align="center"
        direction="column"
        css={{
          position: "absolute",
          w: "100%",
          top: "33.33%",
          left: 0,
          textAlign: "center",
        }}
      >
        <Text color="white" variant="h4" css={{ "@md": { fontSize: "$md" } }}>
          Welcome!
        </Text>
        <Text
          color="white"
          variant="h6"
          css={{ mt: "$4", "@md": { fontSize: "$sm" } }}
        >
          The appointment will start in a few minutes.
        </Text>
        <Text
          color="white"
          variant="h6"
          css={{ mt: "$2", "@md": { fontSize: "$sm" } }}
        >
          Please wait till the {otherRole} joins
        </Text>
      </Flex>
    </Box>
  );
});
