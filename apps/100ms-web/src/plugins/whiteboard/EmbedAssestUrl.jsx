import React from "react";
import { ViewIcon } from "@100mslive/react-icons";
import { Button, Dialog, Text } from "@100mslive/react-ui";
import {
  DialogContent,
  DialogInput,
  DialogRow,
} from "../../primitives/DialogContent";

export function EmbedUrlModal({ url, setUrl, onOpenChange }) {
  return (
    <Dialog.Root defaultOpen onOpenChange={onOpenChange}>
      <DialogContent title="Embed URL" Icon={ViewIcon}>
        <DialogInput
          title="URL"
          value={url}
          onChange={setUrl}
          placeholder="https://www.example.com/"
          type="url"
        />
        <DialogRow>
          <Text>Embed image URL to use on tldraw</Text>
        </DialogRow>
        <DialogRow justify="end">
          <Button
            variant="primary"
            type="submit"
            disabled={!url.trim()}
            onClick={() => {
              onOpenChange(false);
            }}
            data-testid="embed_url_btn"
            css={{ mr: "$4" }}
          >
            Embed
          </Button>
        </DialogRow>
      </DialogContent>
    </Dialog.Root>
  );
}
