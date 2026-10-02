import { useState } from "react";
import { Link } from "react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { cyanSurfaceVariants } from "./lib/app-variants";
import { cn } from "./lib/utils";
import Head from "./components/Head";
import { useTheme } from "./components/ThemeProvider";
import { resetApplicationData } from "./storage";

type Setting = {
  key: "dark-mode" | "open-archive" | "clear-storage";
  title: string;
  description: string;
};

const settings: Setting[] = [
  {
    key: "dark-mode",
    title: "다크 모드",
    description:
      "화면을 어둡게 만듭니다. 켜두면 다음에 접속할 때에도 그대로 유지됩니다.",
  },
  {
    key: "open-archive",
    title: "완료한 할 일 모아보기",
    description: "지금까지 완료하여 저장한 할 일을 언제든 다시 볼 수 있습니다.",
  },
  {
    key: "clear-storage",
    title: "저장된 데이터 초기화",
    description: "기기에 저장된 모든 할 일, 설정 기록을 삭제합니다.",
  },
];

function DarkModeSwitch() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Switch
      checked={isDark}
      onCheckedChange={(value) => setTheme(value ? "dark" : "light")}
      className="border-2 cursor-pointer"
    />
  );
}

function OpenArchiveButton() {
  return (
    <Button
      className="bg-gray-400 hover:bg-gray-300 text-black"
      render={<Link to="/Archive" />}
    >
      보관함 열기
    </Button>
  );
}

function ResetDataButton() {
  const [open, setOpen] = useState(false);
  const { setTheme } = useTheme();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="destructive"
            className="bg-red-200 hover:bg-red-300 text-red-800
            dark:bg-red-300 dark:hover:bg-red-500 dark:hover:text-red-950 cursor-pointer"
          />
        }
      >
        초기화
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>정말로 초기화하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            저장된 모든 일정과 설정을 초기화합니다. 이 동작은 취소할 수
            없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">취소</AlertDialogCancel>
          <AlertDialogAction
            className="cursor-pointer"
            onClick={() => {
              resetApplicationData();
              setTheme("light");
              setOpen(false);
              toast.add({
                type: "success",
                description: "데이터를 초기화했습니다.",
                timeout: 5000,
              });
            }}
          >
            초기화
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SettingControl({ settingKey }: { settingKey: Setting["key"] }) {
  switch (settingKey) {
    case "dark-mode":
      return <DarkModeSwitch />;
    case "open-archive":
      return <OpenArchiveButton />;
    case "clear-storage":
      return <ResetDataButton />;
  }
}

function SettingCard({ setting }: { setting: Setting }) {
  const titleId = `${setting.key}-title`;
  const descriptionId = `${setting.key}-description`;

  return (
    <Item
      className={cn(cyanSurfaceVariants(), "items-center border-accent")}
      aria-labelledby={titleId}
    >
      <ItemContent className="min-w-0 basis-full sm:basis-auto">
        <ItemTitle id={titleId}>{setting.title}</ItemTitle>
        <ItemDescription id={descriptionId} className="line-clamp-none break-words">
          {setting.description}
        </ItemDescription>
      </ItemContent>
      <ItemActions className="basis-full justify-end sm:basis-auto">
        <SettingControl settingKey={setting.key} />
      </ItemActions>
    </Item>
  );
}

function Settings() {
  return (
    <>
      <Head />
      <main>
        <h2>설정</h2>
        {settings.map((setting) => (
          <SettingCard key={setting.key} setting={setting} />
        ))}
      </main>
    </>
  );
}

export default Settings;
