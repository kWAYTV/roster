import { Button } from "@/ui/primitives/button";
import { TabsContent } from "@/ui/primitives/tabs";

interface SettingsDangerProps {
  onRequestReset: () => void;
}

export function SettingsDanger({ onRequestReset }: SettingsDangerProps) {
  return (
    <TabsContent className="mt-0 min-h-52 outline-none" value="danger">
      <div className="flex flex-col gap-3">
        <div>
          <div className="font-medium text-destructive text-sm">
            Reset local login data
          </div>
          <p className="mt-1 text-pretty text-muted-foreground text-xs leading-snug">
            Clears every saved Steam login on this PC — config files, the token
            cache, and Roster pins/notes/cooldowns/tags. Closes Steam and leaves
            it closed. This cannot be undone.
          </p>
        </div>
        <Button
          className="self-start"
          onClick={onRequestReset}
          size="sm"
          variant="destructive"
        >
          Reset login data
        </Button>
      </div>
    </TabsContent>
  );
}
