import { Canvas, TldrawEditor } from "@tldraw/editor";
import {
  DEFAULT_DOCUMENT_NAME,
  getUserData,
  TAB_ID,
  useLocalSyncClient,
} from "@tldraw/tlsync-client";
import { ContextMenu, TldrawUi } from "@tldraw/ui";

/** @public */
export function Tldraw(props) {
  const {
    children,
    persistenceKey = DEFAULT_DOCUMENT_NAME,
    instanceId = TAB_ID,
    ...rest
  } = props;

  const userData = getUserData();

  const userId = props.userId ?? userData.id;

  const syncedStore = useLocalSyncClient({
    instanceId,
    userId: userId,
    universalPersistenceKey: persistenceKey,
    config: props.config,
  });

  return (
    <TldrawEditor
      {...rest}
      instanceId={instanceId}
      userId={userId}
      store={syncedStore}
    >
      <TldrawUi {...rest}>
        <ContextMenu>
          <Canvas />
        </ContextMenu>
        {children}
      </TldrawUi>
    </TldrawEditor>
  );
}
