import { useCallback, useState } from "react";

import type { OverridePatch } from "@/platform/invoke";
import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";
import { Label } from "@/ui/primitives/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/ui/primitives/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/primitives/tabs";
import { Textarea } from "@/ui/primitives/textarea";

import type { AccountView } from "./account";
import { formatJwtExpiry, jwtExpiryTooltip } from "./jwt-label";
import { formatLastUsed } from "./last-used";
import {
  fromTri,
  OverrideTriField,
  type TriState,
  toTri,
} from "./override-tri-field";
import { parseTags } from "./tags";
import type { AccountSheetTab } from "./use-account-editors";

interface AccountSheetProps {
  account: AccountView | null;
  onClose: () => void;
  onSaveNote: (note: string) => void;
  onSaveOverrides: (steamid: string, patch: OverridePatch) => void;
  onSaveTags: (tags: string[]) => void;
  onTabChange: (tab: AccountSheetTab) => void;
  open: boolean;
  streamer: boolean;
  tab: AccountSheetTab;
}

/// Parent should remount the form with `key={account.steamid}` when the target changes.
export function AccountSheet({
  open,
  account,
  tab,
  streamer,
  onTabChange,
  onSaveNote,
  onSaveTags,
  onSaveOverrides,
  onClose,
}: AccountSheetProps) {
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <Sheet onOpenChange={handleOpenChange} open={open}>
      <SheetContent className="w-full gap-0 sm:max-w-md" side="right">
        {account ? (
          <AccountSheetForm
            account={account}
            key={account.steamid}
            onClose={onClose}
            onSaveNote={onSaveNote}
            onSaveOverrides={onSaveOverrides}
            onSaveTags={onSaveTags}
            onTabChange={onTabChange}
            streamer={streamer}
            tab={tab}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

interface AccountSheetFormProps {
  account: AccountView;
  onClose: () => void;
  onSaveNote: (note: string) => void;
  onSaveOverrides: (steamid: string, patch: OverridePatch) => void;
  onSaveTags: (tags: string[]) => void;
  onTabChange: (tab: AccountSheetTab) => void;
  streamer: boolean;
  tab: AccountSheetTab;
}

function AccountSheetForm({
  account,
  tab,
  streamer,
  onTabChange,
  onSaveNote,
  onSaveTags,
  onSaveOverrides,
  onClose,
}: AccountSheetFormProps) {
  const [note, setNote] = useState(account.note);
  const [tagValue, setTagValue] = useState(() => account.tags.join(", "));
  const [invisible, setInvisible] = useState<TriState>(() =>
    toTri(account.always_invisible)
  );
  const [mute, setMute] = useState<TriState>(() =>
    toTri(account.mute_notifications)
  );
  const [cs2, setCs2] = useState<TriState>(() => toTri(account.launch_cs2));
  const [cs2Options, setCs2Options] = useState(
    () => account.cs2_launch_options ?? ""
  );
  const [cs2OptionsInherit, setCs2OptionsInherit] = useState(
    () => account.cs2_launch_options === null
  );

  const title = streamer ? "Account" : account.display_name;
  const jwtLabel = formatJwtExpiry(account.jwt_expires_in);
  const jwtTip = jwtExpiryTooltip(account.jwt_expires_in);
  const lastUsed = formatLastUsed(account.last_used);

  const handleTabChange = useCallback(
    (value: string) => {
      if (value === "account" || value === "sign-in") {
        onTabChange(value);
      }
    },
    [onTabChange]
  );

  const handleNoteChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNote(event.target.value);
    },
    []
  );

  const handleTagChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTagValue(event.target.value);
    },
    []
  );

  const inheritCs2Options = useCallback(() => {
    setCs2OptionsInherit(true);
  }, []);

  const customCs2Options = useCallback(() => {
    setCs2OptionsInherit(false);
  }, []);

  const handleCs2OptionsChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setCs2Options(event.target.value);
    },
    []
  );

  const handleSave = useCallback(() => {
    onSaveNote(note);
    onSaveTags(parseTags(tagValue));
    onSaveOverrides(account.steamid, {
      always_invisible: fromTri(invisible),
      cs2_launch_options: cs2OptionsInherit ? null : cs2Options,
      launch_cs2: fromTri(cs2),
      mute_notifications: fromTri(mute),
    });
    onClose();
  }, [
    account.steamid,
    cs2,
    cs2Options,
    cs2OptionsInherit,
    invisible,
    mute,
    note,
    onClose,
    onSaveNote,
    onSaveOverrides,
    onSaveTags,
    tagValue,
  ]);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="truncate">{title}</SheetTitle>
        <SheetDescription className="truncate font-mono">
          {streamer ? "Hidden in streamer mode" : account.account_name}
        </SheetDescription>
      </SheetHeader>

      <Tabs
        className="min-h-0 flex-1 gap-0 overflow-hidden px-4"
        onValueChange={handleTabChange}
        value={tab}
      >
        <TabsList className="w-full" variant="line">
          <TabsTrigger className="flex-1" value="account">
            Account
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="sign-in">
            Sign-in
          </TabsTrigger>
        </TabsList>

        <TabsContent
          className="flex min-h-0 flex-col gap-3 overflow-y-auto pt-4"
          value="account"
        >
          <MetaLine
            label="Token"
            title={jwtTip || undefined}
            value={jwtLabel || (account.has_token ? "OK" : "Missing")}
          />
          <MetaLine label="Last used" value={lastUsed || "Never"} />
          {streamer ? null : (
            <MetaLine label="SteamID" value={account.steamid} />
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="account-note">Note</Label>
            <Textarea
              className="min-h-20 resize-none"
              id="account-note"
              onChange={handleNoteChange}
              placeholder="Label, smurf, banned…"
              value={note}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="account-tags">Tags</Label>
            <Input
              id="account-tags"
              onChange={handleTagChange}
              placeholder="smurf, main, banned"
              value={tagValue}
            />
            <p className="text-muted-foreground text-xs">
              Comma-separated. Search with #tag.
            </p>
          </div>
        </TabsContent>

        <TabsContent
          className="flex min-h-0 flex-col gap-3.5 overflow-y-auto pt-4"
          value="sign-in"
        >
          <p className="text-muted-foreground text-xs">
            Inherit uses global settings.
          </p>
          <OverrideTriField
            label="Always invisible"
            onChange={setInvisible}
            value={invisible}
          />
          <OverrideTriField
            label="Mute notifications"
            onChange={setMute}
            value={mute}
          />
          <OverrideTriField label="Launch CS2" onChange={setCs2} value={cs2} />

          <div className="flex flex-col gap-1.5">
            <Label>CS2 launch options</Label>
            <div className="flex gap-1.5">
              <Button
                className="flex-1"
                onClick={inheritCs2Options}
                size="xs"
                type="button"
                variant={cs2OptionsInherit ? "default" : "outline"}
              >
                Inherit
              </Button>
              <Button
                className="flex-1"
                onClick={customCs2Options}
                size="xs"
                type="button"
                variant={cs2OptionsInherit ? "outline" : "default"}
              >
                Custom
              </Button>
            </div>
            {cs2OptionsInherit ? null : (
              <Input
                onChange={handleCs2OptionsChange}
                placeholder="-nojoy -high"
                value={cs2Options}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      <SheetFooter>
        <Button onClick={onClose} size="sm" variant="outline">
          Cancel
        </Button>
        <Button onClick={handleSave} size="sm">
          Save
        </Button>
      </SheetFooter>
    </>
  );
}

function MetaLine({
  label,
  title,
  value,
}: {
  label: string;
  title?: string;
  value: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium" title={title}>
        {value}
      </span>
    </div>
  );
}
