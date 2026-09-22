(() => {
  "use strict";

  const KEY = "arch-install-v1";
  const DISK_MIB = 488387;
  const $ = (id) => document.getElementById(id);

  const GPT = {
    1: "EFI System",
    2: "MBR partition scheme",
    3: "Intel Fast Flash",
    4: "BIOS boot",
    5: "Sony boot partition",
    6: "Lenovo boot partition",
    7: "PowerPC PReP boot",
    8: "ONIE boot",
    9: "ONIE config",
    10: "Microsoft reserved",
    11: "Microsoft basic data",
    12: "Microsoft LDM metadata",
    13: "Microsoft LDM data",
    14: "Windows recovery environment",
    15: "IBM General Parallel Fs",
    16: "Microsoft Storage Spaces",
    17: "HP-UX data",
    18: "HP-UX service",
    19: "Linux swap",
    20: "Linux filesystem",
    21: "Linux server data",
    22: "Linux root (x86)",
    23: "Linux root (x86-64)",
    24: "Linux root (Alpha)",
    25: "Linux root (ARC)",
    26: "Linux root (ARM)",
    27: "Linux root (ARM-64)",
    28: "Linux root (IA-64)",
    29: "Linux root (LoongArch-64)",
    30: "Linux root (MIPS-32 LE)",
    31: "Linux root (MIPS-64 LE)",
    32: "Linux root (HPPA/PARISC)",
    33: "Linux root (PPC)",
    34: "Linux root (PPC64)",
    35: "Linux root (PPC64LE)",
    36: "Linux root (RISC-V-32)",
    37: "Linux root (RISC-V-64)",
    38: "Linux root (S390)",
    39: "Linux root (S390X)",
    40: "Linux root (TILE-Gx)",
    41: "Linux reserved",
    42: "Linux home",
    43: "Linux RAID",
    44: "Linux LVM",
    45: "Linux variable data",
  };

  const ALIAS = { linux: 20, swap: 19, home: 42, uefi: 1, raid: 43, lvm: 44 };
  const KEYMAPS = ["us", "cz", "cz-qwertz", "cz-qwerty", "cz-us-qwertz", "cz-prog", "cz-lat2", "de", "de-latin1", "sk", "sk-qwerty", "pl", "fr", "es", "uk"];
  const CZECH_MAPS = ["cz", "cz-qwertz", "cz-qwerty", "cz-us-qwertz", "cz-prog", "cz-lat2"];
  const ZONES = ["Europe/Prague", "Europe/Bratislava", "Europe/Berlin", "Europe/Vienna", "Europe/Warsaw", "Europe/Budapest", "Europe/Paris", "Europe/Rome", "Europe/London", "UTC", "America/New_York", "Asia/Tokyo"];
  const TERMS = ["xterm", "alacritty", "kitty", "foot", "wezterm", "urxvt", "gnome-terminal", "xfce4-terminal"];
  const GROUPS = {
    i3: ["i3-wm", "i3status", "i3lock", "i3blocks"],
    xorg: ["xorg-server", "xorg-xinit"],
    "base-devel": ["base-devel", "gcc", "make", "binutils"],
  };
  const KNOWN = new Set([
    "base", "linux", "linux-lts", "linux-firmware", "intel-ucode", "amd-ucode",
    "iwd", "networkmanager", "nano", "vim", "sudo", "man-db", "man-pages", "texinfo",
    "grub", "efibootmgr", "reflector", "git", "dosfstools", "e2fsprogs", "btrfs-progs", "xfsprogs",
    "xorg-server", "xorg-xinit", "xorg", "i3", "i3-wm", "i3status", "i3lock", "i3blocks",
    "dmenu", "rofi", "xterm", "alacritty", "kitty", "foot", "wezterm", "urxvt",
    "sway", "swaybg", "swayidle", "swaylock", "wmenu", "bemenu", "fuzzel",
    "hyprland", "polkit", "seatd", "awesome", "openbox", "bspwm", "sxhkd",
    "libx11", "libxft", "libxinerama", "base-devel", "firefox", "noto-fonts", "ttf-dejavu",
    "pipewire", "wireplumber", "brightnessctl", "uwsm", "gcc", "make", "binutils",
  ]);

  const LOCALE_GEN = [
    "# Soubor je zkrácený na řádky, které v /etc/locale.gen opravdu jsou.",
    "#cs_CZ.UTF-8 UTF-8",
    "#cs_CZ ISO-8859-2",
    "#de_DE.UTF-8 UTF-8",
    "#en_US.UTF-8 UTF-8",
    "#en_US ISO-8859-1",
    "#sk_SK.UTF-8 UTF-8",
    "",
  ].join("\n");

  const SUDOERS = [
    "# sudoers — zkráceno na řádky, které hra kontroluje",
    "root ALL=(ALL:ALL) ALL",
    "# %wheel ALL=(ALL:ALL) ALL",
    "# %wheel ALL=(ALL:ALL) NOPASSWD: ALL",
    "",
  ].join("\n");

  const CPUINFO = [
    "processor       : 0",
    "vendor_id       : GenuineIntel",
    "model name      : 12th Gen Intel(R) Core(TM) i5-1240P",
    "cpu cores       : 12",
    "",
  ].join("\n");

  function fresh() {
    return {
      secureBoot: true,
      secureOff: false,
      bootedIso: false,
      copyRam: false,
      keymap: "us",
      efiSeen: false,
      net: false,
      clockSeen: false,
      diskSeen: false,
      label: null,
      parts: [],
      fs: {},
      mounts: {},
      swaps: [],
      pkgs: [],
      livePkgs: [],
      files: {},
      dirs: [],
      exec: {},
      generated: [],
      sawS: false,
      env: "live",
      user: "root",
      cwd: "/root",
      rootPass: null,
      users: [],
      kernel: null,
      kernelOnEsp: false,
      espAt: null,
      bootctlFiles: false,
      bootctlEfi: false,
      grubEfi: false,
      grubCfg: false,
      ucodeFresh: false,
      enabled: [],
      started: [],
      booted: false,
      systemOnline: false,
      built: {},
      repos: [],
      dwmInstalled: false,
      stInstalled: false,
      wm: null,
      hints: 0,
      cmds: 0,
      t0: Date.now(),
      sound: false,
      history: [],
      hpos: 0,
      mode: "shell",
      ask: null,
      fdisk: null,
      passFor: null,
      pass1: null,
      pending: null,
      sudoCached: false,
      diskId: "7C3A9E14-2B60-4D8F-9A11-0E5D6C8B2147",
      wifi: false,
    };
  }

  let S = fresh();
  let busy = false;
  let editor = null;

  const screens = ["intro", "firmware", "menu", "install", "eject", "win"];
  function show(name) {
    for (const id of screens) $("screen-" + id).classList.toggle("hidden", id !== name);
    document.body.dataset.screen = name;
    if (name === "install") $("cmd").focus();
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function beep(freq, dur) {
    if (!S.sound) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    o.type = "square";
    g.gain.value = 0.04;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur);
  }

  function out(text, cls) {
    const div = document.createElement("div");
    div.className = "line" + (cls ? " " + cls : "");
    div.textContent = text;
    $("output").appendChild(div);
    const term = $("terminal");
    term.scrollTop = term.scrollHeight;
  }

  function has(pkg) {
    return S.pkgs.includes(pkg);
  }

  function hex(n) {
    return Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  }

  function uuid() {
    return `${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`;
  }

  function vfatId() {
    const h = () => Math.floor(Math.random() * 16).toString(16).toUpperCase();
    return Array.from({ length: 4 }, h).join("") + "-" + Array.from({ length: 4 }, h).join("");
  }

  function typeName(id) {
    return GPT[id] || "unknown";
  }

  function human(mib) {
    if (mib % 1024 === 0) return mib / 1024 + "G";
    if (mib >= 1024) return (mib / 1024).toFixed(1) + "G";
    return mib + "M";
  }

  function efiPart() {
    return S.parts.find((p) => p.type === 1) || null;
  }

  function swapPart() {
    return S.parts.find((p) => p.type === 19) || null;
  }

  function rootPart() {
    const t23 = S.parts.filter((p) => p.type === 23);
    if (t23.length) return t23.sort((a, b) => b.sizeMiB - a.sizeMiB)[0];
    const t20 = S.parts.filter((p) => p.type === 20);
    if (!t20.length) return null;
    return t20.sort((a, b) => b.sizeMiB - a.sizeMiB)[0];
  }

  function layoutReport() {
    const errors = [];
    const warnings = [];
    if (S.label !== "gpt") errors.push("Disklabel není gpt. Ve fdisku je na prázdném disku nejdřív DOS, příkaz g založí GPT.");
    const efi = efiPart();
    if (!efi) errors.push("Chybí oddíl typu EFI System (číslo 1, alias uefi).");
    else if (efi.sizeMiB < 512 || efi.sizeMiB > 2048) errors.push("EFI oddíl má mít v příkladu z wiki 1 GiB. Beru 512 MiB až 2 GiB.");
    const root = rootPart();
    if (!root) errors.push("Chybí oddíl pro /. Wiki příklad používá typ 23 Linux root (x86-64). Typ 20 Linux filesystem taky beru.");
    else if (root.sizeMiB < 16 * 1024) errors.push("Root je moc malý. Wiki počítá aspoň s 23–32 GiB.");
    if (root && root.type !== 23) warnings.push("Root je typ 20 Linux filesystem. Bootuje. Příklad na wiki má typ 23 Linux root (x86-64).");
    if (!swapPart()) warnings.push("Swap oddíl nemáš. V příkladu wiki je aspoň 4 GiB. Jde ho nahradit swapfilem nebo zramem, v téhle hře můžeš pokračovat.");
    return { errors, warnings };
  }

  function fsReady() {
    const efi = efiPart();
    const root = rootPart();
    if (!efi || !root) return false;
    const ef = S.fs[efi.num];
    const rf = S.fs[root.num];
    if (!ef || ef.kind !== "vfat") return false;
    if (!rf || !["ext4", "btrfs", "xfs"].includes(rf.kind)) return false;
    const sw = swapPart();
    if (sw && (!S.fs[sw.num] || S.fs[sw.num].kind !== "swap")) return false;
    return true;
  }

  function mountsReady() {
    const root = rootPart();
    const efi = efiPart();
    if (!root || !efi) return false;
    if (S.mounts["/mnt"] !== root.num && !(S.env !== "live" && S.espAt)) return false;
    if (S.env === "live" && S.mounts["/mnt"] !== root.num) return false;
    const sw = swapPart();
    if (sw && !S.swaps.includes(sw.num)) return false;
    return !!S.espAt;
  }

  function fileText(path) {
    return Object.prototype.hasOwnProperty.call(S.files, path) ? S.files[path] : null;
  }

  function generatedNow() {
    return S.generated;
  }

  function langNow() {
    const conf = fileText("/etc/locale.conf") || "";
    const m = conf.match(/^LANG=(?:"([^"]+)"|(\S+))/m);
    return m ? (m[1] || m[2]) : null;
  }

  function keymapFile() {
    const conf = fileText("/etc/vconsole.conf") || "";
    const m = conf.match(/^KEYMAP=(?:"([^"]+)"|(\S+))/m);
    return m ? (m[1] || m[2]) : null;
  }

  function hostnameNow() {
    return (fileText("/etc/hostname") || "").trim().split("\n")[0] || "";
  }

  function hostnameOk(name) {
    return /^[a-z0-9]$/.test(name) || /^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/.test(name);
  }

  function fstabText() {
    const lines = ["# /etc/fstab: static file system information."];
    const order = Object.entries(S.mounts);
    const root = rootPart();
    const mapped = [];
    if (root && S.mounts["/mnt"] === root.num && S.fs[root.num]) {
      const fs = S.fs[root.num];
      mapped.push(`UUID=${fs.uuid} / ${fs.kind} rw,relatime 0 1`);
    }
    const efi = efiPart();
    if (efi && S.espAt && S.fs[efi.num]) {
      const id = S.fs[efi.num].uuid;
      mapped.push(`UUID=${id} ${S.espAt} vfat rw,relatime,fmask=0022,dmask=0022,codepage=437,iocharset=ascii,shortname=mixed,utf8,errors=remount-ro 0 2`);
    }
    const sw = swapPart();
    if (sw && S.swaps.includes(sw.num) && S.fs[sw.num]) {
      mapped.push(`UUID=${S.fs[sw.num].uuid} none swap defaults 0 0`);
    }
    void order;
    return lines.concat(mapped).join("\n") + "\n";
  }

  function fstabOk() {
    const text = fileText("/etc/fstab") || "";
    const root = rootPart();
    const efi = efiPart();
    if (!root || !efi || !S.fs[root.num] || !S.fs[efi.num] || !S.espAt) return false;
    const ru = S.fs[root.num].uuid;
    const hits = text.split(ru).length - 1;
    if (hits !== 1) return false;
    if (!new RegExp(`UUID=${ru}\\s+/\\s+(ext4|btrfs|xfs)\\b`).test(text)) return false;
    const eu = S.fs[efi.num].uuid;
    if (!new RegExp(`UUID=${eu}\\s+${S.espAt.replace("/", "\\/")}\\s+vfat\\b`).test(text)) return false;
    return true;
  }

  function entryFiles() {
    return Object.keys(S.files).filter((f) => /^\/boot\/loader\/entries\/.+\.conf$/.test(f));
  }

  function parseEntry(text) {
    const rows = [];
    for (const line of (text || "").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const m = t.match(/^(title|linux|initrd|options)\s+(.+)$/);
      if (m) rows.push([m[1], m[2].trim()]);
    }
    return rows;
  }

  function kernelPaths() {
    if (S.kernel === "linux-lts") return { linux: "/vmlinuz-linux-lts", initrd: "/initramfs-linux-lts.img" };
    return { linux: "/vmlinuz-linux", initrd: "/initramfs-linux.img" };
  }

  function entryOk(text) {
    const rows = parseEntry(text);
    const kp = kernelPaths();
    const root = rootPart();
    if (!root || !S.fs[root.num]) return false;
    if (!rows.some(([k, v]) => k === "linux" && v === kp.linux)) return false;
    const initrds = rows.filter(([k]) => k === "initrd").map(([, v]) => v);
    if (!initrds.includes(kp.initrd)) return false;
    const opt = rows.filter(([k]) => k === "options").map(([, v]) => v).join(" ");
    const uuidOk = opt.includes("root=UUID=" + S.fs[root.num].uuid);
    const devOk = opt.includes("root=/dev/nvme0n1p" + root.num);
    if (!uuidOk && !devOk) return false;
    if (!/\brw\b/.test(opt)) return false;
    if (has("intel-ucode")) {
      const a = initrds.indexOf("/intel-ucode.img");
      const b = initrds.indexOf(kp.initrd);
      if (a < 0 || a > b) return false;
    }
    return true;
  }

  function loaderReady() {
    if (!S.sawS) return false;
    if (S.bootctlEfi && S.kernelOnEsp && entryFiles().some((f) => entryOk(S.files[f]))) return true;
    if (S.grubEfi && S.grubCfg && S.kernel) return true;
    return false;
  }

  function microReady() {
    if (!has("intel-ucode")) return false;
    if (S.bootctlEfi) return entryFiles().some((f) => entryOk(S.files[f]));
    if (S.grubEfi) return S.ucodeFresh;
    return false;
  }

  function netStackReady() {
    if (has("networkmanager") && S.enabled.includes("NetworkManager")) return true;
    if (has("iwd") && S.enabled.includes("iwd")) {
      const dhcp = (fileText("/etc/iwd/main.conf") || "").includes("EnableNetworkConfiguration=true");
      if (S.enabled.includes("systemd-networkd") || dhcp) return true;
    }
    return false;
  }

  function wheelSudo() {
    return (fileText("/etc/sudoers") || "").split("\n").some((l) => {
      const t = l.trim();
      return t === "%wheel ALL=(ALL:ALL) ALL" || t === "%wheel ALL=(ALL:ALL) NOPASSWD: ALL";
    });
  }

  function userReady() {
    return S.users.some((u) => u.pass && u.home && u.groups.includes("wheel")) && has("sudo") && wheelSudo();
  }

  function homeOf(user) {
    return user === "root" ? "/root" : "/home/" + user;
  }

  function xinitPath() {
    return homeOf(S.user) + "/.xinitrc";
  }

  function hasTerm() {
    return TERMS.some((t) => has(t)) || S.stInstalled;
  }

  const STEPS = [
    {
      id: "boot",
      title: "Boot média",
      wiki: "https://wiki.archlinux.org/title/Installation_guide#Boot_the_live_environment",
      goal: "Vypni Secure Boot a spusť Arch Linux install medium.",
      why: "Oficiální ISO Secure Boot neumí. Pro UEFI používá systemd-boot, pro BIOS syslinux. Po startu jsi root v Zsh, bez hesla.",
      hint: "Ve firmwaru dej Secure Boot na Disabled, Save & Exit, v menu první položku.",
      done: () => S.bootedIso,
    },
    {
      id: "keys",
      title: "Klávesnice",
      wiki: "https://wiki.archlinux.org/title/Linux_console/Keyboard_configuration#Loadkeys",
      goal: "Načti české rozložení. Nálepka na notebooku říká QWERTZ.",
      why: "Výchozí keymap live ISO je US. Seznam je localectl list-keymaps, nastavení loadkeys.",
      hint: "loadkeys cz-qwertz",
      done: () => CZECH_MAPS.includes(S.keymap),
    },
    {
      id: "uefi",
      title: "Režim UEFI",
      wiki: "https://wiki.archlinux.org/title/Installation_guide#Verify_the_boot_mode",
      goal: "Ověř, že stroj nabootoval v UEFI, ne v BIOS/CSM.",
      why: "Když soubor fw_platform_size nejde otevřít, běžíš v BIOS módu. 64 znamená 64bit UEFI.",
      hint: "cat /sys/firmware/efi/fw_platform_size",
      done: () => S.efiSeen,
    },
    {
      id: "net",
      title: "Síť v live ISO",
      wiki: "https://wiki.archlinux.org/title/Installation_guide#Connect_to_the_internet",
      goal: "Připoj Wi-Fi. Ethernet kabel tu není. Ověř spojení pingem.",
      why: "V ISO jsou iwd, systemd-networkd a systemd-resolved zapnuté. Na nainstalovaném systému to tak samo nebude. SSID a heslo jsou na routeru.",
      hint: "iwctl\nstation wlan0 scan\nstation wlan0 get-networks\nstation wlan0 connect arch-home\nheslo z nálepky\nexit\nping -c 3 ping.archlinux.org",
      done: () => S.net,
    },
    {
      id: "clock",
      title: "Hodiny",
      wiki: "https://wiki.archlinux.org/title/Installation_guide#Update_the_system_clock",
      goal: "Ověř, že jsou hodiny sesynchronizované.",
      why: "Špatný čas rozbije podpisy balíčků a TLS. V live ISO to dělá systemd-timesyncd, jakmile je síť.",
      hint: "timedatectl",
      done: () => S.clockSeen,
    },
    {
      id: "disk",
      title: "Najít disk",
      wiki: "https://wiki.archlinux.org/title/Installation_guide#Partition_the_disks",
      goal: "Najdi disk notebooku. Ignoruj loop, airootfs a instalační flashku.",
      why: "NVMe se jmenuje nvme0n1, flashka sdb/sda. Oddíly rpmb, boot0 a rom se nepoužívají.",
      hint: "lsblk\nfdisk -l",
      done: () => S.diskSeen,
    },
    {
      id: "parts",
      title: "Oddíly GPT",
      wiki: "https://wiki.archlinux.org/title/Installation_guide#Partition_the_disks",
      goal: "Založ GPT: EFI System, volitelně swap, a Linux root (x86-64) na zbytek disku.",
      why: "UEFI chce EFI System Partition. Wiki příklad má 1 GiB ESP, aspoň 4 GiB swap a zbytek pro /.",
      hint: "fdisk /dev/nvme0n1\ng\nn, Enter, Enter, +1G\nt, pak 1 (EFI System)\nn, Enter, Enter, +4G\nt, číslo oddílu, 19 (Linux swap)\nn, Enter, Enter, Enter\nt, číslo oddílu, 23 (Linux root x86-64)\nw\nPrázdný disk fdisk otevře jako DOS. Bez g bys psal MBR.",
      done: () => S.label === "gpt" && layoutReport().errors.length === 0,
    },
    {
      id: "fs",
      title: "Formát",
      wiki: "https://wiki.archlinux.org/title/Installation_guide#Format_the_partitions",
      goal: "ESP naformátuj na FAT32, root na ext4, swap inicializuj mkswap.",
      why: "ESP se smí formátovat jen když jsi ho právě založil. FAT32 je mkfs.fat -F 32. Příkaz wiki pro root je mkfs.ext4.",
      hint: "mkfs.fat -F 32 /dev/nvme0n1p1\nmkswap /dev/nvme0n1p2\nmkfs.ext4 /dev/nvme0n1p3\nČísla oddílů si ověř v lsblk. Nemusí sedět, když jsi je čísloval jinak.",
      done: () => fsReady(),
    },
    {
      id: "mount",
      title: "Připojení",
      wiki: "https://wiki.archlinux.org/title/Installation_guide#Mount_the_file_systems",
      goal: "Root připoj na /mnt, ESP na /mnt/boot, swap zapni swapon.",
      why: "Wiki příklad dává ESP na /boot, aby systemd-boot viděl jádro. mount --mkdir složku založí. Pořadí je root, potom ESP.",
      hint: "mount /dev/nvme0n1p3 /mnt\nmount --mkdir /dev/nvme0n1p1 /mnt/boot\nswapon /dev/nvme0n1p2",
      done: () => {
        const mounted = S.mounts["/mnt"] === rootPart()?.num;
        const swapOk = !swapPart() || S.swaps.includes(swapPart().num);
        return S.espAt === "/boot" && swapOk && (mounted || S.booted);
      },
    },
    {
      id: "strap",
      title: "pacstrap",
      wiki: "https://wiki.archlinux.org/title/Installation_guide#Install_essential_packages",
      goal: "Nainstaluj base, jádro a linux-firmware. Z live systému se kromě mirrorlistu nic nepřenese.",
      why: "Meta balíček base nemá nano, sudo ani síťový správce. -K inicializuje keyring v novém systému. CPU je Intel, firmware Wi-Fi je v linux-firmware.",
      hint: "pacstrap -K /mnt base linux linux-firmware intel-ucode networkmanager nano sudo",
      done: () => has("base") && !!S.kernel && has("linux-firmware"),
    },
    {
      id: "fstab",
      title: "fstab",
      wiki: "https://wiki.archlinux.org/title/Installation_guide#Fstab",
      goal: "Vygeneruj fstab s UUID a zkontroluj ho.",
      why: "genfstab zapíše připojené systémy a swap. Dvakrát spuštěný příkaz řádky zdvojí.",
      hint: "genfstab -U /mnt >> /mnt/etc/fstab\ncat /mnt/etc/fstab",
      done: () => fstabOk(),
    },
    {
      id: "chroot",
      title: "arch-chroot",
      wiki: "https://wiki.archlinux.org/title/Installation_guide#Chroot",
      goal: "Vstup do nového systému přes arch-chroot -S.",
      why: "Bez -S jede chroot v pid namespace a bootctl nezapíše UEFI proměnné. hostnamectl, localectl a timedatectl v chrootu nemají dbus.",
      hint: "arch-chroot -S /mnt",
      done: () => S.sawS,
    },
    {
      id: "tz",
      title: "Časová zóna",
      wiki: "https://wiki.archlinux.org/title/Installation_guide#Time",
      goal: "Nastav zónu Europe/Prague a zapiš hwclock.",
      why: "ln ukazuje /etc/localtime na zoneinfo. hwclock --systohc založí /etc/adjtime a čeká RTC v UTC.",
      hint: "ln -sf /usr/share/zoneinfo/Europe/Prague /etc/localtime\nhwclock --systohc",
      done: () => S.tz === "Europe/Prague" && S.hwclock,
    },
    {
      id: "locale",
      title: "Lokalizace",
      wiki: "https://wiki.archlinux.org/title/Installation_guide#Localization",
      goal: "Odkomentuj cs_CZ.UTF-8, spusť locale-gen a zapiš locale.conf i vconsole.conf.",
      why: "LANG bez vygenerovaného locale neplatí. KEYMAP v vconsole.conf udrží loadkeys i po restartu.",
      hint: "nano /etc/locale.gen\nlocale-gen\nprintf 'LANG=cs_CZ.UTF-8\\n' > /etc/locale.conf\nprintf 'KEYMAP=cz-qwertz\\n' > /etc/vconsole.conf\nKEYMAP musí sedět s tím, co jsi dal do loadkeys.",
      done: () => S.generated.includes("cs_CZ.UTF-8") && langNow() === "cs_CZ.UTF-8" && keymapFile() === S.keymap && CZECH_MAPS.includes(S.keymap),
    },
    {
      id: "host",
      title: "Hostname a síť",
      wiki: "https://wiki.archlinux.org/title/Installation_guide#Network_configuration",
      goal: "Dej stroji hostname a zapni síťovou službu, která po bootu opravdu poběží.",
      why: "hostname je 1–63 znaků, malá písmena, čísla a pomlčka. NetworkManager, nebo iwd spolu se systemd-networkd. Samotný balíček se po startu nezapne.",
      hint: "printf 'archbook\\n' > /etc/hostname\npacman -S networkmanager\nsystemctl enable NetworkManager",
      done: () => hostnameOk(hostnameNow()) && netStackReady(),
    },
    {
      id: "pass",
      title: "Heslo roota",
      wiki: "https://wiki.archlinux.org/title/Installation_guide#Root_password",
      goal: "Nastav heslo roota.",
      why: "Bez něj se do nového systému nepřihlásíš. passwd se ptá dvakrát.",
      hint: "passwd",
      done: () => !!S.rootPass,
    },
    {
      id: "loader",
      title: "Zavaděč",
      wiki: "https://wiki.archlinux.org/title/Systemd-boot",
      goal: "Nainstaluj systemd-boot nebo GRUB a udělej položku, která najde jádro.",
      why: "systemd-boot chce ESP na /boot a ruční soubor v /boot/loader/entries. Jádro i initrd jsou cesty od kořene ESP. GRUB je druhá platná volba.",
      hint: "bootctl install\nprintf '%s\\n' 'default arch.conf' 'timeout 4' > /boot/loader/loader.conf\nPoložku arch.conf slož podle blkid. linux /vmlinuz-linux, options root=UUID=… rw.\nKdyž je intel-ucode, první initrd je /intel-ucode.img a až potom /initramfs-linux.img.\nGRUB: pacman -S grub efibootmgr\ngrub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=GRUB\ngrub-mkconfig -o /boot/grub/grub.cfg",
      done: () => loaderReady(),
    },
    {
      id: "micro",
      title: "Mikrokód",
      wiki: "https://wiki.archlinux.org/title/Microcode",
      goal: "Nainstaluj intel-ucode a dej ho do zavaděče před hlavní initrd.",
      why: "cpuinfo říká GenuineIntel. amd-ucode je pro AMD. U systemd-boot musí být initrd mikrokódu první. GRUB ho vezme, když grub-mkconfig běží až po instalaci balíčku.",
      hint: "pacman -S intel-ucode\nV arch.conf:\ninitrd  /intel-ucode.img\ninitrd  /initramfs-linux.img\nU GRUB znovu grub-mkconfig -o /boot/grub/grub.cfg",
      done: () => microReady(),
    },
    {
      id: "reboot",
      title: "Restart",
      wiki: "https://wiki.archlinux.org/title/Installation_guide#Reboot",
      goal: "Odejdi z chrootu, restartuj a vytáhni flashku.",
      why: "USB je ve firmwaru výš než disk. Necháš-li ISO v portu, nabootuješ znovu archiso. exit ukončí chroot, reboot restartuje stroj.",
      hint: "exit\nreboot",
      done: () => S.booted,
    },
    {
      id: "net2",
      title: "Síť po restartu",
      wiki: "https://wiki.archlinux.org/title/NetworkManager",
      goal: "Znovu se připoj k arch-home. Profily z live ISO se do nového systému nekopírují.",
      why: "iwd v ISO uložil heslo k sobě, ne do instalace. Po bootu musí síťový správce běžet a síť se zadá znovu.",
      hint: "nmcli device wifi connect arch-home password wiki4life\nKdyž máš iwd: iwctl a station wlan0 connect arch-home",
      done: () => S.booted && S.systemOnline,
    },
    {
      id: "user",
      title: "Uživatel a sudo",
      wiki: "https://wiki.archlinux.org/title/Users_and_groups#User_management",
      goal: "Založ uživatele s home a skupinou wheel, dej mu heslo a povol sudo.",
      why: "Window manager se nespouští jako root. Skupina wheel smí sudo, jen když ve visudo odkomentuješ příslušný řádek.",
      hint: "useradd -m -G wheel -s /bin/bash tvojejmeno\npasswd tvojejmeno\nvisudo\nodkomentuj: %wheel ALL=(ALL:ALL) ALL",
      done: () => userReady(),
    },
    {
      id: "wm",
      title: "Window manager",
      wiki: "https://wiki.archlinux.org/title/Window_manager",
      goal: "Nainstaluj jeden window manager a spusť ho jako uživatel.",
      why: "i3, awesome, Openbox, bspwm a dwm jedou na X11. Sway a Hyprland jsou Wayland. dwm není v oficiálních repozitářích. GNOME a Plasma jsou desktopová prostředí, ne cíl téhle hry.",
      hint: "i3: pacman -S xorg-server xorg-xinit i3-wm xterm dmenu\njako uživatel: printf 'exec i3\\n' > ~/.xinitrc && startx\n\nSway: pacman -S sway foot wmenu && sway\n\nHyprland: pacman -S hyprland polkit && start-hyprland\n\nawesome: pacman -S xorg-server xorg-xinit awesome xterm\nprintf 'exec awesome\\n' > ~/.xinitrc && startx\n\nOpenbox: pacman -S xorg-server xorg-xinit openbox xterm\nprintf 'exec openbox-session\\n' > ~/.xinitrc && startx\n\nbspwm: pacman -S xorg-server xorg-xinit bspwm sxhkd xterm\nmkdir -p ~/.config/bspwm ~/.config/sxhkd\ncp /usr/share/doc/bspwm/examples/bspwmrc ~/.config/bspwm/\ncp /usr/share/doc/bspwm/examples/sxhkdrc ~/.config/sxhkd/\nchmod +x ~/.config/bspwm/bspwmrc\nprintf 'exec bspwm\\n' > ~/.xinitrc && startx\n\ndwm: pacman -S xorg-server xorg-xinit base-devel git libx11 libxft libxinerama\ngit clone https://git.suckless.org/dwm\ncd dwm && make && sudo make install\ngit clone https://git.suckless.org/st\ncd st && make && sudo make install\nprintf 'exec dwm\\n' > ~/.xinitrc && startx",
      done: () => !!S.wm,
    },
  ];

  function currentStep() {
    return STEPS.find((s) => !s.done()) || STEPS[STEPS.length - 1];
  }

  function render() {
    const cur = currentStep();
    const doneN = STEPS.filter((s) => s.done()).length;
    $("step-label").textContent = doneN + "/" + STEPS.length + " · " + cur.title;
    $("purity").textContent = "čistota " + Math.max(0, 100 - S.hints * 8);
    $("steps").innerHTML = "";
    for (const [i, step] of STEPS.entries()) {
      const li = document.createElement("li");
      const on = step.id === cur.id;
      li.className = step.done() ? "done" : on ? "on" : "";
      li.innerHTML = `<span class="n">${i + 1}</span>${step.done() ? "✓ " : ""}${step.title}`;
      $("steps").appendChild(li);
    }
    $("brief-title").textContent = cur.title;
    $("brief-text").textContent = cur.goal;
    $("brief-why").textContent = cur.why;
    $("brief-link").href = cur.wiki;
    const host = S.booted ? hostnameNow() || "archlinux" : "archiso";
    let shell = "zsh";
    if (S.env !== "live") shell = "bash";
    $("term-title").textContent = `${S.user}@${host} — ${shell}`;
    $("env-pill").textContent = S.env === "chroot" ? "chroot" : S.booted ? "system" : "live";
    $("prompt").textContent = promptText();
    const secret = ["pass", "pass2", "loginpass", "supass", "iwpass"].includes(S.mode);
    $("cmd").type = secret ? "password" : "text";
  }

  function promptText() {
    if (S.ask) return S.ask;
    const host = S.booted ? hostnameNow() || "archlinux" : "archiso";
    const cwd = S.cwd === homeOf(S.user) ? "~" : S.cwd;
    if (S.env === "live") return `root@${host} ${cwd} #`;
    const sig = S.user === "root" ? "#" : "$";
    return `[${S.user}@${host} ${cwd}]${sig}`;
  }

  function save() {
    try {
      const data = { ...S, mode: "shell", ask: null, fdisk: null, pending: null, pass1: null };
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* ignore quota */
    }
  }

  function normPath(p) {
    if (p === "~" || p.startsWith("~/")) p = homeOf(S.user) + p.slice(1);
    if (!p.startsWith("/")) p = (S.cwd === "/" ? "" : S.cwd) + "/" + p;
    const bits = [];
    for (const part of p.split("/")) {
      if (!part || part === ".") continue;
      if (part === "..") bits.pop();
      else bits.push(part);
    }
    return "/" + bits.join("/");
  }

  function parentOf(p) {
    if (p === "/") return "/";
    return p.replace(/\/[^/]+$/, "") || "/";
  }

  function baseDirs() {
    const d = new Set(["/", "/etc", "/boot", "/root", "/home", "/usr", "/var", "/tmp", "/etc/pacman.d", "/usr/bin", "/usr/share", "/usr/share/doc"]);
    if (has("base") || S.env === "live") {
      /* base dirs exist on the installed system only after pacstrap, except when addressing live */
    }
    return d;
  }

  function installedReady() {
    return has("base");
  }

  function dirExists(p) {
    if (p === "/") return true;
    if (S.dirs.includes(p)) return true;
    if (["/etc", "/boot", "/root", "/usr", "/var", "/tmp", "/etc/pacman.d", "/usr/bin"].includes(p)) return installedReady();
    if (p === "/home") return installedReady();
    if (p === "/boot/loader" || p === "/boot/loader/entries") return S.bootctlFiles || S.dirs.includes(p);
    if (p === "/usr/share/doc/bspwm" || p === "/usr/share/doc/bspwm/examples") return has("bspwm");
    if (p.startsWith("/home/")) {
      const segs = p.split("/").filter(Boolean);
      const u = S.users.find((x) => x.name === segs[1]);
      if (!u?.home) return false;
      if (segs.length === 2) return true;
      return S.dirs.includes(p);
    }
    if (S.repos && S.repos.includes(p)) return true;
    return false;
  }

  function resolveInstalled(path) {
    const n = normPath(path);
    if (S.env === "live") {
      if (n !== "/mnt" && !n.startsWith("/mnt/")) return { ok: false, live: n };
      if (S.mounts["/mnt"] == null) return { ok: false, err: "mount: /mnt není připojený root" };
      return { ok: true, sys: n === "/mnt" ? "/" : n.slice(4) };
    }
    return { ok: true, sys: n };
  }

  function ensureFileParent(sys) {
    return dirExists(parentOf(sys));
  }

  function putFile(sys, text) {
    S.files[sys] = text;
  }

  function partByDev(dev) {
    const m = /^\/dev\/nvme0n1p(\d+)$/.exec(dev);
    if (!m) return null;
    return S.parts.find((p) => p.num === Number(m[1])) || null;
  }

  function devOf(num) {
    return "/dev/nvme0n1p" + num;
  }

  function online() {
    return S.env === "system" ? S.systemOnline : S.net;
  }

  function expandPkgs(names) {
    const out = [];
    for (const n of names) {
      if (GROUPS[n]) out.push(...GROUPS[n]);
      else out.push(n);
    }
    return out;
  }

  function addPkgs(names, io, into) {
    const destName = into || (S.env === "live" ? "live" : "sys");
    const list = expandPkgs(names);
    for (const p of list) {
      if (!KNOWN.has(p) && !GROUPS[p]) {
        io.err("error: target not found: " + p);
        if (p === "st" || p === "dwm") io.note("Ten balíček v oficiálních repozitářích není. dwm a st se berou z git.suckless.org.");
        if (p === "yay") io.note("AUR helper v base není. Nejdřív bys ho musel sestavit, suckless projekty jde klonovat i bez něj.");
        return false;
      }
    }
    const dest = destName === "live" ? S.livePkgs : S.pkgs;
    for (const p of list) if (!dest.includes(p)) dest.push(p);
    if (destName !== "live") {
      if (list.includes("linux") && S.kernel === "linux-lts") S.kernel = "both";
      else if (list.includes("linux")) S.kernel = S.kernel || "linux";
      if (list.includes("linux-lts") && S.kernel === "linux") S.kernel = "both";
      else if (list.includes("linux-lts")) S.kernel = S.kernel || "linux-lts";
      if ((list.includes("linux") || list.includes("linux-lts")) && S.espAt === "/boot") S.kernelOnEsp = true;
      if (list.includes("intel-ucode")) S.ucodeFresh = false;
      if (list.includes("amd-ucode")) io.note("cpuinfo hlásí GenuineIntel. amd-ucode je balíček pro procesory AMD.");
    }
    return true;
  }

  function bootProblems() {
    const p = [];
    if (!has("base") || !S.kernel) p.push("Chybí base a jádro (pacstrap).");
    if (!S.rootPass) p.push("Není nastavené heslo roota.");
    if (!S.sawS) p.push("arch-chroot neběžel s -S, takže UEFI položka nevznikla.");
    if (!(S.bootctlEfi || S.grubEfi)) p.push("Zavaděč nezapsal EFI položku (bootctl install nebo grub-install).");
    if (S.bootctlEfi && !S.kernelOnEsp) p.push("systemd-boot nemá jádro na ESP. ESP musí být připojený na /boot ve chvíli, kdy se instaluje linux.");
    if (S.bootctlEfi && !entryFiles().some((f) => entryOk(S.files[f]))) p.push("Žádná položka v /boot/loader/entries/*.conf nemá linux, initrd a root=UUID=… rw.");
    if (S.grubEfi && !S.grubCfg) p.push("Chybí grub-mkconfig -o /boot/grub/grub.cfg.");
    return p;
  }

  function serviceActive(name) {
    if (!S.booted) return false;
    return S.enabled.includes(name) || S.started.includes(name);
  }

  function sudoersSyntax(text) {
    let wheel = false;
    for (const line of text.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      if (t === "root ALL=(ALL:ALL) ALL") continue;
      if (t === "%wheel ALL=(ALL:ALL) ALL" || t === "%wheel ALL=(ALL:ALL) NOPASSWD: ALL") {
        wheel = true;
        continue;
      }
      return { ok: false, wheel: false };
    }
    return { ok: true, wheel };
  }

  function ioPair() {
    const stdout = [];
    return {
      stdout,
      log: (s) => stdout.push(String(s)),
      err: (s) => out(s, "err"),
      note: (s) => out(s, "note"),
      ok: (s) => out(s, "ok"),
    };
  }

  function writeOut(redir, stdout) {
    const text = stdout.length ? stdout.join("\n") + "\n" : "";
    if (!redir) {
      stdout.forEach((line) => out(line));
      return true;
    }
    const target = redir.target.replace(/^['"]|['"]$/g, "");
    const res = resolveInstalled(target);
    if (!res.ok) {
      if (res.live === "/etc/pacman.d/mirrorlist") {
        out("mirrorlist live ISO se edituje jiným příkazem (reflector).", "err");
        return false;
      }
      out(res.err || "bash: " + target + ": nelze zapsat z live systému mimo /mnt", "err");
      return false;
    }
    if (!installedReady()) {
      out("bash: " + target + ": No such file or directory", "err");
      return false;
    }
    if (!ensureFileParent(res.sys)) {
      out("bash: " + target + ": No such file or directory", "err");
      return false;
    }
    if (redir.op === ">>") putFile(res.sys, (fileText(res.sys) || "") + text);
    else putFile(res.sys, text);
    return true;
  }

  function splitAnd(line) {
    const parts = [];
    let buf = "";
    let q = null;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) {
        buf += c;
        if (c === q) q = null;
        continue;
      }
      if (c === "'" || c === '"') {
        q = c;
        buf += c;
        continue;
      }
      if (c === "&" && line[i + 1] === "&") {
        parts.push(buf.trim());
        buf = "";
        i++;
        continue;
      }
      buf += c;
    }
    if (buf.trim()) parts.push(buf.trim());
    return parts;
  }

  function tokenize(line) {
    const outTok = [];
    let cur = "";
    let q = null;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) {
        if (c === q) q = null;
        else cur += c;
        continue;
      }
      if (c === "'" || c === '"') {
        q = c;
        continue;
      }
      if (/\s/.test(c)) {
        if (cur) outTok.push(cur);
        cur = "";
        continue;
      }
      cur += c;
    }
    if (cur) outTok.push(cur);
    return outTok;
  }

  function splitRedirect(line) {
    let q = null;
    let buf = "";
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) {
        buf += c;
        if (c === q) q = null;
        continue;
      }
      if (c === "'" || c === '"') {
        q = c;
        buf += c;
        continue;
      }
      if (c === ">" && line[i + 1] === ">") return { cmd: buf.trim(), redir: { op: ">>", target: line.slice(i + 2).trim() } };
      if (c === ">") return { cmd: buf.trim(), redir: { op: ">", target: line.slice(i + 1).trim() } };
      buf += c;
    }
    return { cmd: buf.trim(), redir: null };
  }

  function unescapeFmt(s) {
    return s.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
  }

  async function runLine(raw) {
    if (busy) return;
    busy = true;
    try {
      const line = String(raw).replace(/\s+$/, "");
      const secret = ["pass", "pass2", "loginpass", "supass", "iwpass"].includes(S.mode);
      if (S.mode === "shell" && !line) return;
      if (!secret) out(promptText() + (line ? " " + line : ""), "cmd");
      else out(promptText() + " ********", "cmd");

      if (S.mode === "fdisk") return fdiskLine(line);
      if (S.mode === "iwctl") return iwctlLine(line);
      if (S.mode === "iwpass") return iwPass(line);
      if (S.mode === "pass" || S.mode === "pass2") return passLine(line);
      if (S.mode === "login" || S.mode === "loginpass") return loginLine(line);
      if (S.mode === "supass") {
        await suPassLine(line);
        return;
      }

      if (S.mode === "shell" && line) {
        S.history.push(line);
        S.hpos = S.history.length;
        S.cmds += 1;
      }
      for (const part of splitAnd(line)) {
        const ok = await execOne(part);
        if (!ok) break;
      }
    } finally {
      busy = false;
      render();
      save();
    }
  }

  async function execOne(line) {
    const { cmd, redir } = splitRedirect(line);
    const argv = tokenize(cmd);
    if (!argv.length) return true;
    if (argv[0] === "sudo") return sudoWrap(argv.slice(1), redir);
    const io = ioPair();
    const ok = await dispatch(argv, io, false);
    if (ok) writeOut(redir, io.stdout);
    return ok;
  }

  async function sudoWrap(argv, redir) {
    if (!argv.length) {
      out("usage: sudo příkaz", "err");
      return false;
    }
    if (S.user !== "root") {
      if (!has("sudo")) {
        out("sudo: command not found", "err");
        out("poznámka: pacman -S sudo", "note");
        return false;
      }
      const u = S.users.find((x) => x.name === S.user);
      if (!u || !u.groups.includes("wheel") || !wheelSudo()) {
        out(S.user + " is not in the sudoers file.", "err");
        return false;
      }
      if (!S.sudoCached) {
        S.mode = "supass";
        S.pending = { argv, redir };
        S.ask = "[sudo] password for " + S.user + ":";
        return true;
      }
    }
    const io = ioPair();
    const prev = S.user;
    S.user = "root";
    const ok = await dispatch(argv, io, true);
    S.user = prev;
    if (ok) writeOut(redir, io.stdout);
    return ok;
  }

  async function dispatch(argv, io, asRoot) {
    const c = argv[0];
    if (c === "help") return help(io);
    if (c === "hint") return hintCmd();
    if (c === "clear") {
      $("output").textContent = "";
      return true;
    }
    if (c === "pwd") {
      io.log(S.cwd);
      return true;
    }
    if (c === "whoami") {
      io.log(asRoot ? "root" : S.user);
      return true;
    }
    if (c === "hostname") {
      io.log(S.booted ? hostnameNow() || "archlinux" : "archiso");
      return true;
    }
    if (c === "date" || c === "uname") return tinyInfo(c, io);
    if (c === "history") {
      S.history.forEach((h, i) => io.log(String(i + 1) + "  " + h));
      return true;
    }
    if (c === "man") return man(argv, io);
    if (c === "cd") return cd(argv, io);
    if (c === "ls") return ls(argv, io);
    if (c === "lsblk") return lsblk(io);
    if (c === "cat") return cat(argv, io);
    if (c === "echo") {
      const args = argv[1] === "-n" ? argv.slice(2) : argv.slice(1);
      io.log(args.join(" "));
      return true;
    }
    if (c === "printf") return printfCmd(argv, io);
    if (c === "mkdir") return mkdir(argv, io);
    if (c === "cp") return cp(argv, io);
    if (c === "chmod") return chmod(argv, io);
    if (c === "ln") return ln(argv, io);
    if (c === "sed") return sed(argv, io);
    if (c === "loadkeys") return loadkeys(argv, io);
    if (c === "localectl") return localectl(argv, io);
    if (c === "setfont") {
      io.log("");
      return true;
    }
    if (c === "ip") return ip(io);
    if (c === "ping") return ping(argv, io);
    if (c === "timedatectl" || c === "hostnamectl") return timedatectl(c, io);
    if (c === "iwctl") return iwctl(argv, io);
    if (c === "rfkill") {
      io.log("0: phy0: Wireless LAN");
      io.log("        Soft blocked: no");
      io.log("        Hard blocked: no");
      return true;
    }
    if (c === "fdisk") return fdisk(argv, io);
    if (c === "mkfs.fat" || c === "mkfs.vfat") return mkfsFat(argv, io);
    if (c === "mkfs.ext4" || c === "mkfs.btrfs" || c === "mkfs.xfs") return mkfsUnix(c, argv, io);
    if (c === "mkswap") return mkswap(argv, io);
    if (c === "mount") return mount(argv, io);
    if (c === "umount") return umount(argv, io);
    if (c === "swapon") return swapon(argv, io);
    if (c === "blkid") return blkid(argv, io);
    if (c === "pacstrap") return pacstrap(argv, io);
    if (c === "genfstab") return genfstab(argv, io);
    if (c === "arch-chroot") return archChroot(argv, io);
    if (c === "pacman") return pacman(argv, io);
    if (c === "reflector") return reflector(argv, io);
    if (c === "locale-gen") return localeGen(io);
    if (c === "hwclock") return hwclock(argv, io);
    if (c === "passwd") return passwd(argv, io);
    if (c === "useradd") return useradd(argv, io);
    if (c === "usermod") return usermod(argv, io);
    if (c === "bootctl") return bootctl(argv, io);
    if (c === "systemctl") return systemctl(argv, io);
    if (c === "grub-install") return grubInstall(argv, io);
    if (c === "grub-mkconfig") return grubMkconfig(argv, io);
    if (c === "nano" || c === "vim" || c === "vi" || c === "visudo") return edit(c, argv, io);
    if (c === "exit" || c === "logout") return exitCmd(io);
    if (c === "reboot") return reboot(io);
    if (c === "su") return su(argv, io);
    if (c === "nmcli") return nmcli(argv, io);
    if (c === "git") return git(argv, io);
    if (c === "make") return make(argv, io, asRoot);
    if (c === "startx") return startx(io);
    if (c === "sway") return startSway(io);
    if (c === "start-hyprland" || c === "Hyprland") return startHypr(c, io);
    io.err("zsh: command not found: " + c);
    return false;
  }

  function help(io) {
    io.log("Instalace Arch Linuxu v tomhle notebooku.");
    io.log("Příkazy jsou ty z ArchWiki. hint ukáže příkaz k aktuálnímu kroku a ubere čistotu.");
    io.log("Tab doplňuje, šipky berou historii, Ctrl+L maže obrazovku.");
    return true;
  }

  function hintCmd() {
    const step = currentStep();
    S.hints += 1;
    out("— " + step.title + " —", "note");
    for (const line of step.hint.split("\n")) out(line, "note");
    out(step.wiki, "dim");
    return true;
  }

  function tinyInfo(c, io) {
    if (c === "date") {
      io.log(new Date().toString());
      return true;
    }
    const host = S.booted ? hostnameNow() || "archlinux" : "archiso";
    io.log(`Linux ${host} 7.2.2-arch1-1 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux`);
    return true;
  }

  function man(argv, io) {
    const page = argv[1] || "";
    const pages = {
      bootctl: "bootctl install zapíše systemd-boot na ESP (/efi, /boot nebo /boot/efi).",
      pacstrap: "pacstrap -K /mnt balíčky  — -K inicializuje pacman keyring v novém systému.",
      genfstab: "genfstab -U /mnt vypíše fstab s UUID. Přesměruj ho do /mnt/etc/fstab.",
      "arch-chroot": "arch-chroot -S /mnt spustí v chrootu systemd, aby šly UEFI proměnné.",
      loadkeys: "loadkeys cz-qwertz načte rozložení do aktuální konzole. Natrvalo je vconsole.conf.",
      iwctl: "iwctl je klient k iwd. station wlan0 connect SSID se zeptá na heslo.",
      fdisk: "fdisk /dev/nvme0n1  — g založí GPT, n oddíl, t typ, w zapíše.",
      "mkfs.fat": "mkfs.fat -F 32 zařízení  — FAT32 pro EFI System Partition.",
      hwclock: "hwclock --systohc zapíše /etc/adjtime. Předtím nastav localtime.",
    };
    if (!pages[page]) {
      io.err("No manual entry for " + (page || "(prázdné)"));
      return false;
    }
    io.log(pages[page]);
    return true;
  }

  function cd(argv, io) {
    const dest = normPath(argv[1] || homeOf(S.user));
    if (dest === homeOf(S.user) || dest === "/" || dest === "/root" || dest === "/tmp" || dest === "/mnt" || dest === "/etc" || dest === "/boot") {
      if ((dest === "/etc" || dest === "/boot" || dest === "/root") && S.env !== "live" && !installedReady()) {
        io.err("cd: " + dest + ": No such file or directory");
        return false;
      }
      S.cwd = dest === "/mnt" && S.env === "live" ? "/mnt" : dest;
      return true;
    }
    if (dirExists(S.env === "live" && dest.startsWith("/mnt/") ? dest.slice(4) : dest) || (S.repos || []).includes(dest)) {
      S.cwd = dest;
      return true;
    }
    if ((S.repos || []).some((r) => dest.startsWith(r))) {
      S.cwd = dest;
      return true;
    }
    io.err("cd: no such file or directory: " + dest);
    return false;
  }

  function ls(argv, io) {
    const target = normPath(argv.find((a) => !a.startsWith("-")) || S.cwd);
    const sys = S.env === "live" && target.startsWith("/mnt") ? (target === "/mnt" ? "/" : target.slice(4)) : target;
    if (target === "/sys/firmware/efi" || target === "/sys/firmware/efi/fw_platform_size") {
      io.log("fw_platform_size");
      return true;
    }
    const names = new Set();
    if (sys === "/" || target === "/") ["boot", "etc", "home", "root", "mnt", "usr", "var", "tmp"].forEach((n) => names.add(n));
    if (sys === "/etc" && installedReady()) {
      Object.keys(S.files).forEach((f) => {
        if (f.startsWith("/etc/")) names.add(f.slice(5).split("/")[0]);
      });
      ["locale.gen", "sudoers", "fstab", "pacman.d"].forEach((n) => names.add(n));
    }
    if (sys === "/boot" && installedReady()) {
      if (S.kernelOnEsp || S.kernel) {
        const kp = kernelPaths();
        names.add(kp.linux.slice(1));
        names.add(kp.initrd.slice(1));
        names.add("initramfs-linux-fallback.img");
      }
      if (has("intel-ucode")) names.add("intel-ucode.img");
      if (S.bootctlFiles) names.add("EFI");
      if (S.bootctlFiles || S.dirs.includes("/boot/loader")) names.add("loader");
      if (S.grubCfg) names.add("grub");
    }
    if (sys === "/boot/loader" && (S.bootctlFiles || dirExists("/boot/loader"))) {
      names.add("entries");
      if (fileText("/boot/loader/loader.conf") != null) names.add("loader.conf");
    }
    if (sys === "/boot/loader/entries" && dirExists("/boot/loader/entries")) {
      entryFiles().forEach((f) => names.add(f.split("/").pop()));
    }
    if (sys === "/home" && installedReady()) S.users.forEach((u) => u.home && names.add(u.name));
    if (sys.startsWith("/home/") && dirExists(sys)) {
      Object.keys(S.files).forEach((f) => {
        if (f.startsWith(sys + "/")) names.add(f.slice(sys.length + 1).split("/")[0]);
      });
    }
    (S.repos || []).forEach((r) => {
      if (parentOf(r) === target || parentOf(r) === sys) names.add(r.split("/").pop());
    });
    if (!names.size && target !== S.cwd && !dirExists(sys) && target !== "/mnt") {
      io.err("ls: cannot access '" + target + "': No such file or directory");
      return false;
    }
    io.log([...names].sort().join("  ") || "");
    return true;
  }

  function lsblk(io) {
    S.diskSeen = true;
    io.log("NAME          SIZE   TYPE FSTYPE  MOUNTPOINTS");
    io.log("loop0       820.4M   loop         /run/archiso/airootfs");
    io.log("sda          14.9G   disk");
    io.log("`-sda1       14.9G   part iso9660 /run/archiso/bootmnt");
    io.log("nvme0n1     476.9G   disk");
    const parts = [...S.parts].sort((a, b) => a.num - b.num);
    parts.forEach((p, idx) => {
      const branch = idx === parts.length - 1 ? "`-" : "|-";
      const fs = S.fs[p.num];
      const kind = fs ? fs.kind : "";
      let mnt = "";
      if (S.booted) {
        if (rootPart() && p.num === rootPart().num) mnt = "/";
        if (efiPart() && p.num === efiPart().num) mnt = S.espAt || "";
        if (S.swaps.includes(p.num)) mnt = "[SWAP]";
      } else {
        for (const [dest, num] of Object.entries(S.mounts)) if (num === p.num) mnt = dest;
        if (S.swaps.includes(p.num)) mnt = "[SWAP]";
      }
      io.log(branch + "nvme0n1p" + p.num + "  " + human(p.sizeMiB).padStart(6) + "   part " + kind.padEnd(7) + " " + mnt);
    });
    return true;
  }

  function cat(argv, io) {
    const path = argv[1];
    if (!path) {
      io.err("cat: missing operand");
      return false;
    }
    const n = normPath(path);
    if (S.env === "live" && (n === "/sys/firmware/efi/fw_platform_size" || n === "/sys/firmware/efi/fw_platform_size/")) {
      S.efiSeen = true;
      io.log("64");
      return true;
    }
    if (n === "/proc/cpuinfo" || n.endsWith("/cpuinfo")) {
      io.log(CPUINFO.trimEnd());
      return true;
    }
    if (S.env === "live" && n === "/etc/pacman.d/mirrorlist") {
      io.log((S.mirror || "Server = https://mirror.archlinux.org/$repo/os/$arch").trimEnd());
      return true;
    }
    const res = resolveInstalled(n);
    if (!res.ok) {
      io.err("cat: " + path + ": No such file or directory");
      return false;
    }
    if (res.sys === "/etc/localtime" && S.tz) {
      io.log("symbolic link to /usr/share/zoneinfo/" + S.tz);
      return true;
    }
    const text = fileText(res.sys);
    if (text == null) {
      if (["/vmlinuz-linux", "/vmlinuz-linux-lts", "/initramfs-linux.img", "/intel-ucode.img"].some((b) => res.sys.endsWith(b))) {
        io.err("cat: " + path + ": binary file matches");
        return false;
      }
      io.err("cat: " + path + ": No such file or directory");
      return false;
    }
    text.replace(/\n$/, "").split("\n").forEach((l) => io.log(l));
    return true;
  }

  function printfCmd(argv, io) {
    if (!argv[1]) {
      io.err("printf: missing operand");
      return false;
    }
    const fmt = unescapeFmt(argv[1]);
    if (argv[1].includes("%s")) {
      const vals = argv.slice(2);
      const use = vals.length ? vals : [""];
      for (const v of use) io.log(fmt.replace(/%s/g, v).replace(/\n$/, ""));
      return true;
    }
    const chunks = fmt.split("\n");
    chunks.forEach((line, i) => {
      if (i === chunks.length - 1 && line === "") return;
      io.log(line);
    });
    return true;
  }

  function mkdir(argv, io) {
    const pFlag = argv.includes("-p");
    const paths = argv.slice(1).filter((a) => a !== "-p");
    if (!paths.length) {
      io.err("mkdir: missing operand");
      return false;
    }
    for (const raw of paths) {
      const res = resolveInstalled(raw);
      const sys = res.ok ? res.sys : null;
      if (!sys) {
        io.err("mkdir: nelze založit " + raw + " mimo nový systém");
        return false;
      }
      if (!installedReady() && sys !== "/mnt") {
        io.err("mkdir: " + raw + ": No such file or directory");
        return false;
      }
      const chain = [];
      let cur = sys;
      while (cur !== "/") {
        chain.unshift(cur);
        cur = parentOf(cur);
      }
      for (const d of chain) {
        if (dirExists(d)) continue;
        if (!pFlag && d !== sys) {
          io.err("mkdir: cannot create directory ‘" + raw + "’: No such file or directory");
          return false;
        }
        if (!dirExists(parentOf(d)) && !pFlag) {
          io.err("mkdir: cannot create directory ‘" + raw + "’: No such file or directory");
          return false;
        }
        S.dirs.push(d);
      }
    }
    return true;
  }

  function cp(argv, io) {
    const src = argv[1];
    const dst = argv[2];
    if (!src || !dst) {
      io.err("cp: missing operand");
      return false;
    }
    const examples = {
      "/usr/share/doc/bspwm/examples/bspwmrc": "#! /bin/sh\npgrep -x sxhkd > /dev/null || sxhkd &\nbspc monitor -d 1 2 3 4 5 6\n",
      "/usr/share/doc/bspwm/examples/sxhkdrc": "super + Return\n\txterm\nsuper + shift + q\n\tbspc quit\n",
      "/etc/sway/config": "set $term foot\nset $menu wmenu-run\nbindsym Mod4+Return exec $term\nbindsym Mod4+d exec $menu\n",
    };
    if (src === "/usr/share/doc/bspwm/examples/bspwmrc" || src === "/usr/share/doc/bspwm/examples/sxhkdrc") {
      if (!has("bspwm")) {
        io.err("cp: cannot stat '" + src + "': No such file or directory");
        return false;
      }
    }
    if (src === "/etc/sway/config" && !has("sway")) {
      io.err("cp: cannot stat '" + src + "': No such file or directory");
      return false;
    }
    if (!examples[src]) {
      const from = resolveInstalled(src);
      if (!from.ok || fileText(from.sys) == null) {
        io.err("cp: cannot stat '" + src + "': No such file or directory");
        return false;
      }
      examples[src] = fileText(from.sys);
    }
    let destPath = normPath(dst);
    if (destPath.endsWith("/")) destPath += src.split("/").pop();
    else if (dirExists(S.env === "live" ? destPath : destPath) && S.dirs.includes(destPath)) destPath = destPath.replace(/\/?$/, "/") + src.split("/").pop();
    if (S.dirs.includes(normPath(dst)) || dst.endsWith("/")) {
      destPath = normPath(dst).replace(/\/?$/, "/") + src.split("/").pop();
    }
    const res = resolveInstalled(destPath);
    if (!res.ok) {
      io.err("cp: cannot create '" + dst + "'");
      return false;
    }
    if (!dirExists(parentOf(res.sys))) {
      io.err("cp: cannot create regular file '" + dst + "': No such file or directory");
      return false;
    }
    putFile(res.sys, examples[src]);
    return true;
  }

  function chmod(argv, io) {
    if (argv[1] !== "+x" || !argv[2]) {
      io.err("chmod: v téhle hře je potřeba chmod +x soubor");
      return false;
    }
    const res = resolveInstalled(argv[2]);
    if (!res.ok || fileText(res.sys) == null) {
      io.err("chmod: cannot access '" + argv[2] + "'");
      return false;
    }
    S.exec[res.sys] = true;
    return true;
  }

  function ln(argv, io) {
    const args = argv.slice(1).filter((a) => a !== "-sf" && a !== "-s" && a !== "-f");
    if (args.length < 2) {
      io.err("ln: missing operand");
      return false;
    }
    const target = args[0];
    const link = args[1];
    const m = /^\/usr\/share\/zoneinfo\/(.+)$/.exec(target);
    if (!m || normPath(link) !== "/etc/localtime" && resolveInstalled(link).sys !== "/etc/localtime") {
      io.err("ln: tady se čeká odkaz zoneinfo na /etc/localtime");
      return false;
    }
    if (!ZONES.includes(m[1])) {
      io.err("ln: failed to create symbolic link '/etc/localtime': No such file or directory");
      io.note("Cesta je /usr/share/zoneinfo/Area/Location. Notebook je v Praze.");
      return false;
    }
    if (S.env === "live") {
      io.err("ln: v live systému bys přepsal hodiny ISO. Tohle patří do chrootu.");
      return false;
    }
    S.tz = m[1];
    if (m[1] !== "Europe/Prague") io.note("Zóna je platná. Stroj je v Praze, wiki příklad pro tohle místo je Europe/Prague.");
    return true;
  }

  function sed(argv, io) {
    let expr = null;
    let file = null;
    const inplace = argv.includes("-i");
    for (const a of argv.slice(1)) {
      if (a === "-i") continue;
      if (a.startsWith("s")) expr = a;
      else file = a;
    }
    if (!expr || !file) {
      io.err("sed: usage sed -i 's/původní/nové/' soubor");
      return false;
    }
    const res = resolveInstalled(file);
    if (!res.ok || fileText(res.sys) == null) {
      io.err("sed: can't read " + file);
      return false;
    }
    const d = expr[1];
    const body = expr.slice(2);
    const i = body.indexOf(d);
    const j = body.lastIndexOf(d);
    if (i < 0 || j <= i) {
      io.err("sed: unmatched");
      return false;
    }
    const pat = body.slice(0, i);
    const rep = body.slice(i + 1, j);
    let next = fileText(res.sys);
    try {
      next = next.replace(new RegExp(pat, "g"), rep);
    } catch {
      next = next.split(pat).join(rep);
    }
    if (!inplace) io.log(next.replace(/\n$/, ""));
    else putFile(res.sys, next);
    return true;
  }

  function loadkeys(argv, io) {
    const name = argv[1];
    if (!name) {
      io.err("usage: loadkeys mapa");
      return false;
    }
    if (!KEYMAPS.includes(name)) {
      io.err("loadkeys: couldn't get a file descriptor referring to console");
      io.note("Neznámá mapa. localectl list-keymaps");
      return false;
    }
    S.keymap = name;
    if (name === "us") io.note("US je výchozí mapa ISO. Fyzická klávesnice je CZ QWERTZ.");
    if (name === "cz-qwerty") io.note("cz-qwerty je české QWERTY. Nálepka notebooku říká QWERTZ, tedy cz-qwertz.");
    return true;
  }

  function localectl(argv, io) {
    if (S.env === "chroot") {
      io.err("Failed to connect to bus: No such file or directory");
      io.note("V chrootu localectl, timedatectl a hostnamectl nemají dbus. Wiki proto používá loadkeys, ln a /etc/hostname.");
      return false;
    }
    if (argv[1] === "list-keymaps") {
      KEYMAPS.forEach((k) => io.log(k));
      return true;
    }
    if (argv[1] === "set-keymap" && argv[2]) return loadkeys(["loadkeys", argv[2]], io);
    io.err("localectl: list-keymaps | set-keymap mapa");
    return false;
  }

  function ip(io) {
    io.log("1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN");
    io.log("2: enp0s31f6: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc fq_codel state DOWN");
    io.log("    link/ether 3c:7c:3f:11:20:01 brd ff:ff:ff:ff:ff:ff");
    const st = S.wifi || S.systemOnline ? "UP" : "DOWN";
    io.log("3: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state " + st);
    io.log("    link/ether 58:cd:c9:10:ab:21 brd ff:ff:ff:ff:ff:ff");
    return true;
  }

  function ping(argv, io) {
    const liveNet = S.env === "system" ? S.systemOnline : S.wifi;
    if (!liveNet) {
      io.err("ping: ping.archlinux.org: Temporary failure in name resolution");
      io.note("Síť neběží. V live ISO je iwd, kabel v enp0s31f6 není.");
      return false;
    }
    io.log("PING ping.archlinux.org (95.217.192.200) 56(84) bytes of data.");
    io.log("64 bytes from ping.archlinux.org (95.217.192.200): icmp_seq=1 ttl=54 time=18.2 ms");
    io.log("64 bytes from ping.archlinux.org (95.217.192.200): icmp_seq=2 ttl=54 time=17.9 ms");
    io.log("64 bytes from ping.archlinux.org (95.217.192.200): icmp_seq=3 ttl=54 time=18.4 ms");
    io.log("--- ping.archlinux.org ping statistics ---");
    io.log("3 packets transmitted, 3 received, 0% packet loss");
    if (S.env !== "system") S.net = true;
    void argv;
    return true;
  }

  function timedatectl(cmd, io) {
    if (S.env === "chroot") {
      io.err("Failed to connect to bus: No such file or directory");
      io.note("V chrootu " + cmd + " nefunguje. Hodiny se v live systému jen ověří, zóna se nastaví přes ln a hwclock.");
      return false;
    }
    if (cmd === "hostnamectl") {
      io.log("Static hostname: " + (S.booted ? hostnameNow() || "archlinux" : "archiso"));
      io.log("Icon name: computer-laptop");
      io.log("Chassis: laptop");
      return true;
    }
    const sync = S.env === "system" ? S.systemOnline : S.net;
    io.log("               Local time: " + new Date().toLocaleString("cs-CZ"));
    io.log("           Universal time: " + new Date().toISOString());
    io.log("                 RTC time: " + new Date().toISOString());
    io.log("                Time zone: " + (S.tz || "UTC") + (S.tz === "Europe/Prague" ? " (CEST, +0200)" : " (UTC, +0000)"));
    io.log("System clock synchronized: " + (sync ? "yes" : "no"));
    io.log("              NTP service: active");
    io.log("          RTC in local TZ: no");
    if (sync && S.env !== "system") S.clockSeen = true;
    else if (!sync) io.note("Ještě není síť, timesyncd nemá z čeho srovnat hodiny.");
    return true;
  }

  function iwctl(argv, io) {
    if (argv.length === 1) {
      if (S.env === "chroot") {
        io.note("iwd démon z ISO v chrootu neběží. Síť live systému chroot sdílí, po rebootu zmizí.");
      }
      if (S.env === "system" && !serviceActive("iwd")) {
        io.err("Waiting for iwd to start...");
        io.note("systemctl enable --now iwd, nebo jsi zapnul NetworkManager a pak je na řadě nmcli.");
        return false;
      }
      S.mode = "iwctl";
      S.ask = "[iwd]#";
      io.note("Interactive prompt. exit se vrátí do shellu.");
      return true;
    }
    return iwctlArgs(argv.slice(1), io);
  }

  function iwctlArgs(args, io) {
    if (args[0] === "--passphrase" || (args[0] || "").startsWith("--passphrase=")) {
      const pass = args[0].startsWith("--passphrase=") ? args[0].slice(13) : args[1];
      const rest = args[0].startsWith("--passphrase=") ? args.slice(1) : args.slice(2);
      if (pass !== "wiki4life") {
        io.err("Operation failed");
        return false;
      }
      return connectWifi(rest, io);
    }
    if (args.join(" ") === "device list") {
      io.log("                                    Name                Address             Powered");
      io.log("                                    wlan0               58:cd:c9:10:ab:21   on");
      return true;
    }
    if (args.join(" ") === "station wlan0 scan") {
      io.log("");
      return true;
    }
    if (args.join(" ") === "station wlan0 get-networks") {
      io.log("                               Network name                    Security");
      io.log("                               arch-home                       psk");
      io.log("                               soused-5G                       psk");
      return true;
    }
    if (args[0] === "station" && args[1] === "wlan0" && args[2] === "connect") {
      S.mode = "iwpass";
      S.ask = "Passphrase:";
      S.pending = args[3] || "";
      return true;
    }
    io.err("iwctl: neznámý příkaz. device list | station wlan0 scan | get-networks | connect");
    return false;
  }

  function connectWifi(args, io) {
    const ssid = args[3];
    if (args[0] !== "station" || args[2] !== "connect") {
      io.err("iwctl: station wlan0 connect SSID");
      return false;
    }
    if (ssid !== "arch-home") {
      io.err("Not found");
      return false;
    }
    if (S.env === "system") {
      const dhcp = (fileText("/etc/iwd/main.conf") || "").includes("EnableNetworkConfiguration=true");
      if (!S.enabled.includes("systemd-networkd") && !S.started.includes("systemd-networkd") && !dhcp) {
        io.note("iwd je připojené, adresu nikdo nedal. Zapni systemd-networkd, nebo v /etc/iwd/main.conf nastav EnableNetworkConfiguration=true.");
        S.wifi = true;
        return true;
      }
      S.systemOnline = true;
    }
    S.wifi = true;
    io.ok("připojeno k arch-home");
    return true;
  }

  function iwctlLine(line) {
    const t = line.trim();
    if (t === "exit" || t === "quit") {
      S.mode = "shell";
      S.ask = null;
      return;
    }
    const io = ioPair();
    iwctlArgs(tokenize(t), io);
    io.stdout.forEach((l) => out(l));
  }

  function iwPass(line) {
    S.mode = S.ask === "[iwd]#" || S.mode === "iwpass" ? "iwctl" : "shell";
    const back = S.mode === "iwctl";
    S.mode = back ? "iwctl" : "shell";
    S.ask = back ? "[iwd]#" : null;
    if (line !== "wiki4life") {
      out("Operation failed", "err");
      return;
    }
    const io = ioPair();
    connectWifi(["station", "wlan0", "connect", S.pending || "arch-home"], io);
    io.stdout.forEach((l) => out(l));
    if (!back) S.mode = "shell";
  }

  function fdisk(argv, io) {
    if (argv.includes("-l")) {
      S.diskSeen = true;
      io.log("Disk /dev/sda: 14.9 GiB, USB DISK");
      io.log("Disk /dev/nvme0n1: 476.94 GiB, 512110190592 bytes, 1000215216 sectors");
      io.log("Disk model: ARCHBOOK-NVMe-512");
      if (S.label) {
        printParts(S.label, S.parts, io);
      } else io.log("Disklabel type: (žádná)");
      return true;
    }
    const dev = argv.find((a) => a.startsWith("/dev/"));
    if (dev === "/dev/sda" || dev === "/dev/sda1") {
      io.err("Tohle je instalační flashka. fdisk na ni nespouštím — live systém z ní běží.");
      return false;
    }
    if (dev !== "/dev/nvme0n1") {
      io.err("fdisk: nelze otevřít " + (dev || "(chybí zařízení)"));
      io.note("Disk notebooku je /dev/nvme0n1. Ověř to přes lsblk.");
      return false;
    }
    const label = S.label || "dos";
    S.fdisk = {
      label,
      parts: S.parts.map((p) => ({ ...p })),
      phase: "cmd",
      freshDos: !S.label,
    };
    S.mode = "fdisk";
    S.ask = "Command (m for help):";
    io.log("Welcome to fdisk (util-linux 2.39.3).");
    io.log("Changes will remain in memory only, until you decide to write them.");
    io.log("Be careful before using the write command.");
    io.log("");
    if (!S.label) {
      io.log("Device does not contain a recognized partition table.");
      io.log("Created a new DOS (MBR) disklabel with disk identifier 0x57fceb2a.");
      io.log("");
    }
    return true;
  }

  function printParts(label, parts, io) {
    io.log("Disklabel type: " + label);
    io.log("Disk identifier: " + S.diskId);
    io.log("");
    if (!parts.length) return;
    io.log("Device            Start        End    Sectors  Size Type");
    let sector = 2048;
    const sorted = [...parts].sort((a, b) => a.num - b.num);
    for (const p of sorted) {
      const sectors = p.sizeMiB * 2048;
      const start = sector;
      const end = start + sectors - 1;
      sector = end + 1;
      io.log(devOf(p.num).padEnd(16) + String(start).padStart(8) + String(end).padStart(12) + String(sectors).padStart(12) + human(p.sizeMiB).padStart(6) + " " + typeName(p.type));
    }
  }

  function fdiskLine(line) {
    const fd = S.fdisk;
    const t = line.trim();
    const say = (s) => out(s);
    if (fd.phase === "cmd") {
      if (t === "m" || t === "?") {
        say("  g   create a new GPT disklabel");
        say("  n   add a new partition");
        say("  d   delete a partition");
        say("  t   change a partition type");
        say("  p   print the partition table");
        say("  w   write table to disk and exit");
        say("  q   quit without saving changes");
        say("  L   list known partition types (uvnitř t)");
        return;
      }
      if (t === "g") {
        fd.label = "gpt";
        fd.parts = [];
        say("Created a new GPT disklabel (GUID: " + S.diskId + ").");
        return;
      }
      if (t === "o") {
        fd.label = "dos";
        fd.parts = [];
        say("Created a new DOS (MBR) disklabel.");
        return;
      }
      if (t === "p") {
        printParts(fd.label, fd.parts, { log: say });
        return;
      }
      if (t === "n") {
        fd.phase = "partnum";
        const n = nextPart(fd.parts);
        S.ask = "Partition number (1-128, default " + n + "):";
        fd.defNum = n;
        return;
      }
      if (t === "d") {
        if (!fd.parts.length) {
          say("No partition is defined yet!");
          return;
        }
        if (fd.parts.length === 1) {
          say("Partition " + fd.parts[0].num + " has been deleted.");
          fd.parts = [];
          return;
        }
        fd.phase = "delnum";
        S.ask = "Partition number:";
        return;
      }
      if (t === "t") {
        if (!fd.parts.length) {
          say("No partition is defined yet!");
          return;
        }
        if (fd.label !== "gpt") {
          say("MBR typy (ef, 82, 83) pro tohle UEFI nerozhodují. Nejdřív g, GPT.");
        }
        if (fd.parts.length === 1) {
          fd.sel = fd.parts[0].num;
          fd.phase = "typecode";
          S.ask = "Partition type or alias (type L to list all):";
          return;
        }
        fd.phase = "typenum";
        S.ask = "Partition number:";
        return;
      }
      if (t === "w") {
        const sig = (label, parts) => label + parts.map((p) => p.num + ":" + p.sizeMiB + ":" + p.type).join(",");
        const changed = sig(S.label, S.parts) !== sig(fd.label, fd.parts);
        S.label = fd.label;
        S.parts = fd.parts.map((p) => ({ ...p }));
        if (changed) {
          S.fs = {};
          S.mounts = {};
          S.swaps = [];
          S.espAt = null;
          S.kernelOnEsp = false;
          S.bootctlEfi = false;
          S.grubEfi = false;
          S.grubCfg = false;
          if (has("base")) say("Tabulka se změnila. Formát, mount i zavaděč je potřeba udělat znovu.");
        }
        say("The partition table has been altered.");
        say("Calling ioctl() to re-read partition table.");
        say("Syncing disks.");
        const report = layoutReport();
        report.warnings.forEach((w) => out(w, "note"));
        report.errors.forEach((w) => out(w, "note"));
        S.mode = "shell";
        S.ask = null;
        S.fdisk = null;
        return;
      }
      if (t === "q") {
        say("Quit without writing.");
        S.mode = "shell";
        S.ask = null;
        S.fdisk = null;
        return;
      }
      say("Unknown command: " + t + " (m for help)");
      return;
    }
    if (fd.phase === "partnum") {
      const n = t === "" ? fd.defNum : Number(t);
      if (!Number.isInteger(n) || n < 1 || n > 128 || fd.parts.some((p) => p.num === n)) {
        say("Value out of range.");
        return;
      }
      fd.newNum = n;
      fd.phase = "first";
      S.ask = "First sector (2048-1000215215, default 2048):";
      return;
    }
    if (fd.phase === "first") {
      fd.phase = "last";
      const left = DISK_MIB - fd.parts.reduce((a, p) => a + p.sizeMiB, 0);
      S.ask = "Last sector, +/-size{K,M,G,T,P} (default " + human(left) + "):";
      return;
    }
    if (fd.phase === "last") {
      const left = DISK_MIB - fd.parts.reduce((a, p) => a + p.sizeMiB, 0);
      let size = left;
      if (t !== "") {
        const m = t.match(/^\+?(\d+)([KMGT])i?B?$/i);
        if (!m) {
          say("Unsupported suffix or value. Zkus +1G, +4G, nebo Enter pro zbytek.");
          return;
        }
        const mul = { K: 1 / 1024, M: 1, G: 1024, T: 1024 * 1024 }[m[2].toUpperCase()];
        size = Math.round(Number(m[1]) * mul);
      }
      if (size < 16 || size > left) {
        say("Value out of range.");
        return;
      }
      fd.parts.push({ num: fd.newNum, sizeMiB: size, type: fd.label === "gpt" ? 20 : 83 });
      say("Created a new partition " + fd.newNum + " of type '" + (fd.label === "gpt" ? "Linux filesystem" : "Linux") + "' and of size " + human(size) + ".");
      fd.phase = "cmd";
      S.ask = "Command (m for help):";
      return;
    }
    if (fd.phase === "delnum" || fd.phase === "typenum") {
      const n = Number(t);
      if (!fd.parts.some((p) => p.num === n)) {
        say("Partition number out of range.");
        return;
      }
      if (fd.phase === "delnum") {
        fd.parts = fd.parts.filter((p) => p.num !== n);
        say("Partition " + n + " has been deleted.");
        fd.phase = "cmd";
        S.ask = "Command (m for help):";
        return;
      }
      fd.sel = n;
      fd.phase = "typecode";
      S.ask = "Partition type or alias (type L to list all):";
      return;
    }
    if (fd.phase === "typecode") {
      if (t === "L" || t === "l") {
        Object.keys(GPT).forEach((id) => {
          say(String(id).padStart(3) + " " + GPT[id]);
        });
        say("");
        say("Aliases:");
        Object.entries(ALIAS).forEach(([k, v]) => say("   " + k.padEnd(12) + " " + v + "  " + GPT[v]));
        return;
      }
      let id = ALIAS[t.toLowerCase()];
      if (!id && /^\d+$/.test(t)) id = Number(t);
      if (!id) {
        const found = Object.entries(GPT).find(([, name]) => name.toLowerCase() === t.toLowerCase());
        if (found) id = Number(found[0]);
      }
      if (!GPT[id]) {
        say("Invalid type. L vypíše seznam. Pro Arch: 1, 19, 23.");
        return;
      }
      const p = fd.parts.find((x) => x.num === fd.sel);
      p.type = id;
      say("Changed type of partition " + p.num + " to '" + GPT[id] + "'.");
      fd.phase = "cmd";
      S.ask = "Command (m for help):";
    }
  }

  function nextPart(parts) {
    const used = new Set(parts.map((p) => p.num));
    for (let i = 1; i <= 128; i++) if (!used.has(i)) return i;
    return 1;
  }

  function refuseUsb(dev, io) {
    if (dev === "/dev/sda" || dev === "/dev/sda1" || dev === "/dev/nvme0n1") {
      io.err("odmítnuto: " + dev + (dev.includes("sda") ? " je instalační flashka" : " je celý disk, formátuje se oddíl"));
      return true;
    }
    return false;
  }

  function mkfsFat(argv, io) {
    let bits = null;
    let dev = null;
    for (let i = 1; i < argv.length; i++) {
      if (argv[i] === "-F") bits = argv[++i];
      else if (argv[i].startsWith("-F")) bits = argv[i].slice(2);
      else if (argv[i].startsWith("/dev/")) dev = argv[i];
    }
    if (refuseUsb(dev, io) || !dev) {
      if (!dev) io.err("mkfs.fat: missing device");
      return false;
    }
    const p = partByDev(dev);
    if (!p) {
      io.err("mkfs.fat: " + dev + ": No such file or directory");
      return false;
    }
    if (bits !== "32") {
      io.err("EFI System Partition má být FAT32: mkfs.fat -F 32 " + dev);
      return false;
    }
    S.fs[p.num] = { kind: "vfat", uuid: vfatId() };
    io.log("mkfs.fat 4.2 (2021-01-31)");
    return true;
  }

  function mkfsUnix(cmd, argv, io) {
    const dev = argv.find((a) => a.startsWith("/dev/"));
    const kind = cmd.split(".")[1];
    if (refuseUsb(dev, io) || !dev) return false;
    const p = partByDev(dev);
    if (!p) {
      io.err(cmd + ": " + dev + ": No such device");
      return false;
    }
    if (p.type === 1) io.note("Tohle je EFI oddíl. FAT32 patří na ESP, ext4 na root.");
    S.fs[p.num] = { kind, uuid: uuid() };
    io.log("Creating " + kind + " filesystem on " + dev);
    io.log("UUID=" + S.fs[p.num].uuid);
    return true;
  }

  function mkswap(argv, io) {
    const dev = argv.find((a) => a.startsWith("/dev/"));
    if (refuseUsb(dev, io) || !dev) return false;
    const p = partByDev(dev);
    if (!p) {
      io.err("mkswap: " + dev + ": No such file or directory");
      return false;
    }
    S.fs[p.num] = { kind: "swap", uuid: uuid() };
    io.log("Setting up swapspace version 1, UUID=" + S.fs[p.num].uuid);
    return true;
  }

  function mount(argv, io) {
    if (argv.length === 1) {
      Object.entries(S.mounts).forEach(([d, n]) => io.log(devOf(n) + " on " + d));
      return true;
    }
    const mkdirFlag = argv.includes("--mkdir");
    const pos = argv.slice(1).filter((a) => !a.startsWith("-"));
    const dev = pos[0];
    const target = pos[1];
    if (!dev || !target) {
      io.err("mount: špatný počet argumentů");
      return false;
    }
    const p = partByDev(dev);
    if (!p || !S.fs[p.num]) {
      io.err("mount: " + dev + ": unknown filesystem type");
      return false;
    }
    const dest = normPath(target);
    if (S.env === "live") {
      if (dest === "/mnt") {
        if (p.num !== rootPart()?.num) {
          io.err("mount: na /mnt patří root oddíl, ne " + dev);
          return false;
        }
        S.mounts["/mnt"] = p.num;
        io.log("");
        return true;
      }
      if (!S.mounts["/mnt"]) {
        io.note("/mnt ještě není root. " + dest + " by skončil na live overlayi a po restartu zmizel.");
        io.err("mount: " + dest + ": mount point does not exist");
        return false;
      }
      if (!mkdirFlag && dest !== "/mnt/boot" && dest !== "/mnt/efi" && dest !== "/mnt/boot/efi") {
        io.err("mount: " + dest + ": mount point does not exist");
        io.note("ESP dej na /mnt/boot (příklad z wiki), /mnt/efi nebo /mnt/boot/efi. mkdir -p nebo mount --mkdir.");
        return false;
      }
      if (["/mnt/boot", "/mnt/efi", "/mnt/boot/efi"].includes(dest) === false && !mkdirFlag) {
        io.err("mount: " + dest + ": mount point does not exist");
        return false;
      }
      if (p.type !== 1 || S.fs[p.num].kind !== "vfat") {
        io.err("mount: wrong fs type, bad option, bad superblock on " + dev);
        return false;
      }
      S.mounts[dest] = p.num;
      S.espAt = dest.slice(4);
      if (S.espAt !== "/boot") io.note("ESP je na " + S.espAt + ". systemd-boot z toho jádro na ext4 nenačte. Wiki příklad má ESP na /boot. GRUB ext4 umí.");
      return true;
    }
    if (dest === "/boot" || dest === "/efi" || dest === "/boot/efi") {
      if (p.type !== 1) {
        io.err("mount: wrong fs type");
        return false;
      }
      S.espAt = dest;
      S.mounts["/mnt" + dest] = p.num;
      return true;
    }
    io.err("mount: " + dest + ": mount point does not exist");
    return false;
  }

  function umount(argv, io) {
    const recursive = argv.includes("-R") || argv.includes("-r");
    const target = argv.find((a) => a.startsWith("/"));
    if (!target) {
      io.err("umount: missing operand");
      return false;
    }
    const dest = normPath(target);
    if (recursive && (dest === "/mnt" || dest === "/")) {
      S.mounts = {};
      return true;
    }
    if (S.mounts[dest] != null) {
      delete S.mounts[dest];
      if (S.espAt && dest.endsWith(S.espAt)) S.espAt = null;
      return true;
    }
    io.err("umount: " + target + ": not mounted.");
    return false;
  }

  function swapon(argv, io) {
    const dev = argv.find((a) => a.startsWith("/dev/"));
    const p = dev && partByDev(dev);
    if (!p || !S.fs[p.num] || S.fs[p.num].kind !== "swap") {
      io.err("swapon: " + (dev || "") + ": read swap header failed");
      return false;
    }
    if (!S.swaps.includes(p.num)) S.swaps.push(p.num);
    return true;
  }

  function blkid(argv, io) {
    const dev = argv.find((a) => a.startsWith("/dev/"));
    const parts = dev ? [partByDev(dev)].filter(Boolean) : S.parts;
    if (dev && !parts.length) {
      io.err("blkid: " + dev + ": No such device");
      return false;
    }
    for (const p of parts) {
      const fs = S.fs[p.num];
      if (!fs) continue;
      io.log(devOf(p.num) + ': UUID="' + fs.uuid + '" TYPE="' + fs.kind + '"');
    }
    return true;
  }

  async function pacstrap(argv, io) {
    if (S.env !== "live") {
      io.err("pacstrap patří do live ISO, ne do chrootu. Uvnitř je pacman -S.");
      return false;
    }
    if (S.mounts["/mnt"] !== rootPart()?.num) {
      io.err("==> ERROR: /mnt is not a mountpoint");
      return false;
    }
    const flags = argv.filter((a) => a.startsWith("-"));
    const pos = argv.filter((a) => !a.startsWith("-")).slice(1);
    if (pos[0] !== "/mnt") {
      io.err("pacstrap: cíl má být /mnt");
      return false;
    }
    const pkgs = pos.slice(1);
    if (!pkgs.length) {
      io.err("pacstrap: chybí balíčky");
      return false;
    }
    if (!flags.includes("-K")) io.note("Wiki používá pacstrap -K, ať se v novém systému inicializuje keyring. Balíčky stejně nainstaluju.");
    if (!S.clockSeen) io.note("timedatectl jsi neověřil. Podpisy by při špatných hodinách spadly.");
    if (!online()) {
      io.err("error: failed retrieving file 'core.db' from mirror.archlinux.org : Could not resolve host");
      return false;
    }
    io.log("==> Creating install root at /mnt");
    io.log("==> Installing packages to /mnt");
    if (flags.includes("-K")) io.log("==> Initializing and populating keyring");
    const ok = addPkgs(pkgs, io, "sys");
    if (!ok) return false;
    if (!S.files["/etc/locale.gen"]) {
      putFile("/etc/locale.gen", LOCALE_GEN);
      putFile("/etc/sudoers", SUDOERS);
      putFile("/etc/fstab", "");
      putFile("/etc/pacman.d/mirrorlist", (S.mirror || "Server = https://mirror.archlinux.org/$repo/os/$arch\n"));
    }
    S.kernelOnEsp = S.espAt === "/boot" && !!S.kernel;
    if (S.espAt !== "/boot") io.note("ESP není na /mnt/boot. Jádro leží na root souborovém systému v /boot a systemd-boot ho nenačte.");
    for (const p of expandPkgs(pkgs)) {
      io.log("instaluji " + p + "...");
      await sleep(30);
    }
    io.ok("pacstrap hotový");
    io.note("Kromě /etc/pacman.d/mirrorlist se z live ISO nic nepřenáší.");
    return true;
  }

  function genfstab(argv, io) {
    if (!argv.includes("-U") && !argv.includes("-t")) io.note("Wiki používá genfstab -U, UUID přežije změnu jména zařízení.");
    if (S.mounts["/mnt"] == null) {
      io.err("genfstab: /mnt není připojený");
      return false;
    }
    fstabText().trimEnd().split("\n").forEach((l) => io.log(l));
    return true;
  }

  function archChroot(argv, io) {
    if (S.env !== "live") {
      io.err("arch-chroot: už v chrootu jsi");
      return false;
    }
    if (!argv.includes("/mnt")) {
      io.err("usage: arch-chroot -S /mnt");
      return false;
    }
    if (S.mounts["/mnt"] !== rootPart()?.num || !has("base")) {
      io.err("mount: /mnt/bin/bash: No such file or directory");
      io.note("Nejdřív mount rootu a pacstrap base.");
      return false;
    }
    const systemd = argv.includes("-S");
    S.env = "chroot";
    S.cwd = "/";
    S.user = "root";
    if (systemd) {
      S.sawS = true;
      io.log("==> Starting systemd in the chroot (-S)");
    } else {
      io.log("==> Entering chroot");
      io.note("Bez -S bootctl a efibootmgr nezapíšou UEFI proměnné. Wiki: arch-chroot -S /mnt");
    }
    return true;
  }

  function pacman(argv, io) {
    if (argv.includes("-Syu")) {
      if (!online()) {
        io.err("error: failed retrieving file");
        return false;
      }
      io.log(":: Starting full system upgrade...");
      io.log(" there is nothing to do");
      return true;
    }
    const idx = argv.findIndex((a) => a === "-S" || a === "-Sy");
    if (idx < 0) {
      io.err("pacman: použij -S balíček");
      return false;
    }
    const pkgs = argv.slice(idx + 1).filter((a) => !a.startsWith("-"));
    if (!pkgs.length) {
      io.err("pacman: missing target");
      return false;
    }
    if (!online()) {
      io.err("error: failed retrieving file '" + pkgs[0] + "' : Could not resolve host");
      io.note(S.env === "system" ? "Po restartu je potřeba síť znovu. nmcli nebo iwctl." : "Nejdřív ping na síť v live ISO.");
      return false;
    }
    if (S.env === "live") io.note("pacman -S v live ISO instaluje do RAM. Do nového systému patří pacstrap, nebo pacman až v chrootu.");
    if (!addPkgs(pkgs, io)) return false;
    expandPkgs(pkgs).forEach((p) => io.log("installing " + p + "..."));
    io.ok("hotovo");
    return true;
  }

  function reflector(argv, io) {
    if (S.env !== "live" && !has("reflector")) {
      io.err("reflector: command not found");
      return false;
    }
    if (S.env === "live" && !S.livePkgs.includes("reflector")) {
      io.err("reflector: command not found");
      io.note("Na ISO není. pacman -S reflector, nebo nech mirrorlist jak je. Není to povinný krok.");
      return false;
    }
    if (!online()) {
      io.err("reflector: failed to retrieve mirrorstatus");
      return false;
    }
    S.mirror = "Server = https://mirror.cesnet.cz/archlinux/$repo/os/$arch\nServer = https://ftp.linux.cz/pub/linux/arch/$repo/os/$arch\n";
    io.log("mirrorlist: Czechia, seřazeno podle rychlosti");
    void argv;
    return true;
  }

  function localeGen(io) {
    if (!installedReady() || S.env === "live") {
      io.err("locale-gen: v live systému tohle nemění novou instalaci");
      return false;
    }
    const text = fileText("/etc/locale.gen") || "";
    const list = [];
    for (const line of text.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      list.push(t.split(/\s+/)[0]);
    }
    S.generated = list;
    io.log("Generating locales...");
    if (!list.length) io.log("  (nic není odkomentované)");
    list.forEach((l) => io.log("  " + l + "... done"));
    io.log("Generation complete.");
    return true;
  }

  function hwclock(argv, io) {
    if (!argv.includes("--systohc")) {
      io.err("hwclock: čekám --systohc");
      return false;
    }
    if (S.env === "live") {
      io.err("hwclock v live ISO by přepsal hodiny instalačního systému. Patří do chrootu, až je localtime.");
      return false;
    }
    if (!S.tz) {
      io.err("/etc/localtime není nastavený. Nejdřív ln -sf zoneinfo /etc/localtime.");
      return false;
    }
    S.hwclock = true;
    putFile("/etc/adjtime", "0.0 0 0.0\n0\nUTC\n");
    return true;
  }

  function passwd(argv, io) {
    if (S.env === "live") {
      io.err("passwd v live ISO po restartu zmizí. Heslo roota se nastavuje v chrootu.");
      return false;
    }
    const name = argv[1] || "root";
    if (name !== "root" && !S.users.some((u) => u.name === name)) {
      io.err("passwd: user '" + name + "' does not exist");
      return false;
    }
    if (S.user !== "root" && name !== S.user) {
      io.err("passwd: Permission denied");
      return false;
    }
    S.mode = "pass";
    S.passFor = name;
    S.ask = "New password:";
    io.log("Changing password for " + name + ".");
    return true;
  }

  function passLine(line) {
    if (S.mode === "pass") {
      if (!line) {
        out("passwd: password unchanged", "err");
        S.mode = "shell";
        S.ask = null;
        return;
      }
      S.pass1 = line;
      S.mode = "pass2";
      S.ask = "Retype new password:";
      return;
    }
    if (line !== S.pass1) {
      out("passwd: passwords do not match", "err");
      S.mode = "shell";
      S.ask = null;
      return;
    }
    if (S.passFor === "root") S.rootPass = line;
    else {
      const u = S.users.find((x) => x.name === S.passFor);
      if (u) u.pass = line;
    }
    out("passwd: password updated successfully", "ok");
    if (line.length < 4) out("heslo je krátké, passwd ho stejně vzal", "note");
    S.mode = "shell";
    S.ask = null;
    S.pass1 = null;
  }

  function useradd(argv, io) {
    if (S.user !== "root") {
      io.err("useradd: Permission denied");
      return false;
    }
    if (!installedReady() || S.env === "live") {
      io.err("useradd: v live systému uživatel nepřežije restart");
      return false;
    }
    let home = false;
    let groups = [];
    let shell = "/bin/bash";
    const pos = [];
    for (let i = 1; i < argv.length; i++) {
      const a = argv[i];
      if (a === "--create-home") home = true;
      else if (a === "-G" || a === "--groups") groups = (argv[++i] || "").split(",").filter(Boolean);
      else if (a === "-s" || a === "--shell") shell = argv[++i];
      else if (a.startsWith("-") && !a.startsWith("--")) {
        for (const f of a.slice(1)) {
          if (f === "m") home = true;
          else if (f === "G") groups = (argv[++i] || "").split(",").filter(Boolean);
          else if (f === "s") shell = argv[++i];
        }
      } else pos.push(a);
    }
    const name = pos[0];
    if (!name || !/^[a-z_][a-z0-9_-]*$/.test(name) || name === "root") {
      io.err("useradd: invalid user name");
      return false;
    }
    if (S.users.some((u) => u.name === name)) {
      io.err("useradd: user '" + name + "' already exists");
      return false;
    }
    S.users.push({ name, home, groups, shell, pass: null });
    if (home) putFile("/home/" + name + "/.bashrc", "# ~/.bashrc\n");
    else io.note("Bez -m nevznikne home. Window manager pak nemá kam dát konfiguraci.");
    return true;
  }

  function usermod(argv, io) {
    if (S.user !== "root") {
      io.err("usermod: Permission denied");
      return false;
    }
    let groups = null;
    const pos = [];
    for (let i = 1; i < argv.length; i++) {
      const a = argv[i];
      if (a === "-aG" || a === "-a" || a === "-G") {
        if (a === "-a") continue;
        groups = (argv[++i] || "").split(",").filter(Boolean);
      } else if (!a.startsWith("-")) pos.push(a);
    }
    const u = S.users.find((x) => x.name === pos[0]);
    if (!u || !groups) {
      io.err("usermod: usage usermod -aG skupina uživatel");
      return false;
    }
    for (const g of groups) if (!u.groups.includes(g)) u.groups.push(g);
    return true;
  }

  function bootctl(argv, io) {
    if (S.env === "live") {
      io.err("bootctl v live ISO by sahal na flashku. Spusť ho v chrootu.");
      return false;
    }
    if (!has("base")) {
      io.err("bootctl: command not found");
      return false;
    }
    if (argv[1] === "status" || argv.length === 1) {
      io.log("System: firmware UEFI 64bit");
      io.log("Boot into firmware: supported");
      return true;
    }
    if (argv[1] !== "install") {
      io.err("bootctl: install | status");
      return false;
    }
    if (S.espAt !== "/boot" && S.espAt !== "/efi" && S.espAt !== "/boot/efi") {
      io.err("Couldn't find EFI system partition. Mount ESP on /boot, /efi or /boot/efi.");
      return false;
    }
    S.bootctlFiles = true;
    S.dirs.push("/boot/loader", "/boot/loader/entries");
    io.log('Copied "/usr/lib/systemd/boot/efi/systemd-bootx64.efi" to "' + S.espAt + '/EFI/systemd/systemd-bootx64.efi".');
    io.log('Copied "/usr/lib/systemd/boot/efi/systemd-bootx64.efi" to "' + S.espAt + '/EFI/BOOT/BOOTX64.EFI".');
    io.log("Random seed file " + S.espAt + "/loader/random-seed successfully written.");
    if (S.env === "chroot" && !S.sawS) {
      io.err("Not operating on EFI variables, as the system is running inside a chroot without systemd.");
      io.note("Wiki u systemd-boot: do chrootu vstup přes arch-chroot -S.");
      return true;
    }
    S.bootctlEfi = true;
    io.log('Created EFI boot entry "Linux Boot Manager".');
    if (!S.kernelOnEsp) io.note("EFI aplikace je na ESP, jádro ale na ESP není. U systemd-boot musí pacstrap/pacman -S linux proběhnout s ESP na /boot.");
    return true;
  }

  function systemctl(argv, io) {
    const enable = argv.includes("enable");
    const now = argv.includes("--now") || argv.includes("start");
    const name = argv.find((a) => !a.startsWith("-") && a !== "systemctl" && a !== "enable" && a !== "start" && a !== "status");
    if (argv.includes("status") && name) {
      io.log(name + " - " + (serviceActive(name.replace(".service", "")) ? "active" : "inactive"));
      return true;
    }
    if (!name || (!enable && !now)) {
      io.err("systemctl: enable služba");
      return false;
    }
    const unit = name.replace(/\.service$/, "");
    const pkgMap = {
      NetworkManager: "networkmanager",
      iwd: "iwd",
      seatd: "seatd",
    };
    if (pkgMap[unit] && !has(pkgMap[unit])) {
      io.err("Failed to enable unit: Unit " + unit + ".service not found.");
      return false;
    }
    if (unit === "systemd-networkd" || unit === "systemd-resolved" || unit === "systemd-timesyncd") {
      if (!has("base")) {
        io.err("Unit not found.");
        return false;
      }
    }
    if (enable) {
      if (!S.enabled.includes(unit)) S.enabled.push(unit);
      io.log("Created symlink /etc/systemd/system/multi-user.target.wants/" + unit + ".service → /usr/lib/systemd/system/" + unit + ".service.");
    }
    if (now) {
      if (S.env === "chroot") io.note("--now v chrootu službu na železe nespustí. Po rebootu ji nastartuje enable.");
      else if (S.booted) {
        if (!S.started.includes(unit)) S.started.push(unit);
        io.log("Started " + unit + ".");
      }
    }
    return true;
  }

  function grubInstall(argv, io) {
    if (S.env === "live") {
      io.err("grub-install patří do chrootu.");
      return false;
    }
    if (!has("grub") || !has("efibootmgr")) {
      io.err("grub-install: command not found");
      io.note("pacman -S grub efibootmgr");
      return false;
    }
    const target = argv.find((a) => a.startsWith("--target="));
    const efi = argv.find((a) => a.startsWith("--efi-directory="));
    if (target !== "--target=x86_64-efi") {
      io.err("Pro tohle UEFI je --target=x86_64-efi.");
      return false;
    }
    const dir = efi ? efi.slice("--efi-directory=".length) : null;
    if (!dir || dir !== S.espAt) {
      io.err("EFI directory " + (dir || "(chybí)") + " nesedí s připojeným ESP (" + S.espAt + ").");
      return false;
    }
    if (S.env === "chroot" && !S.sawS) {
      io.err("efibootmgr: Could not prepare Boot variable: No such file or directory");
      io.note("Chroot bez -S nezapíše UEFI proměnné.");
      return false;
    }
    S.grubEfi = true;
    io.log("Installation finished. No error reported.");
    return true;
  }

  function grubMkconfig(argv, io) {
    if (!has("grub")) {
      io.err("grub-mkconfig: command not found");
      return false;
    }
    const o = argv.indexOf("-o");
    if (argv[o + 1] !== "/boot/grub/grub.cfg") {
      io.err("grub-mkconfig -o /boot/grub/grub.cfg");
      return false;
    }
    S.dirs.push("/boot/grub");
    const kp = kernelPaths();
    putFile("/boot/grub/grub.cfg", "# generated by grub-mkconfig\n");
    S.grubCfg = true;
    S.ucodeFresh = has("intel-ucode");
    io.log("Found linux image: /boot" + kp.linux);
    if (has("intel-ucode")) io.log("Found Intel Microcode image: /boot/intel-ucode.img");
    io.log("Found initrd image: /boot" + kp.initrd);
    io.log("done");
    return true;
  }

  function edit(cmd, argv, io) {
    if (cmd === "visudo") {
      if (S.user !== "root") {
        io.err("visudo: /etc/sudoers: Permission denied");
        return false;
      }
      if (!has("sudo")) {
        io.err("visudo: command not found");
        io.note("pacman -S sudo");
        return false;
      }
      openEditor("/etc/sudoers", true);
      return true;
    }
    const path = argv[1];
    if (!path) {
      io.err(cmd + ": missing file");
      return false;
    }
    const res = resolveInstalled(path);
    if (!res.ok) {
      io.err(cmd + ": " + path + ": nelze otevřít");
      return false;
    }
    if (!installedReady()) {
      io.err(cmd + ": " + path + ": No such file or directory");
      return false;
    }
    if (!dirExists(parentOf(res.sys)) && fileText(res.sys) == null) {
      io.err(cmd + ": " + path + ": No such file or directory");
      return false;
    }
    openEditor(res.sys, false);
    return true;
  }

  function openEditor(path, visudo) {
    editor = { path, visudo };
    $("editor-title").textContent = (visudo ? "visudo" : "nano") + "  " + path;
    $("editor-text").value = fileText(path) ?? "";
    $("editor").classList.remove("hidden");
    $("editor-text").focus();
  }

  function saveEditor() {
    if (!editor) return;
    let text = $("editor-text").value;
    if (!text.endsWith("\n")) text += "\n";
    if (editor.visudo) {
      const check = sudoersSyntax(text);
      if (!check.ok) {
        out("visudo: >>> syntax error", "err");
        out("visudo: změny zahozeny, sudoers je pořád původní", "err");
        return;
      }
    }
    putFile(editor.path, text);
    out("zapsáno " + editor.path, "ok");
  }

  function exitCmd(io) {
    if (S.env === "chroot") {
      S.env = "live";
      S.cwd = "/root";
      S.user = "root";
      io.log("exit chroot");
      return true;
    }
    if (S.booted) {
      S.mode = "login";
      S.ask = (hostnameNow() || "archlinux") + " login:";
      S.user = "root";
      io.log("logout");
      return true;
    }
    io.err("už není kam vystoupit");
    return false;
  }

  async function reboot(io) {
    if (S.env === "chroot") {
      io.note("Reboot z chrootu restartuje celý stroj. Wiki nejdřív říká exit.");
    }
    const problems = bootProblems();
    io.log("reboot: restartuji...");
    await sleep(200);
    S.env = "live";
    S.mounts = {};
    S.inChroot = false;
    S.user = "root";
    S.cwd = "/root";
    S.mode = "shell";
    S.ask = null;
    if (problems.length) {
      out("Firmware: No bootable device.", "err");
      problems.forEach((p) => out(p, "note"));
      out("Flashka je zpátky v portu, jsi znovu v live ISO. Oddíly a soubory na disku zůstaly, nic není připojené.", "note");
      show("install");
      return true;
    }
    show("eject");
    playEject();
    return true;
  }

  function su(argv, io) {
    const rest = argv.slice(1).filter((a) => a !== "-");
    const target = rest[0] || "root";
    if (target === "root") {
      if (S.user === "root") {
        S.cwd = "/root";
        return true;
      }
      S.mode = "supass";
      S.pending = { su: true };
      S.ask = "Password:";
      return true;
    }
    const u = S.users.find((x) => x.name === target);
    if (!u) {
      io.err("su: user " + target + " does not exist");
      return false;
    }
    if (S.user !== "root") {
      io.err("su: Authentication failure");
      return false;
    }
    if (!u.home) {
      io.note("Uživatel nemá home. su ho přepne, startx ale nebude mít kam psát.");
    }
    S.user = u.name;
    S.cwd = u.home ? "/home/" + u.name : "/";
    S.sudoCached = false;
    return true;
  }

  async function suPassLine(line) {
    const pending = S.pending;
    S.mode = "shell";
    S.ask = null;
    S.pending = null;
    const u = S.users.find((x) => x.name === S.user);
    if (!u || line !== u.pass) {
      out("Sorry, try again.", "err");
      return;
    }
    S.sudoCached = true;
    if (pending && pending.su) {
      S.user = "root";
      S.cwd = "/root";
      return;
    }
    if (pending && pending.argv) {
      const prev = S.user;
      S.user = "root";
      const io = ioPair();
      const ok = await dispatch(pending.argv, io, true);
      if (ok) writeOut(pending.redir, io.stdout);
      S.user = prev;
    }
  }

  function nmcli(argv, io) {
    if (!has("networkmanager")) {
      io.err("nmcli: command not found");
      return false;
    }
    if (!serviceActive("NetworkManager")) {
      io.err("Error: NetworkManager is not running.");
      return false;
    }
    const joined = argv.join(" ");
    if (!/wifi connect/.test(joined)) {
      io.err("nmcli device wifi connect SSID password HESLO");
      return false;
    }
    const ssid = argv[argv.indexOf("connect") + 1];
    const pass = argv[argv.indexOf("password") + 1];
    if (ssid !== "arch-home" || pass !== "wiki4life") {
      io.err("Error: Connection activation failed: Secrets were required");
      return false;
    }
    S.systemOnline = true;
    S.wifi = true;
    io.ok("Device 'wlan0' successfully activated.");
    return true;
  }

  function git(argv, io) {
    if (argv[1] !== "clone" || !argv[2]) {
      io.err("git clone URL");
      return false;
    }
    if (!has("git")) {
      io.err("git: command not found");
      io.note("pacman -S git");
      return false;
    }
    if (!online()) {
      io.err("fatal: unable to access: Could not resolve host");
      return false;
    }
    const url = argv[2].replace(/\.git$/, "");
    const name = url.split("/").pop();
    if (name !== "dwm" && name !== "st") {
      io.err("fatal: repository not found (hra umí jen git.suckless.org/dwm a /st)");
      return false;
    }
    if (!url.includes("suckless.org")) {
      io.err("fatal: repository not found");
      return false;
    }
    const dest = (S.cwd === "/" ? "" : S.cwd) + "/" + name;
    if ((S.repos || []).includes(dest)) {
      io.err("fatal: destination path '" + name + "' already exists");
      return false;
    }
    S.repos = S.repos || [];
    S.repos.push(dest);
    io.log("Cloning into '" + name + "'...");
    io.ok("hotovo " + dest);
    return true;
  }

  function make(argv, io, asRoot) {
    const repo = (S.repos || []).find((r) => S.cwd === r || S.cwd.startsWith(r + "/"));
    if (!repo) {
      io.err("make: *** No targets specified and no makefile found.  Stop.");
      return false;
    }
    if (!has("make") || !has("gcc") || !has("libx11") || !has("libxft") || !has("libxinerama")) {
      io.err("make: cc: No such file or directory");
      io.note("pacman -S base-devel libx11 libxft libxinerama");
      return false;
    }
    const install = argv.includes("install");
    if (install) {
      const root = asRoot || S.user === "root";
      if (!root) {
        io.err("install: cannot create regular file '/usr/local/bin': Permission denied");
        io.note("sudo make install");
        return false;
      }
      if (!S.built[repo]) {
        io.err("make: nic není přeložené, nejdřív make");
        return false;
      }
      if (repo.endsWith("/dwm")) S.dwmInstalled = true;
      if (repo.endsWith("/st")) S.stInstalled = true;
      io.ok("install: /usr/local/bin/" + repo.split("/").pop());
      return true;
    }
    S.built[repo] = true;
    io.log("cc -c -std=c99 -pedantic -Wall -Os " + repo.split("/").pop() + ".c");
    io.ok("make hotovo");
    return true;
  }

  function refuseRootWm(io) {
    if (S.user === "root") {
      io.err("Nespouštěj grafické sezení jako root. Přihlas se jako uživatel (su - jméno, nebo logout a login).");
      return true;
    }
    return false;
  }

  function finishWm(id, notes) {
    const missing = STEPS.filter((s) => s.id !== "wm" && !s.done());
    if (missing.length) {
      $("wm-float-title").textContent = id + " běží";
      $("wm-float-text").textContent = "Sezení naběhlo. Než to počítám jako hotovou instalaci, zbývá: " + missing.map((m) => m.title).join(", ") + ".";
      $("wm-float").classList.remove("hidden");
      drawDesktop($("pix-wm").getContext("2d"), id);
      notes.forEach((n) => out(n, "note"));
      return;
    }
    S.wm = id;
    $("win-title").textContent = id.toUpperCase();
    const sec = Math.max(1, Math.round((Date.now() - S.t0) / 1000));
    const purity = Math.max(0, 100 - S.hints * 8);
    $("win-stats").textContent = `Window manager běží. Čistota ${purity}/100 · čas ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")} · příkazů ${S.cmds} · nápověd ${S.hints}.`;
    const ul = $("win-notes");
    ul.innerHTML = "";
    const bits = [
      "Postup sedí s Installation guide, systemd-boot a wiki vybraného WM.",
      "ISO v téhle hře je vydání 2026.09.01, jádro 7.2.2.",
      ...notes,
    ];
    for (const b of bits) {
      const li = document.createElement("li");
      li.textContent = b;
      ul.appendChild(li);
    }
    show("win");
    drawDesktop($("pix-win").getContext("2d"), id);
  }

  function startx(io) {
    if (refuseRootWm(io)) return false;
    if (!has("xorg-server") || !has("xorg-xinit")) {
      io.err("startx: command not found");
      io.note("pacman -S xorg-server xorg-xinit");
      return false;
    }
    const text = fileText(xinitPath()) || "";
    const rules = [
      { id: "i3", re: /exec\s+(\/usr\/bin\/)?i3\b/, need: ["i3-wm"], term: true },
      { id: "awesome", re: /exec\s+(\/usr\/bin\/)?awesome\b/, need: ["awesome"], term: true },
      { id: "openbox", re: /exec\s+(\/usr\/bin\/)?openbox-session\b/, need: ["openbox"], term: true },
      { id: "bspwm", re: /exec\s+(\/usr\/bin\/)?bspwm\b/, need: ["bspwm", "sxhkd"], term: true, bspwm: true },
      { id: "dwm", re: /exec\s+(\/usr\/bin\/)?dwm\b/, need: [], term: false, dwm: true },
    ];
    const hit = rules.find((r) => r.re.test(text));
    if (!hit) {
      io.err("xinit: connection to X server lost");
      io.note("~/.xinitrc tohoto uživatele neobsahuje exec i3|awesome|openbox-session|bspwm|dwm. Soubor v /root/.xinitrc se při startx uživatele nečte.");
      return false;
    }
    for (const n of hit.need) {
      if (!has(n)) {
        io.err(hit.id + ": command not found");
        return false;
      }
    }
    if (hit.term && !hasTerm()) {
      io.err("V ~/.xinitrc se WM spustí, ale není tu terminál, který výchozí konfigurace umí otevřít (xterm, kitty, alacritty, foot…).");
      return false;
    }
    if (hit.bspwm) {
      const rc = "/home/" + S.user + "/.config/bspwm/bspwmrc";
      const keys = "/home/" + S.user + "/.config/sxhkd/sxhkdrc";
      if (!fileText(rc) || !S.exec[rc] || !fileText(keys)) {
        io.err("bspwm naběhl bez kláves. Chybí spustitelný ~/.config/bspwm/bspwmrc a ~/.config/sxhkd/sxhkdrc.");
        io.note("Ukázka je v /usr/share/doc/bspwm/examples/. bspwmrc musí být spustitelný.");
        return false;
      }
    }
    if (hit.dwm) {
      if (!S.dwmInstalled) {
        io.err("dwm: command not found");
        io.note("dwm se instaluje překladem: git clone https://git.suckless.org/dwm && make && sudo make install");
        return false;
      }
      if (!S.stInstalled) {
        io.err("dwm běží, ale config.h spouští terminál st, který není nainstalovaný.");
        io.note("git clone https://git.suckless.org/st && make && sudo make install");
        return false;
      }
    }
    io.ok("X session: " + hit.id);
    finishWm(hit.id, []);
    return true;
  }

  function startSway(io) {
    if (refuseRootWm(io)) return false;
    if (!has("sway")) {
      io.err("sway: command not found");
      return false;
    }
    if (!has("foot") || !has("wmenu")) {
      io.err("Sway by nastartoval s /etc/sway/config, která volá foot a wmenu. Bez nich Super+Enter a Super+D nic neudělají.");
      io.note("pacman -S foot wmenu");
      return false;
    }
    io.ok("sway");
    finishWm("sway", ["Sway je dlaždicový Wayland kompozitor, náhrada i3. Tvoje GPU je Intel Iris Xe, proprietární NVIDIA tu není."]);
    return true;
  }

  function startHypr(cmd, io) {
    if (refuseRootWm(io)) return false;
    if (!has("hyprland")) {
      io.err(cmd + ": command not found");
      return false;
    }
    const u = S.users.find((x) => x.name === S.user);
    const seat = has("seatd") && serviceActive("seatd") && u && u.groups.includes("seat");
    if (!has("polkit") && !seat) {
      io.err("Hyprland failed to start");
      io.note("Wiki: nainstaluj polkit, nebo zapni seatd.service a dej uživatele do skupiny seat.");
      return false;
    }
    const notes = [];
    if (cmd === "Hyprland") notes.push("Příkaz Hyprland sezení spustil. Aktuální wiki už chce start-hyprland (crash recovery a safe mode).");
    notes.push("Od Hyprland 0.55 je konfigurace v ~/.config/hypr/hyprland.lua. Balíček ukázku založí sám.");
    io.ok(cmd);
    finishWm("hyprland", notes);
    return true;
  }

  function loginLine(line) {
    if (S.mode === "login") {
      S.pending = line.trim();
      S.mode = "loginpass";
      S.ask = "Password:";
      return;
    }
    const name = S.pending;
    const pass = line;
    const ok = (name === "root" && pass === S.rootPass) || S.users.some((u) => u.name === name && u.pass === pass);
    S.mode = "shell";
    S.ask = null;
    if (!ok) {
      out("Login incorrect", "err");
      S.mode = "login";
      S.ask = (hostnameNow() || "archlinux") + " login:";
      return;
    }
    S.user = name;
    S.cwd = homeOf(name);
    S.env = "system";
    out("Last login: " + new Date().toUTCString() + " on tty1", "dim");
    if (!S.systemOnline) out("Síť z live ISO se nepřenáší. Připoj arch-home znovu.", "note");
  }

  function enterInstalled() {
    S.booted = true;
    S.env = "system";
    S.mode = "login";
    S.ask = (hostnameNow() || "archlinux") + " login:";
    S.user = "root";
    S.cwd = "/root";
    S.wifi = false;
    show("install");
    out("Arch Linux 7.2.2-arch1-1 (tty1)", "ok");
    out("");
    render();
    $("cmd").focus();
  }

  let fwIndex = 0;
  let bootIndex = 0;

  function renderFirmware() {
    const items = [
      "Secure Boot          [" + (S.secureBoot ? "Enabled" : "Disabled") + "]",
      "Boot order           USB, NVMe",
      "Save & Exit",
    ];
    const ul = $("fw-list");
    ul.innerHTML = "";
    items.forEach((label, i) => {
      const li = document.createElement("li");
      li.textContent = label;
      li.className = i === fwIndex ? "active" : "";
      li.addEventListener("click", () => {
        fwIndex = i;
        firmwareDo();
      });
      ul.appendChild(li);
    });
    $("fw-help").textContent = S.secureBoot
      ? "Instalační ISO Secure Boot neumí. Než uložíš, vypni ho."
      : "Secure Boot je vypnutý. Save & Exit nabootuje z flashky.";
  }

  function firmwareDo() {
    if (fwIndex === 0) {
      S.secureBoot = !S.secureBoot;
      renderFirmware();
      return;
    }
    if (fwIndex === 2) {
      S.secureOff = !S.secureBoot;
      show("menu");
      bootIndex = 0;
      renderBoot();
    }
  }

  function renderBoot() {
    const items = [
      "Arch Linux install medium",
      "Arch Linux install medium (copy to RAM)",
      "UEFI Shell",
      "Reboot Into Firmware Interface",
    ];
    const ul = $("boot-list");
    ul.innerHTML = "";
    items.forEach((label, i) => {
      const li = document.createElement("li");
      li.textContent = label;
      li.className = i === bootIndex ? "active" : "";
      li.addEventListener("click", () => {
        bootIndex = i;
        renderBoot();
        bootDo();
      });
      ul.appendChild(li);
    });
  }

  function bootDo() {
    if (bootIndex === 3) {
      show("firmware");
      renderFirmware();
      return;
    }
    if (bootIndex === 2) {
      $("boot-list").insertAdjacentHTML("afterend", "");
      const help = document.querySelector("#screen-menu .bios-help");
      help.textContent = "Shell>  tady se Arch neinstaluje. Vyber install medium.";
      return;
    }
    if (!S.secureOff) {
      const help = document.querySelector("#screen-menu .bios-help");
      help.textContent = "Secure Boot Violation. Invalid signature. Vrať se do firmwaru a Secure Boot vypni.";
      return;
    }
    startLive(bootIndex === 1);
  }

  function startLive(copyRam) {
    if (!S.bootedIso) {
      S = fresh();
      S.secureOff = true;
      S.secureBoot = false;
    }
    S.copyRam = copyRam;
    S.bootedIso = true;
    S.env = "live";
    S.mode = "shell";
    S.ask = null;
    S.user = "root";
    S.cwd = "/root";
    show("install");
    $("output").textContent = "";
    out("Arch Linux install medium  2026.09.01", "ok");
    out("Linux archiso 7.2.2-arch1-1  x86_64", "dim");
    out("root na tty1, shell je zsh, heslo není.", "dim");
    if (copyRam) out("copytoram: ISO je v RAM. Ve firmwaru je USB pořád první, takže při rebootu flashku stejně vytáhni.", "note");
    out("Průvodce je vpravo. hint ukáže příkaz z wiki a ubere čistotu.", "dim");
    render();
    $("cmd").focus();
  }

  function px(g, x, y, w, h, c) {
    g.fillStyle = c;
    g.fillRect(x | 0, y | 0, w | 0, h | 0);
  }

  function drawScene(g, usbX, usbY, led) {
    g.clearRect(0, 0, 480, 270);
    px(g, 0, 0, 480, 270, "#1b1a22");
    px(g, 0, 188, 480, 82, "#3a2a1c");
    px(g, 0, 188, 480, 4, "#2a1d14");
    px(g, 40, 210, 70, 28, "#4a3828");
    px(g, 48, 196, 18, 14, "#d7d1c7");
    px(g, 70, 200, 28, 8, "#c45c26");
    px(g, 118, 36, 230, 150, "#2a2e33");
    px(g, 128, 46, 210, 126, "#121418");
    px(g, 136, 54, 194, 110, led ? "#102416" : "#070a08");
    if (led) {
      px(g, 148, 70, 90, 8, "#1d4a28");
      px(g, 148, 86, 120, 6, "#16381f");
      px(g, 148, 100, 70, 6, "#16381f");
    }
    px(g, 100, 186, 280, 28, "#3c4148");
    px(g, 112, 192, 250, 8, "#2a2e33");
    for (let i = 0; i < 12; i++) px(g, 116 + i * 20, 194, 14, 4, "#4d545c");
    px(g, 360, 190, 20, 14, "#101214");
    px(g, 364, 194, 12, 6, "#5c6b78");
    px(g, usbX + 16, usbY, 62, 18, "#d9d3c9");
    px(g, usbX, usbY + 3, 18, 12, "#b7c0c8");
    px(g, usbX + 4, usbY + 6, 10, 2, "#8e979e");
    px(g, usbX + 4, usbY + 10, 10, 2, "#8e979e");
    px(g, usbX + 28, usbY + 4, 34, 10, "#1796ff");
    px(g, usbX + 70, usbY + 6, 6, 6, led ? "#7CFF6B" : "#244022");
    px(g, usbX + 78, usbY - 8, 22, 16, "#f0c0a0");
    px(g, usbX + 84, usbY - 16, 10, 12, "#f0c0a0");
    px(g, usbX + 96, usbY + 2, 16, 10, "#e0b090");
  }

  function playEject() {
    const g = $("pix-eject").getContext("2d");
    const t0 = performance.now();
    function frame(now) {
      const t = now - t0;
      const k = Math.min(1, t / 900);
      const x = 346 + (430 - 346) * k;
      const y = 188 + Math.sin(k * Math.PI) * -36;
      drawScene(g, x, y, k < 1);
      if (k < 1 && document.body.dataset.screen === "eject") requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function drawDesktop(g, id) {
    g.clearRect(0, 0, 480, 270);
    const themes = {
      i3: ["#0e1116", "#3d7eae", "#1a1e24", "bottom"],
      sway: ["#141a18", "#6f9e8a", "#1c2420", "top"],
      hyprland: ["#11111b", "#89dceb", "#181825", "gaps"],
      awesome: ["#161616", "#c45c4a", "#121212", "top"],
      openbox: ["#8aa0b4", "#3a5f8a", "#d7e2ea", "float"],
      bspwm: ["#2a2e33", "#88c0d0", "#2a2e33", "none"],
      dwm: ["#111111", "#005577", "#1a1a1a", "tags"],
    };
    const [bg, accent, bar, kind] = themes[id] || themes.i3;
    px(g, 0, 0, 480, 270, bg);
    if (kind === "float") {
      px(g, 36, 40, 210, 150, "#f4f7fa");
      px(g, 36, 40, 210, 22, accent);
      px(g, 210, 90, 220, 140, "#f7fafc");
      px(g, 210, 90, 220, 22, "#6d7d8a");
      return;
    }
    if (kind === "none") {
      px(g, 10, 10, 300, 250, "#1b1f24");
      px(g, 10, 10, 4, 250, accent);
      px(g, 318, 10, 152, 250, "#232830");
      return;
    }
    if (kind === "gaps") {
      px(g, 16, 28, 290, 226, "#1e1e2e");
      px(g, 16, 28, 290, 4, accent);
      px(g, 318, 28, 146, 108, "#1e1e2e");
      px(g, 318, 148, 146, 106, "#181825");
      px(g, 0, 0, 480, 18, bar);
      px(g, 8, 4, 36, 10, accent);
      return;
    }
    const topBar = kind !== "bottom";
    const y0 = topBar ? 28 : 8;
    const h = topBar ? 234 : 214;
    px(g, 8, y0, 304, h, "#243044");
    px(g, 8, y0, 4, h, accent);
    px(g, 320, y0, 152, Math.floor(h * 0.48), "#1b2836");
    px(g, 320, y0 + Math.floor(h * 0.52), 152, h - Math.floor(h * 0.52), "#1b2836");
    if (kind === "bottom") {
      px(g, 0, 242, 480, 28, bar);
      px(g, 8, 248, 36, 16, accent);
      px(g, 50, 248, 16, 16, "#333");
      px(g, 70, 248, 16, 16, "#333");
    } else if (kind === "tags") {
      px(g, 0, 0, 480, 24, bar);
      for (let i = 0; i < 9; i++) px(g, 6 + i * 20, 4, 16, 16, i === 0 ? accent : "#333");
    } else {
      px(g, 0, 0, 480, 24, bar);
      px(g, 8, 4, 40, 16, accent);
    }
  }

  function bootKeys(e) {
    const screen = document.body.dataset.screen;
    if (screen === "firmware") {
      if (e.key === "ArrowDown") {
        fwIndex = Math.min(2, fwIndex + 1);
        renderFirmware();
      }
      if (e.key === "ArrowUp") {
        fwIndex = Math.max(0, fwIndex - 1);
        renderFirmware();
      }
      if (e.key === "Enter") firmwareDo();
    }
    if (screen === "menu") {
      if (e.key === "ArrowDown") {
        bootIndex = Math.min(3, bootIndex + 1);
        renderBoot();
      }
      if (e.key === "ArrowUp") {
        bootIndex = Math.max(0, bootIndex - 1);
        renderBoot();
      }
      if (e.key === "Enter") bootDo();
    }
    if (screen === "intro" && e.key === "Enter") $("btn-power").click();
  }

  $("btn-power").addEventListener("click", () => {
    localStorage.removeItem(KEY);
    S = fresh();
    fwIndex = 0;
    show("firmware");
    renderFirmware();
  });

  $("btn-continue").addEventListener("click", () => {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!data) return;
      S = { ...fresh(), ...data, mode: "shell", ask: null, fdisk: null };
      if (S.wm) {
        show("win");
        $("win-title").textContent = S.wm.toUpperCase();
        drawDesktop($("pix-win").getContext("2d"), S.wm);
        return;
      }
      show("install");
      out("— pokračuješ v uložené instalaci —", "dim");
      render();
    } catch {
      /* ignore broken save */
    }
  });

  $("btn-eject").addEventListener("click", () => enterInstalled());
  $("btn-keep").addEventListener("click", () => {
    show("menu");
    bootIndex = 0;
    renderBoot();
    const help = document.querySelector("#screen-menu .bios-help");
    help.textContent = "Flashka zůstala v portu, firmware znovu nabootoval ISO.";
  });

  $("btn-hint").addEventListener("click", () => {
    hintCmd();
    render();
    save();
  });

  $("btn-sound").addEventListener("click", () => {
    S.sound = !S.sound;
    $("btn-sound").textContent = S.sound ? "zvuk zap" : "zvuk vyp";
    if (S.sound) beep(520, 0.05);
    save();
  });

  $("btn-again").addEventListener("click", () => {
    localStorage.removeItem(KEY);
    location.reload();
  });

  $("btn-wm-back").addEventListener("click", () => $("wm-float").classList.add("hidden"));

  $("editor-save").addEventListener("click", () => {
    saveEditor();
    render();
    save();
  });
  $("editor-close").addEventListener("click", () => {
    $("editor").classList.add("hidden");
    editor = null;
    $("cmd").focus();
  });
  $("editor-text").addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "o") {
      e.preventDefault();
      saveEditor();
      render();
    }
    if (e.ctrlKey && e.key === "x") {
      e.preventDefault();
      $("editor").classList.add("hidden");
      editor = null;
    }
  });

  $("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const value = $("cmd").value;
    $("cmd").value = "";
    runLine(value);
  });

  $("cmd").addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!S.history.length) return;
      S.hpos = Math.max(0, S.hpos - 1);
      $("cmd").value = S.history[S.hpos] || "";
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      S.hpos = Math.min(S.history.length, S.hpos + 1);
      $("cmd").value = S.history[S.hpos] || "";
    }
    if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      $("output").textContent = "";
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const names = ["help", "hint", "lsblk", "fdisk", "loadkeys", "ping", "timedatectl", "iwctl", "pacstrap", "genfstab", "arch-chroot", "pacman", "mount", "mkfs.fat", "mkfs.ext4", "mkswap", "swapon", "blkid", "bootctl", "systemctl", "nano", "passwd", "useradd", "visudo", "reboot", "nmcli", "startx", "sway", "start-hyprland"];
      const cur = $("cmd").value;
      const hit = names.find((n) => n.startsWith(cur));
      if (hit) $("cmd").value = hit + " ";
    }
  });

  document.addEventListener("keydown", bootKeys);

  if (localStorage.getItem(KEY)) $("btn-continue").hidden = false;
})();
