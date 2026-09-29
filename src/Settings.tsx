import { Link } from "react-router";
import Head from "./Head";
import { resetApplicationData, useSettings } from "./storage";

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
  const isDark = useSettings((state) => state.settings.get("isDark") === true);
  const updateIsDark = useSettings((state) => state.updateIsDark);

  return (
    <label>
      <input
        type="checkbox"
        checked={isDark}
        onChange={(event) => updateIsDark(event.target.checked)}
      />
      다크 모드 사용
    </label>
  );
}

function OpenArchiveButton() {
  return <Link to="/collections">보관함 열기</Link>;
}

function ResetDataButton({ descriptionId }: { descriptionId: string }) {
  return (
    <button
      type="button"
      aria-describedby={descriptionId}
      onClick={resetApplicationData}
    >
      초기화
    </button>
  );
}

function SettingControl({
  settingKey,
  descriptionId,
}: {
  settingKey: Setting["key"];
  descriptionId: string;
}) {
  switch (settingKey) {
    case "dark-mode":
      return <DarkModeSwitch />;
    case "open-archive":
      return <OpenArchiveButton />;
    case "clear-storage":
      return <ResetDataButton descriptionId={descriptionId} />;
  }
}

function SettingCard({ setting }: { setting: Setting }) {
  const titleId = `${setting.key}-title`;
  const descriptionId = `${setting.key}-description`;

  return (
    <section className="setting-card" aria-labelledby={titleId}>
      <h3 id={titleId}>{setting.title}</h3>
      <p id={descriptionId}>{setting.description}</p>
      <SettingControl settingKey={setting.key} descriptionId={descriptionId} />
    </section>
  );
}

function Settings() {
  return (
    <>
      <Head page="settings" />
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
